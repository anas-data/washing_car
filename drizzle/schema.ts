import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  datetime,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// VEHICLES TABLE
// ============================================================================

export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  plateNumber: varchar("plateNumber", { length: 50 }).notNull().unique(),
  driverName: varchar("driverName", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "inactive", "maintenance"]).default("active").notNull(),
  lastMaintenanceDate: datetime("lastMaintenanceDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// PARTS TABLE (INVENTORY ITEMS)
// ============================================================================

export const parts = mysqlTable("parts", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  quantityAvailable: int("quantityAvailable").default(0).notNull(),
  quantityRequired: int("quantityRequired").default(0).notNull(),
  alertThreshold: int("alertThreshold").default(0).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// OPERATIONS TABLE
// ============================================================================

export const operations = mysqlTable("operations", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  operationDate: datetime("operationDate").notNull(),
  operationType: mysqlEnum("operationType", ["addition", "consumption"]).notNull(),
  vehicleId: int("vehicleId").notNull(),
  partId: int("partId").notNull(),
  quantity: int("quantity").notNull(),
  driverName: varchar("driverName", { length: 255 }).notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdById: int("createdById").notNull(),
  approvedById: int("approvedById"),
  approvalDate: datetime("approvalDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// APPROVALS TABLE (MULTI-LEVEL APPROVAL WORKFLOW)
// ============================================================================

export const approvals = mysqlTable("approvals", {
  id: int("id").autoincrement().primaryKey(),
  operationId: int("operationId").notNull().unique(),
  requestedById: int("requestedById").notNull(),
  firstLevelApproverId: int("firstLevelApproverId"),
  secondLevelApproverId: int("secondLevelApproverId"),
  firstLevelStatus: mysqlEnum("firstLevelStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  secondLevelStatus: mysqlEnum("secondLevelStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  firstLevelApprovalDate: datetime("firstLevelApprovalDate"),
  secondLevelApprovalDate: datetime("secondLevelApprovalDate"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// INVENTORY HISTORY TABLE
// ============================================================================

export const inventoryHistory = mysqlTable("inventoryHistory", {
  id: int("id").autoincrement().primaryKey(),
  partId: int("partId").notNull(),
  previousQuantity: int("previousQuantity").notNull(),
  newQuantity: int("newQuantity").notNull(),
  changeType: mysqlEnum("changeType", ["addition", "consumption", "adjustment"]).notNull(),
  operationId: int("operationId"),
  notes: text("notes"),
  changedById: int("changedById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// ALERTS TABLE
// ============================================================================

export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  partId: int("partId").notNull(),
  alertType: mysqlEnum("alertType", ["low_stock", "out_of_stock", "pending_approval"]).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  readById: int("readById"),
  readDate: datetime("readDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// DAILY REPORTS TABLE
// ============================================================================

export const dailyReports = mysqlTable("dailyReports", {
  id: int("id").autoincrement().primaryKey(),
  reportDate: datetime("reportDate").notNull(),
  totalParts: int("totalParts").notNull(),
  lowStockParts: int("lowStockParts").notNull(),
  totalConsumption: int("totalConsumption").notNull(),
  totalAdditions: int("totalAdditions").notNull(),
  totalOperations: int("totalOperations").notNull(),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// MONTHLY REPORTS TABLE
// ============================================================================

export const monthlyReports = mysqlTable("monthlyReports", {
  id: int("id").autoincrement().primaryKey(),
  year: int("year").notNull(),
  month: int("month").notNull(),
  totalConsumption: int("totalConsumption").notNull(),
  totalAdditions: int("totalAdditions").notNull(),
  totalOperations: int("totalOperations").notNull(),
  averageDailyConsumption: decimal("averageDailyConsumption", { precision: 10, scale: 2 }).notNull(),
  estimatedMaintenanceCost: decimal("estimatedMaintenanceCost", { precision: 10, scale: 2 }).notNull(),
  createdById: int("createdById").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

export type Part = typeof parts.$inferSelect;
export type InsertPart = typeof parts.$inferInsert;

export type Operation = typeof operations.$inferSelect;
export type InsertOperation = typeof operations.$inferInsert;

export type Approval = typeof approvals.$inferSelect;
export type InsertApproval = typeof approvals.$inferInsert;

export type InventoryHistory = typeof inventoryHistory.$inferSelect;
export type InsertInventoryHistory = typeof inventoryHistory.$inferInsert;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

export type DailyReport = typeof dailyReports.$inferSelect;
export type InsertDailyReport = typeof dailyReports.$inferInsert;

export type MonthlyReport = typeof monthlyReports.$inferSelect;
export type InsertMonthlyReport = typeof monthlyReports.$inferInsert;
