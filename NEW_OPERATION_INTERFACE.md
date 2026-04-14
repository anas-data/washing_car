# واجهة العملية الجديدة (New Operation Interface)

## نظرة عامة

تم تطوير واجهة عملية جديدة متقدمة تتيح للمستخدمين إنشاء وإدارة العمليات بسهولة وكفاءة. الواجهة توفر تجربة مستخدم محسّنة مع التحقق من صحة البيانات والتنبيهات الفورية.

## الميزات الرئيسية

### 1. اختيار المركبة والقطع
- **قائمة منسدلة ديناميكية** لاختيار المركبات المتاحة
- **عرض معلومات المركبة** (الاسم، لوحة الترخيص)
- **قائمة منسدلة للقطع والمواد** مع تصنيفات
- **بحث سريع** عن المركبات والقطع المطلوبة

### 2. أنواع العمليات
- **إضافة مخزون (Add)**: إضافة قطع أو مواد جديدة للمخزون
- **استهلاك (Consume)**: تسجيل استهلاك المواد والقطع
- **إصلاح (Repair)**: تسجيل عمليات الإصلاح والصيانة
- **صيانة (Maintenance)**: تسجيل أعمال الصيانة الدورية

### 3. إدارة الكمية
- **إدخال يدوي** للكمية
- **أزرار سريعة** لإضافة كميات محددة (1، 5، 10)
- **التحقق من صحة الكمية** (يجب أن تكون موجبة)

### 4. معلومات السائق والملاحظات
- **حقل اسم السائق** (إجباري)
- **حقل الملاحظات** (اختياري) لإضافة تفاصيل إضافية
- **التاريخ التلقائي** (تاريخ اليوم الحالي)

### 5. ملخص العملية
- **عرض مرئي** لجميع بيانات العملية قبل الحفظ
- **معاينة البيانات** المدخلة
- **تأكيد العملية** قبل الحفظ النهائي

## هيكل البيانات

```typescript
interface Operation {
  id: string;
  vehicleId: string;
  partId: string;
  operationType: "add" | "consume" | "repair" | "maintenance";
  quantity: number;
  driverName: string;
  notes?: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
}
```

## API Endpoints

### إنشاء عملية جديدة
```
POST /api/trpc/newOperation.create
Body: {
  vehicleId: string
  partId: string
  operationType: "add" | "consume" | "repair" | "maintenance"
  quantity: number
  driverName: string
  notes?: string
  date?: string
}
Response: {
  success: boolean
  message: string
  operation: Operation
}
```

### الحصول على جميع العمليات
```
GET /api/trpc/newOperation.getAll
Response: {
  success: boolean
  operations: Operation[]
  total: number
}
```

### الحصول على عملية بواسطة ID
```
GET /api/trpc/newOperation.getById?id=op_123
Response: {
  success: boolean
  operation: Operation
}
```

### تحديث عملية
```
PUT /api/trpc/newOperation.update
Body: {
  id: string
  vehicleId?: string
  partId?: string
  operationType?: "add" | "consume" | "repair" | "maintenance"
  quantity?: number
  driverName?: string
  notes?: string
}
Response: {
  success: boolean
  message: string
  operation: Operation
}
```

### حذف عملية
```
DELETE /api/trpc/newOperation.delete?id=op_123
Response: {
  success: boolean
  message: string
  operation: Operation
}
```

### الموافقة على عملية
```
POST /api/trpc/newOperation.approve
Body: {
  id: string
  approvedBy: string
  notes?: string
}
Response: {
  success: boolean
  message: string
  operation: Operation
}
```

### رفض عملية
```
POST /api/trpc/newOperation.reject
Body: {
  id: string
  rejectedBy: string
  reason: string
}
Response: {
  success: boolean
  message: string
  operation: Operation
}
```

### الحصول على العمليات المعلقة
```
GET /api/trpc/newOperation.getPending
Response: {
  success: boolean
  operations: Operation[]
  total: number
}
```

### الحصول على عمليات مركبة معينة
```
GET /api/trpc/newOperation.getByVehicle?vehicleId=v1
Response: {
  success: boolean
  operations: Operation[]
  total: number
}
```

### الحصول على عمليات في نطاق تاريخي
```
GET /api/trpc/newOperation.getByDateRange?startDate=2026-01-01&endDate=2026-12-31
Response: {
  success: boolean
  operations: Operation[]
  total: number
}
```

### الحصول على إحصائيات العمليات
```
GET /api/trpc/newOperation.getStatistics
Response: {
  success: boolean
  statistics: {
    total: number
    pending: number
    approved: number
    rejected: number
    byType: {
      add: number
      consume: number
      repair: number
      maintenance: number
    }
    approvalRate: string
  }
}
```

## تدفق العمل

### 1. إنشاء عملية جديدة
1. المستخدم يفتح شاشة "عملية جديدة"
2. يختار المركبة من القائمة المنسدلة
3. يختار القطعة أو المادة
4. يختار نوع العملية
5. يدخل الكمية
6. يدخل اسم السائق
7. يضيف ملاحظات (اختياري)
8. يراجع ملخص العملية
9. ينقر على "إنشاء العملية"

### 2. الموافقة على العملية
1. المدير يرى العمليات المعلقة
2. يراجع تفاصيل العملية
3. يوافق أو يرفض العملية
4. يضيف ملاحظات الموافقة/الرفض

### 3. تتبع العمليات
1. المستخدم يمكنه عرض جميع العمليات
2. تصفية حسب الحالة (معلقة، موافق عليها، مرفوضة)
3. البحث حسب المركبة أو التاريخ
4. عرض الإحصائيات

## التحقق من صحة البيانات

| الحقل | القاعدة | الرسالة |
|------|--------|--------|
| vehicleId | مطلوب | اختر المركبة |
| partId | مطلوب | اختر القطعة أو المادة |
| quantity | مطلوب، موجب | أدخل كمية صحيحة |
| driverName | مطلوب، نص | أدخل اسم السائق |
| operationType | مطلوب | اختر نوع العملية |
| date | تاريخ صحيح | التاريخ غير صحيح |

## الاختبارات

تم إنشاء 23 اختبار شامل يغطي:
- إنشاء العمليات
- استرجاع العمليات
- تحديث العمليات
- حذف العمليات
- تدفق الموافقة
- الإحصائيات
- التحقق من صحة البيانات
- الأداء

### تشغيل الاختبارات
```bash
pnpm test new-operation
```

## الأداء

- **وقت الاستجابة**: < 100ms لكل عملية
- **معالجة 100 عملية**: < 1 ثانية
- **استهلاك الذاكرة**: محسّن باستخدام Object Pooling

## الأمان

- **التحقق من صحة المدخلات**: جميع البيانات يتم التحقق منها
- **التحكم في الوصول**: فقط المستخدمون المصرح لهم يمكنهم الموافقة على العمليات
- **تتبع التغييرات**: جميع التغييرات يتم تسجيلها مع معلومات المستخدم والتاريخ

## الدعم متعدد اللغات

- **العربية**: واجهة كاملة بالعربية مع دعم RTL
- **الإنجليزية**: جميع الرسائل متوفرة بالإنجليزية

## الخطوات التالية المقترحة

1. **إضافة تحميل الصور**: السماح بتحميل صور للعمليات (قبل/بعد)
2. **إضافة التوقيعات الرقمية**: طلب توقيع رقمي من السائق والمدير
3. **إضافة الباركود**: قراءة باركود المركبات والقطع
4. **إضافة التنبيهات الفورية**: إرسال إشعارات عند إنشاء/الموافقة على العمليات
5. **إضافة التقارير المتقدمة**: تقارير مفصلة حسب المركبة والنوع والفترة الزمنية
