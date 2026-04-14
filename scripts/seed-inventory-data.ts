/**
 * Inventory Data Seeding Script
 * إدخال بيانات المستودع الحقيقية لمغسلة السيارات
 */

// Mock database interface for demonstration
interface InventoryRecord {
  itemName: string;
  itemNameAr: string;
  category: "material" | "part";
  currentQuantity: number;
  minThreshold: number;
  maxThreshold: number;
  unit: string;
  unitAr: string;
  unitPrice: number;
  supplier: string;
  description: string;
  lastUpdated: Date;
  status: "low" | "normal" | "high";
}

interface InventoryItem {
  name: string;
  nameAr: string;
  category: "material" | "part";
  quantity: number;
  minThreshold: number;
  maxThreshold: number;
  unit: string;
  unitAr: string;
  price: number;
  supplier: string;
  description: string;
}

// قائمة المواد والقطع الحقيقية لمغسلة السيارات
export const inventoryItems: InventoryItem[] = [
  // المواد الكيميائية والتنظيفية
  {
    name: "Car Wash Shampoo",
    nameAr: "شامبو غسيل السيارات",
    category: "material",
    quantity: 45,
    minThreshold: 10,
    maxThreshold: 60,
    unit: "liter",
    unitAr: "لتر",
    price: 85,
    supplier: "Chemical Solutions Co.",
    description: "Professional car wash shampoo - high foam, gentle on paint",
  },
  {
    name: "Wax Polish",
    nameAr: "ملمع الشمع",
    category: "material",
    quantity: 28,
    minThreshold: 5,
    maxThreshold: 40,
    unit: "liter",
    unitAr: "لتر",
    price: 150,
    supplier: "Premium Polish Ltd.",
    description: "High-quality wax polish for vehicle protection",
  },
  {
    name: "Glass Cleaner",
    nameAr: "منظف الزجاج",
    category: "material",
    quantity: 35,
    minThreshold: 8,
    maxThreshold: 50,
    unit: "liter",
    unitAr: "لتر",
    price: 65,
    supplier: "Clean Pro Industries",
    description: "Streak-free glass cleaning solution",
  },
  {
    name: "Tire Shine",
    nameAr: "ملمع الإطارات",
    category: "material",
    quantity: 22,
    minThreshold: 5,
    maxThreshold: 35,
    unit: "liter",
    unitAr: "لتر",
    price: 95,
    supplier: "Tire Care Solutions",
    description: "Professional tire shine and protectant",
  },
  {
    name: "Carpet Shampoo",
    nameAr: "شامبو السجاد الداخلي",
    category: "material",
    quantity: 18,
    minThreshold: 5,
    maxThreshold: 30,
    unit: "liter",
    unitAr: "لتر",
    price: 110,
    supplier: "Interior Care Co.",
    description: "Deep cleaning carpet and upholstery shampoo",
  },
  {
    name: "Degreaser",
    nameAr: "منظف الشحوم",
    category: "material",
    quantity: 32,
    minThreshold: 8,
    maxThreshold: 45,
    unit: "liter",
    unitAr: "لتر",
    price: 75,
    supplier: "Industrial Cleaners",
    description: "Heavy-duty degreaser for engine and undercarriage",
  },
  {
    name: "Air Freshener",
    nameAr: "معطر الهواء",
    category: "material",
    quantity: 56,
    minThreshold: 15,
    maxThreshold: 80,
    unit: "piece",
    unitAr: "قطعة",
    price: 25,
    supplier: "Fragrance Supplies",
    description: "Long-lasting car air freshener",
  },
  {
    name: "Microfiber Cloth",
    nameAr: "قطعة ميكروفايبر",
    category: "material",
    quantity: 120,
    minThreshold: 30,
    maxThreshold: 150,
    unit: "piece",
    unitAr: "قطعة",
    price: 15,
    supplier: "Textile Supplies",
    description: "Premium microfiber drying and polishing cloths",
  },

  // القطع والأجزاء
  {
    name: "Air Filter",
    nameAr: "فلتر الهواء",
    category: "part",
    quantity: 24,
    minThreshold: 5,
    maxThreshold: 40,
    unit: "piece",
    unitAr: "قطعة",
    price: 45,
    supplier: "Auto Parts Warehouse",
    description: "Standard engine air filter",
  },
  {
    name: "Oil Filter",
    nameAr: "فلتر الزيت",
    category: "part",
    quantity: 18,
    minThreshold: 5,
    maxThreshold: 30,
    unit: "piece",
    unitAr: "قطعة",
    price: 35,
    supplier: "Auto Parts Warehouse",
    description: "Standard engine oil filter",
  },
  {
    name: "Cabin Air Filter",
    nameAr: "فلتر الهواء الداخلي",
    category: "part",
    quantity: 15,
    minThreshold: 3,
    maxThreshold: 25,
    unit: "piece",
    unitAr: "قطعة",
    price: 55,
    supplier: "Auto Parts Warehouse",
    description: "Cabin air filter for climate control",
  },
  {
    name: "Wiper Blades",
    nameAr: "ممسحات الزجاج",
    category: "part",
    quantity: 32,
    minThreshold: 8,
    maxThreshold: 50,
    unit: "pair",
    unitAr: "زوج",
    price: 65,
    supplier: "Windshield Solutions",
    description: "Premium wiper blade set",
  },
  {
    name: "Brake Pads",
    nameAr: "وسائد الفرامل",
    category: "part",
    quantity: 12,
    minThreshold: 3,
    maxThreshold: 20,
    unit: "set",
    unitAr: "مجموعة",
    price: 280,
    supplier: "Brake Systems Ltd.",
    description: "High-performance brake pad set",
  },
  {
    name: "Spark Plugs",
    nameAr: "شمعات الاشتعال",
    category: "part",
    quantity: 48,
    minThreshold: 12,
    maxThreshold: 80,
    unit: "piece",
    unitAr: "قطعة",
    price: 22,
    supplier: "Electrical Components",
    description: "Standard spark plugs",
  },
  {
    name: "Battery",
    nameAr: "بطارية السيارة",
    category: "part",
    quantity: 8,
    minThreshold: 2,
    maxThreshold: 15,
    unit: "piece",
    unitAr: "قطعة",
    price: 450,
    supplier: "Battery Specialists",
    description: "12V car battery",
  },
  {
    name: "Coolant",
    nameAr: "سائل التبريد",
    category: "material",
    quantity: 42,
    minThreshold: 10,
    maxThreshold: 60,
    unit: "liter",
    unitAr: "لتر",
    price: 55,
    supplier: "Fluid Solutions",
    description: "Engine coolant concentrate",
  },
  {
    name: "Motor Oil",
    nameAr: "زيت المحرك",
    category: "material",
    quantity: 36,
    minThreshold: 10,
    maxThreshold: 50,
    unit: "liter",
    unitAr: "لتر",
    price: 125,
    supplier: "Oil Distributors",
    description: "Synthetic motor oil 5W-30",
  },
  {
    name: "Transmission Fluid",
    nameAr: "سائل ناقل الحركة",
    category: "material",
    quantity: 20,
    minThreshold: 5,
    maxThreshold: 30,
    unit: "liter",
    unitAr: "لتر",
    price: 145,
    supplier: "Fluid Solutions",
    description: "Automatic transmission fluid",
  },
  {
    name: "Brake Fluid",
    nameAr: "سائل الفرامل",
    category: "material",
    quantity: 16,
    minThreshold: 4,
    maxThreshold: 25,
    unit: "liter",
    unitAr: "لتر",
    price: 85,
    supplier: "Brake Systems Ltd.",
    description: "DOT 4 brake fluid",
  },
];

/**
 * Generate inventory data structure for use with the API
 */
export function generateInventoryData() {
  console.log("🚀 Generating inventory data...");

  try {
    let successCount = 0;
    let errorCount = 0;
    const records: InventoryRecord[] = [];

    for (const item of inventoryItems) {
      try {
        const record: InventoryRecord = {
          itemName: item.name,
          itemNameAr: item.nameAr,
          category: item.category,
          currentQuantity: item.quantity,
          minThreshold: item.minThreshold,
          maxThreshold: item.maxThreshold,
          unit: item.unit,
          unitAr: item.unitAr,
          unitPrice: item.price,
          supplier: item.supplier,
          description: item.description,
          lastUpdated: new Date(),
          status: item.quantity <= item.minThreshold ? "low" : "normal",
        };

        records.push(record);
        console.log(`✅ Prepared: ${item.nameAr} (${item.quantity} ${item.unitAr})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error preparing ${item.nameAr}:`, error);
        errorCount++;
      }
    }

    console.log("\n📊 Seeding Summary:");
    console.log(`✅ Successfully prepared: ${successCount} items`);
    console.log(`❌ Failed: ${errorCount} items`);
    console.log(`📦 Total items: ${successCount + errorCount}`);
    console.log("\n💡 Use the API endpoints to insert these items into the database.");

    return { success: true, added: successCount, failed: errorCount, items: records };
  } catch (error) {
    console.error("❌ Error during data generation:", error);
    return { success: false, error };
  }
}

// Export inventory items for use in other modules
console.log(`📦 Loaded ${inventoryItems.length} inventory items for car wash business`);
