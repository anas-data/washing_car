import { getDb } from "./db";
import {
  users,
  vehicles,
  parts,
  operations,
  approvals,
  alerts,
  inventoryHistory,
} from "../drizzle/schema";

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    return;
  }

  try {
    // 1. Create Users
    console.log("📝 Creating users...");

    const adminUser = await db
      .insert(users)
      .values({
        openId: "admin-001",
        email: "admin@carwash.com",
        name: "مدير النظام",
        loginMethod: "password",
      })
      .$returningId();

    const managerUser = await db
      .insert(users)
      .values({
        openId: "manager-001",
        email: "manager@carwash.com",
        name: "مدير المخزون",
        loginMethod: "password",
      })
      .$returningId();

    const operatorUser = await db
      .insert(users)
      .values({
        openId: "operator-001",
        email: "operator@carwash.com",
        name: "موظف العمليات",
        loginMethod: "password",
      })
      .$returningId();

    console.log(`✅ Created 3 users`);

    // 2. Create Vehicles
    console.log("🚗 Creating vehicles...");
    const vehicleData = [
      {
        code: "VH-001",
        name: "تانكر المياه الأول",
        plateNumber: "ج ب ج 123",
        driverName: "أحمد محمد",
        status: "active" as const,
        lastMaintenanceDate: new Date("2026-03-01"),
      },
      {
        code: "VH-002",
        name: "تانكر المياه الثاني",
        plateNumber: "ج ب ج 124",
        driverName: "محمود علي",
        status: "active" as const,
        lastMaintenanceDate: new Date("2026-02-15"),
      },
      {
        code: "VH-003",
        name: "سيارة النقل",
        plateNumber: "ج ب ج 125",
        driverName: "سالم عبدالله",
        status: "maintenance" as const,
        lastMaintenanceDate: new Date("2026-03-20"),
      },
      {
        code: "VH-004",
        name: "سيارة التوصيل",
        plateNumber: "ج ب ج 126",
        driverName: "خالد حسن",
        status: "inactive" as const,
        lastMaintenanceDate: new Date("2025-12-01"),
      },
    ];

    const createdVehicles = await db
      .insert(vehicles)
      .values(vehicleData)
      .$returningId();

    console.log(`✅ Created ${createdVehicles.length} vehicles`);

    // 3. Create Parts
    console.log("🔧 Creating parts...");
    const partsData = [
      {
        code: "PT-001",
        name: "فلتر الهواء",
        description: "فلتر هواء عالي الجودة للمحركات",
        quantityAvailable: 5,
        quantityRequired: 10,
        alertThreshold: 3,
        unit: "piece",
        category: "Filters",
        cost: "45.50",
      },
      {
        code: "PT-002",
        name: "زيت المحرك",
        description: "زيت محرك من الدرجة الأولى",
        quantityAvailable: 2,
        quantityRequired: 20,
        alertThreshold: 5,
        unit: "liter",
        category: "Oils",
        cost: "35.00",
      },
      {
        code: "PT-003",
        name: "بطارية 12V",
        description: "بطارية سيارة 12 فولت",
        quantityAvailable: 8,
        quantityRequired: 15,
        alertThreshold: 2,
        unit: "piece",
        category: "Electrical",
        cost: "150.00",
      },
      {
        code: "PT-004",
        name: "إطارات سيارة",
        description: "إطارات عالية الجودة",
        quantityAvailable: 12,
        quantityRequired: 20,
        alertThreshold: 4,
        unit: "piece",
        category: "Tires",
        cost: "200.00",
      },
      {
        code: "PT-005",
        name: "مساحات الزجاج",
        description: "مساحات زجاج السيارة",
        quantityAvailable: 1,
        quantityRequired: 10,
        alertThreshold: 3,
        unit: "piece",
        category: "Accessories",
        cost: "25.00",
      },
      {
        code: "PT-006",
        name: "سائل التبريد",
        description: "سائل تبريد المحرك",
        quantityAvailable: 15,
        quantityRequired: 30,
        alertThreshold: 8,
        unit: "liter",
        category: "Fluids",
        cost: "20.00",
      },
      {
        code: "PT-007",
        name: "شمعات الاشتعال",
        description: "شمعات اشتعال عالية الأداء",
        quantityAvailable: 0,
        quantityRequired: 12,
        alertThreshold: 4,
        unit: "piece",
        category: "Ignition",
        cost: "15.00",
      },
      {
        code: "PT-008",
        name: "وسائد الفرامل",
        description: "وسائد فرامل أمامية",
        quantityAvailable: 6,
        quantityRequired: 12,
        alertThreshold: 3,
        unit: "set",
        category: "Brakes",
        cost: "120.00",
      },
    ];

    const createdParts = await db
      .insert(parts)
      .values(partsData)
      .$returningId();

    console.log(`✅ Created ${createdParts.length} parts`);

    // 4. Create Operations
    console.log("📋 Creating operations...");
    const operationsData = [
      {
        code: "OP-001",
        operationDate: new Date(),
        operationType: "consumption" as const,
        vehicleId: createdVehicles[0].id,
        partId: createdParts[0].id,
        quantity: 2,
        driverName: "أحمد محمد",
        notes: "استبدال فلتر الهواء القديم",
        status: "pending" as const,
        createdById: operatorUser[0].id,
        approvedById: null,
        approvalDate: null,
      },
      {
        code: "OP-002",
        operationDate: new Date(Date.now() - 86400000),
        operationType: "consumption" as const,
        vehicleId: createdVehicles[1].id,
        partId: createdParts[1].id,
        quantity: 5,
        driverName: "محمود علي",
        notes: "تغيير زيت المحرك الدوري",
        status: "approved" as const,
        createdById: operatorUser[0].id,
        approvedById: managerUser[0].id,
        approvalDate: new Date(Date.now() - 43200000),
      },
      {
        code: "OP-003",
        operationDate: new Date(),
        operationType: "addition" as const,
        vehicleId: createdVehicles[0].id,
        partId: createdParts[3].id,
        quantity: 4,
        driverName: "مدير المخزون",
        notes: "استقبال إطارات جديدة من المورد",
        status: "approved" as const,
        createdById: managerUser[0].id,
        approvedById: adminUser[0].id,
        approvalDate: new Date(),
      },
      {
        code: "OP-004",
        operationDate: new Date(),
        operationType: "consumption" as const,
        vehicleId: createdVehicles[2].id,
        partId: createdParts[2].id,
        quantity: 1,
        driverName: "سالم عبدالله",
        notes: "استبدال البطارية المعطلة",
        status: "pending" as const,
        createdById: operatorUser[0].id,
        approvedById: null,
        approvalDate: null,
      },
      {
        code: "OP-005",
        operationDate: new Date(Date.now() - 172800000),
        operationType: "consumption" as const,
        vehicleId: createdVehicles[0].id,
        partId: createdParts[5].id,
        quantity: 3,
        driverName: "أحمد محمد",
        notes: "تجديد سائل التبريد",
        status: "rejected" as const,
        createdById: operatorUser[0].id,
        approvedById: managerUser[0].id,
        approvalDate: new Date(Date.now() - 129600000),
      },
    ];

    const createdOperations = await db
      .insert(operations)
      .values(operationsData)
      .$returningId();

    console.log(`✅ Created ${createdOperations.length} operations`);

    // 5. Create Approvals
    console.log("✅ Creating approvals...");
    const approvalsData = [
      {
        operationId: createdOperations[0].id,
        requestedById: operatorUser[0].id,
        level1ApproverId: managerUser[0].id,
        level2ApproverId: adminUser[0].id,
        level1Status: "pending" as const,
        level2Status: "pending" as const,
        level1RejectionReason: null,
        level2RejectionReason: null,
        level1ApprovalDate: null,
        level2ApprovalDate: null,
      },
      {
        operationId: createdOperations[1].id,
        requestedById: operatorUser[0].id,
        level1ApproverId: managerUser[0].id,
        level2ApproverId: adminUser[0].id,
        level1Status: "approved" as const,
        level2Status: "approved" as const,
        level1RejectionReason: null,
        level2RejectionReason: null,
        level1ApprovalDate: new Date(Date.now() - 43200000),
        level2ApprovalDate: new Date(Date.now() - 43200000),
      },
      {
        operationId: createdOperations[3].id,
        requestedById: operatorUser[0].id,
        level1ApproverId: managerUser[0].id,
        level2ApproverId: adminUser[0].id,
        level1Status: "pending" as const,
        level2Status: "pending" as const,
        level1RejectionReason: null,
        level2RejectionReason: null,
        level1ApprovalDate: null,
        level2ApprovalDate: null,
      },
      {
        operationId: createdOperations[4].id,
        requestedById: operatorUser[0].id,
        level1ApproverId: managerUser[0].id,
        level2ApproverId: adminUser[0].id,
        level1Status: "rejected" as const,
        level2Status: "pending" as const,
        level1RejectionReason: "الكمية المطلوبة أكثر من المتاح",
        level2RejectionReason: null,
        level1ApprovalDate: new Date(Date.now() - 129600000),
        level2ApprovalDate: null,
      },
    ];

    const createdApprovals = await db
      .insert(approvals)
      .values(approvalsData)
      .$returningId();

    console.log(`✅ Created ${createdApprovals.length} approvals`);

    // 6. Create Alerts
    console.log("⚠️ Creating alerts...");
    const alertsData = [
      {
        partId: createdParts[1].id,
        alertType: "low_stock" as const,
        message: "زيت المحرك قد انخفض إلى 2 لتر (الحد الأدنى: 5 لتر)",
        isRead: false,
        readById: null,
        readDate: null,
      },
      {
        partId: createdParts[4].id,
        alertType: "low_stock" as const,
        message: "مساحات الزجاج قد انخفضت إلى 1 قطعة (الحد الأدنى: 3 قطع)",
        isRead: false,
        readById: null,
        readDate: null,
      },
      {
        partId: createdParts[6].id,
        alertType: "out_of_stock" as const,
        message: "شمعات الاشتعال نفدت من المخزون",
        isRead: false,
        readById: null,
        readDate: null,
      },
      {
        partId: createdParts[0].id,
        alertType: "low_stock" as const,
        message: "فلتر الهواء قد انخفض إلى 5 قطع (الحد الأدنى: 3 قطع)",
        isRead: true,
        readById: managerUser[0].id,
        readDate: new Date(),
      },
      {
        partId: createdParts[3].id,
        alertType: "low_stock" as const,
        message: "الإطارات قد انخفضت إلى 12 قطعة (الحد الأدنى: 4 قطع)",
        isRead: false,
        readById: null,
        readDate: null,
      },
    ];

    await db.insert(alerts).values(alertsData);

    console.log(`✅ Created ${alertsData.length} alerts`);

    // 7. Create Inventory History
    console.log("📊 Creating inventory history...");
    const historyData = [
      {
        partId: createdParts[0].id,
        operationId: createdOperations[0].id,
        previousQuantity: 7,
        newQuantity: 5,
        changeType: "consumption" as const,
        reason: "استبدال فلتر الهواء",
        changedById: operatorUser[0].id,
      },
      {
        partId: createdParts[1].id,
        operationId: createdOperations[1].id,
        previousQuantity: 7,
        newQuantity: 2,
        changeType: "consumption" as const,
        reason: "تغيير زيت المحرك",
        changedById: operatorUser[0].id,
      },
      {
        partId: createdParts[3].id,
        operationId: createdOperations[2].id,
        previousQuantity: 8,
        newQuantity: 12,
        changeType: "addition" as const,
        reason: "استقبال من المورد",
        changedById: managerUser[0].id,
      },
    ];

    await db.insert(inventoryHistory).values(historyData);

    console.log(`✅ Created ${historyData.length} history records`);

    console.log("\n✅ Database seeding completed successfully!\n");
    console.log("\n📝 Test Data Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Users: 3 (Admin, Manager, Operator)");
    console.log("✅ Vehicles: 4 (Active, Maintenance, Inactive)");
    console.log("✅ Parts: 8 (Various categories and stock levels)");
    console.log("✅ Operations: 5 (Pending, Approved, Rejected)");
    console.log("✅ Approvals: 4 (Multi-level approval workflow)");
    console.log("✅ Alerts: 5 (Low stock and out of stock)");
    console.log("✅ Inventory History: 3 (Change tracking)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seed completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed failed:", error);
      process.exit(1);
    });
}
