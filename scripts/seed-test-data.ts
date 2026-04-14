/**
 * Test Data Seeding Script
 * Generates realistic test data for Expo Go testing
 */

import { randomUUID } from "crypto";

interface TestUser {
  id: string;
  email: string;
  name: string;
  role: "manager" | "employee";
  password: string;
}

interface TestInventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
  supplier: string;
  lastRestocked: string;
}

interface TestOperation {
  id: string;
  type: "wash" | "maintenance" | "inspection";
  date: string;
  status: "pending" | "in-progress" | "completed";
  itemsUsed: Array<{ itemId: string; quantity: number }>;
  notes: string;
  performedBy: string;
}

interface TestMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// Test Users
export const testUsers: TestUser[] = [
  {
    id: "user-manager-1",
    email: "manager@carwash.com",
    name: "أحمد المدير",
    role: "manager",
    password: "Manager@123",
  },
  {
    id: "user-employee-1",
    email: "employee1@carwash.com",
    name: "محمد الموظف",
    role: "employee",
    password: "Employee@123",
  },
  {
    id: "user-employee-2",
    email: "employee2@carwash.com",
    name: "علي الموظف",
    role: "employee",
    password: "Employee@123",
  },
];

// Test Inventory Items
export const testInventoryItems: TestInventoryItem[] = [
  {
    id: "item-1",
    name: "شامبو السيارات",
    category: "مواد التنظيف",
    quantity: 45,
    minQuantity: 10,
    unit: "لتر",
    price: 25.5,
    supplier: "شركة النظافة المتقدمة",
    lastRestocked: "2026-04-10",
  },
  {
    id: "item-2",
    name: "مواد تلميع",
    category: "مواد التلميع",
    quantity: 30,
    minQuantity: 5,
    unit: "كيس",
    price: 15.0,
    supplier: "شركة التلميع الدولية",
    lastRestocked: "2026-04-08",
  },
  {
    id: "item-3",
    name: "مناشف ميكروفايبر",
    category: "أدوات",
    quantity: 120,
    minQuantity: 20,
    unit: "قطعة",
    price: 8.5,
    supplier: "مصنع الأدوات المحلي",
    lastRestocked: "2026-04-05",
  },
  {
    id: "item-4",
    name: "فرش تنظيف",
    category: "أدوات",
    quantity: 25,
    minQuantity: 5,
    unit: "قطعة",
    price: 12.0,
    supplier: "متجر الأدوات",
    lastRestocked: "2026-03-30",
  },
  {
    id: "item-5",
    name: "مسحات تنظيف",
    category: "مواد التنظيف",
    quantity: 8,
    minQuantity: 15,
    unit: "صندوق",
    price: 35.0,
    supplier: "شركة النظافة المتقدمة",
    lastRestocked: "2026-04-01",
  },
  {
    id: "item-6",
    name: "معطر السيارات",
    category: "معطرات",
    quantity: 50,
    minQuantity: 10,
    unit: "زجاجة",
    price: 5.5,
    supplier: "شركة المعطرات",
    lastRestocked: "2026-04-12",
  },
  {
    id: "item-7",
    name: "زيت المحرك",
    category: "زيوت",
    quantity: 15,
    minQuantity: 5,
    unit: "لتر",
    price: 45.0,
    supplier: "شركة الزيوت",
    lastRestocked: "2026-04-09",
  },
  {
    id: "item-8",
    name: "سائل التنظيف الجاف",
    category: "مواد التنظيف",
    quantity: 35,
    minQuantity: 10,
    unit: "لتر",
    price: 20.0,
    supplier: "شركة النظافة المتقدمة",
    lastRestocked: "2026-04-11",
  },
];

// Test Operations
export const testOperations: TestOperation[] = [
  {
    id: "op-1",
    type: "wash",
    date: "2026-04-14",
    status: "completed",
    itemsUsed: [
      { itemId: "item-1", quantity: 2 },
      { itemId: "item-3", quantity: 3 },
    ],
    notes: "غسيل عادي - سيارة BMW",
    performedBy: "user-employee-1",
  },
  {
    id: "op-2",
    type: "wash",
    date: "2026-04-14",
    status: "completed",
    itemsUsed: [
      { itemId: "item-1", quantity: 2.5 },
      { itemId: "item-2", quantity: 1 },
    ],
    notes: "غسيل مع تلميع - سيارة مرسيدس",
    performedBy: "user-employee-2",
  },
  {
    id: "op-3",
    type: "maintenance",
    date: "2026-04-14",
    status: "in-progress",
    itemsUsed: [
      { itemId: "item-7", quantity: 1 },
      { itemId: "item-4", quantity: 2 },
    ],
    notes: "صيانة دورية - تغيير الزيت",
    performedBy: "user-employee-1",
  },
  {
    id: "op-4",
    type: "inspection",
    date: "2026-04-13",
    status: "completed",
    itemsUsed: [],
    notes: "فحص دوري للمعدات",
    performedBy: "user-manager-1",
  },
  {
    id: "op-5",
    type: "wash",
    date: "2026-04-13",
    status: "completed",
    itemsUsed: [
      { itemId: "item-1", quantity: 1.5 },
      { itemId: "item-6", quantity: 1 },
    ],
    notes: "غسيل سريع مع معطر",
    performedBy: "user-employee-2",
  },
];

// Test Messages
export const testMessages: TestMessage[] = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "user-manager-1",
    content: "مرحباً محمد، هل انتهيت من غسيل السيارات؟",
    timestamp: "2026-04-14T10:30:00Z",
    read: true,
  },
  {
    id: "msg-2",
    conversationId: "conv-1",
    senderId: "user-employee-1",
    content: "نعم، انتهيت للتو. هناك 3 سيارات جاهزة للتسليم",
    timestamp: "2026-04-14T10:35:00Z",
    read: true,
  },
  {
    id: "msg-3",
    conversationId: "conv-1",
    senderId: "user-manager-1",
    content: "شكراً! هل تحتاج إلى أي مواد إضافية؟",
    timestamp: "2026-04-14T10:40:00Z",
    read: false,
  },
  {
    id: "msg-4",
    conversationId: "conv-2",
    senderId: "user-manager-1",
    content: "علي، يرجى التحقق من مستويات المخزون",
    timestamp: "2026-04-14T09:00:00Z",
    read: true,
  },
  {
    id: "msg-5",
    conversationId: "conv-2",
    senderId: "user-employee-2",
    content: "تم التحقق. المسحات تحتاج إلى إعادة تخزين",
    timestamp: "2026-04-14T09:15:00Z",
    read: true,
  },
];

// Test Notes
export const testNotes = [
  {
    id: "note-1",
    title: "تنبيه مهم",
    content: "يجب إعادة تخزين المسحات قريباً",
    category: "warning",
    createdAt: "2026-04-14T08:00:00Z",
    createdBy: "user-manager-1",
  },
  {
    id: "note-2",
    title: "تذكير صيانة",
    content: "موعد صيانة المعدات الشهرية غداً",
    category: "reminder",
    createdAt: "2026-04-14T07:00:00Z",
    createdBy: "user-manager-1",
  },
  {
    id: "note-3",
    title: "ملاحظة عامة",
    content: "الأداء جيد هذا الأسبوع",
    category: "general",
    createdAt: "2026-04-13T16:00:00Z",
    createdBy: "user-manager-1",
  },
];

// Test Reports
export const testReports = [
  {
    id: "report-1",
    month: "2026-04",
    totalOperations: 45,
    totalRevenue: 4500,
    itemsUsed: [
      { itemId: "item-1", quantity: 50 },
      { itemId: "item-2", quantity: 25 },
      { itemId: "item-3", quantity: 100 },
    ],
    generatedAt: "2026-04-14T12:00:00Z",
  },
  {
    id: "report-2",
    month: "2026-03",
    totalOperations: 38,
    totalRevenue: 3800,
    itemsUsed: [
      { itemId: "item-1", quantity: 45 },
      { itemId: "item-2", quantity: 20 },
      { itemId: "item-3", quantity: 90 },
    ],
    generatedAt: "2026-03-31T12:00:00Z",
  },
];

/**
 * Generate mock data for testing
 */
export function generateTestData() {
  return {
    users: testUsers,
    inventoryItems: testInventoryItems,
    operations: testOperations,
    messages: testMessages,
    notes: testNotes,
    reports: testReports,
  };
}

/**
 * Format test data for display
 */
export function formatTestDataForDisplay() {
  return {
    users: testUsers.map((u) => ({
      name: u.name,
      email: u.email,
      role: u.role,
    })),
    inventoryCount: testInventoryItems.length,
    operationsCount: testOperations.length,
    messagesCount: testMessages.length,
    notesCount: testNotes.length,
    reportsCount: testReports.length,
  };
}

// Export for use in tests and components
export default {
  testUsers,
  testInventoryItems,
  testOperations,
  testMessages,
  testNotes,
  testReports,
  generateTestData,
  formatTestDataForDisplay,
};
