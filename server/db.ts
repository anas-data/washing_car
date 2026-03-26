import { eq, and, like, desc, asc, gte, lte, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  vehicles,
  parts,
  operations,
  approvals,
  inventoryHistory,
  alerts,
  dailyReports,
  monthlyReports,
  type InsertVehicle,
  type InsertPart,
  type InsertOperation,
  type InsertApproval,
  type InsertInventoryHistory,
  type InsertAlert,
  type InsertDailyReport,
  type InsertMonthlyReport,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// USERS
// ============================================================================

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return null;
  return db.select().from(users).where(eq(users.id, userId)).then((r) => r[0]);
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "admin" | "user") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ============================================================================
// VEHICLES
// ============================================================================

export async function createVehicle(data: InsertVehicle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(vehicles).values(data);
  const created = await db.select().from(vehicles).orderBy(desc(vehicles.id)).limit(1);
  return created[0]?.id || 0;
}

export async function getVehicleById(vehicleId: number) {
  const db = await getDb();
  if (!db) return null;
  return db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).then((r) => r[0]);
}

export async function getAllVehicles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
}

export async function searchVehicles(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(vehicles)
    .where(
      or(
        like(vehicles.code, `%${query}%`),
        like(vehicles.name, `%${query}%`),
        like(vehicles.plateNumber, `%${query}%`),
        like(vehicles.driverName, `%${query}%`)
      )
    )
    .orderBy(desc(vehicles.createdAt));
}

export async function updateVehicle(vehicleId: number, data: Partial<InsertVehicle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(vehicles).set(data).where(eq(vehicles.id, vehicleId));
}

export async function deleteVehicle(vehicleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(vehicles).where(eq(vehicles.id, vehicleId));
}

// ============================================================================
// PARTS (INVENTORY)
// ============================================================================

export async function createPart(data: InsertPart) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(parts).values(data);
  const created = await db.select().from(parts).orderBy(desc(parts.id)).limit(1);
  return created[0]?.id || 0;
}

export async function getPartById(partId: number) {
  const db = await getDb();
  if (!db) return null;
  return db.select().from(parts).where(eq(parts.id, partId)).then((r) => r[0]);
}

export async function getAllParts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(parts).orderBy(desc(parts.createdAt));
}

export async function searchParts(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(parts)
    .where(
      or(
        like(parts.code, `%${query}%`),
        like(parts.name, `%${query}%`),
        like(parts.description, `%${query}%`)
      )
    )
    .orderBy(desc(parts.createdAt));
}

export async function getPartsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(parts).where(eq(parts.category, category)).orderBy(desc(parts.createdAt));
}

export async function getLowStockParts() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(parts)
    .where(gte(parts.alertThreshold, parts.quantityAvailable))
    .orderBy(asc(parts.quantityAvailable));
}

export async function updatePart(partId: number, data: Partial<InsertPart>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(parts).set(data).where(eq(parts.id, partId));
}

export async function deletePart(partId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(parts).where(eq(parts.id, partId));
}

// ============================================================================
// OPERATIONS
// ============================================================================

export async function createOperation(data: InsertOperation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(operations).values(data);
  const created = await db.select().from(operations).orderBy(desc(operations.id)).limit(1);
  return created[0]?.id || 0;
}

export async function getOperationById(operationId: number) {
  const db = await getDb();
  if (!db) return null;
  return db.select().from(operations).where(eq(operations.id, operationId)).then((r) => r[0]);
}

export async function getAllOperations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(operations).orderBy(desc(operations.operationDate));
}

export async function getPendingOperations() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(operations)
    .where(eq(operations.status, "pending"))
    .orderBy(desc(operations.operationDate));
}

export async function getOperationsByVehicle(vehicleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(operations)
    .where(eq(operations.vehicleId, vehicleId))
    .orderBy(desc(operations.operationDate));
}

export async function getOperationsByPart(partId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(operations)
    .where(eq(operations.partId, partId))
    .orderBy(desc(operations.operationDate));
}

export async function updateOperationStatus(
  operationId: number,
  status: "pending" | "approved" | "rejected",
  approvedById?: number,
  approvalDate?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(operations)
    .set({
      status,
      approvedById: approvedById || undefined,
      approvalDate: approvalDate || undefined,
    })
    .where(eq(operations.id, operationId));
}

// ============================================================================
// APPROVALS
// ============================================================================

export async function createApproval(data: InsertApproval) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(approvals).values(data);
  const created = await db.select().from(approvals).orderBy(desc(approvals.id)).limit(1);
  return created[0]?.id || 0;
}

export async function getApprovalByOperationId(operationId: number) {
  const db = await getDb();
  if (!db) return null;
  return db.select().from(approvals).where(eq(approvals.operationId, operationId)).then((r) => r[0]);
}

export async function getPendingApprovalsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(approvals)
    .where(
      or(
        and(eq(approvals.firstLevelApproverId, userId), eq(approvals.firstLevelStatus, "pending")),
        and(eq(approvals.secondLevelApproverId, userId), eq(approvals.secondLevelStatus, "pending"))
      )
    )
    .orderBy(desc(approvals.createdAt));
}

export async function updateApprovalFirstLevel(
  approvalId: number,
  status: "pending" | "approved" | "rejected",
  approvalDate: Date,
  rejectionReason?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(approvals)
    .set({
      firstLevelStatus: status,
      firstLevelApprovalDate: approvalDate,
      rejectionReason: rejectionReason || undefined,
    })
    .where(eq(approvals.id, approvalId));
}

export async function updateApprovalSecondLevel(
  approvalId: number,
  status: "pending" | "approved" | "rejected",
  approvalDate: Date,
  rejectionReason?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(approvals)
    .set({
      secondLevelStatus: status,
      secondLevelApprovalDate: approvalDate,
      rejectionReason: rejectionReason || undefined,
    })
    .where(eq(approvals.id, approvalId));
}

// ============================================================================
// INVENTORY HISTORY
// ============================================================================

export async function createInventoryHistory(data: InsertInventoryHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(inventoryHistory).values(data);
  const created = await db.select().from(inventoryHistory).orderBy(desc(inventoryHistory.id)).limit(1);
  return created[0]?.id || 0;
}

export async function getInventoryHistoryByPart(partId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(inventoryHistory)
    .where(eq(inventoryHistory.partId, partId))
    .orderBy(desc(inventoryHistory.createdAt));
}

// ============================================================================
// ALERTS
// ============================================================================

export async function createAlert(data: InsertAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(alerts).values(data);
  const created = await db.select().from(alerts).orderBy(desc(alerts.id)).limit(1);
  return created[0]?.id || 0;
}

export async function getUnreadAlerts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(alerts).where(eq(alerts.isRead, false)).orderBy(desc(alerts.createdAt));
}

export async function getAllAlerts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(alerts).orderBy(desc(alerts.createdAt));
}

export async function markAlertAsRead(alertId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(alerts)
    .set({
      isRead: true,
      readById: userId,
      readDate: new Date(),
    })
    .where(eq(alerts.id, alertId));
}

// ============================================================================
// DAILY REPORTS
// ============================================================================

export async function createDailyReport(data: InsertDailyReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(dailyReports).values(data);
  const created = await db.select().from(dailyReports).orderBy(desc(dailyReports.id)).limit(1);
  return created[0]?.id || 0;
}

export async function getDailyReport(reportDate: Date) {
  const db = await getDb();
  if (!db) return null;
  return db
    .select()
    .from(dailyReports)
    .where(eq(dailyReports.reportDate, reportDate))
    .then((r) => r[0]);
}

export async function getDailyReports(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dailyReports)
    .where(and(gte(dailyReports.reportDate, startDate), lte(dailyReports.reportDate, endDate)))
    .orderBy(desc(dailyReports.reportDate));
}

// ============================================================================
// MONTHLY REPORTS
// ============================================================================

export async function createMonthlyReport(data: InsertMonthlyReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(monthlyReports).values(data);
  const created = await db.select().from(monthlyReports).orderBy(desc(monthlyReports.id)).limit(1);
  return created[0]?.id || 0;
}

export async function getMonthlyReport(year: number, month: number) {
  const db = await getDb();
  if (!db) return null;
  return db
    .select()
    .from(monthlyReports)
    .where(and(eq(monthlyReports.year, year), eq(monthlyReports.month, month)))
    .then((r) => r[0]);
}

export async function getMonthlyReports(year: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(monthlyReports)
    .where(eq(monthlyReports.year, year))
    .orderBy(asc(monthlyReports.month));
}
