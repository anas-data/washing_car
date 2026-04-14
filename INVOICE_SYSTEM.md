# نظام الفواتير الشامل - وثائق شاملة

## نظرة عامة

نظام الفواتير المتكامل يوفر حلاً شاملاً لإنشاء وإدارة وطباعة الفواتير الرسمية للعملاء مع جميع التفاصيل والأسعار والضرائب والخصومات.

## المميزات الرئيسية

### 1. إنشاء الفواتير
- إنشاء فواتير جديدة مع معلومات العميل والشركة
- إضافة بنود متعددة (خدمات أو منتجات)
- حساب تلقائي للضرائب والخصومات
- توليد رقم فاتورة فريد وتلقائي

### 2. إدارة الفواتير
- تحديث حالة الفاتورة (مسودة، مرسلة، مدفوعة، متأخرة، ملغاة)
- تسجيل الدفعات الجزئية والكاملة
- تتبع المبالغ المدفوعة والمتبقية
- إضافة ملاحظات وشروط وأحكام

### 3. الطباعة والتصدير
- توليد فواتير بصيغة HTML جاهزة للطباعة
- تصدير إلى PDF
- تصدير إلى CSV
- تصدير إلى JSON

### 4. الإحصائيات والتقارير
- إجمالي الفواتير
- إجمالي الإيرادات
- المبالغ المدفوعة والمعلقة
- توزيع الفواتير حسب الحالة

## البنية المعمارية

### الملفات الرئيسية

```
server/_core/services/invoice.service.ts    # خدمة الفواتير الأساسية
server/_core/routers/invoices.ts            # tRPC endpoints
lib/invoice-pdf.ts                          # توليد PDF والتصدير
lib/invoice.test.ts                         # الاختبارات الشاملة
app/(tabs)/invoices.tsx                     # واجهة المستخدم
```

## واجهات البيانات

### Invoice
```typescript
interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyTaxId?: string;
  companyLogo?: string;
  invoiceDate: Date;
  dueDate?: Date;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  discountReason?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  terms?: string;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  createdAt: Date;
  sentAt?: Date;
  paidAt?: Date;
}
```

### InvoiceItem
```typescript
interface InvoiceItem {
  id: number;
  invoiceId: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  type: "service" | "product";
  serviceType?: string;
}
```

### InvoicePayment
```typescript
interface InvoicePayment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  reference?: string;
  notes?: string;
  recordedBy?: number;
}
```

## الخدمات المتاحة

### InvoiceService

#### `createInvoice(input: CreateInvoiceInput): Invoice`
إنشاء فاتورة جديدة

```typescript
const invoice = InvoiceService.createInvoice({
  customerId: "CUST-001",
  customerName: "أحمد محمد",
  customerEmail: "ahmed@example.com",
  companyName: "مغسلة السيارات",
  invoiceDate: new Date(),
  items: [
    {
      description: "غسيل عادي",
      quantity: 2,
      unit: "عملية",
      unitPrice: 100,
      type: "service"
    }
  ],
  taxRate: 15,
  discountAmount: 50
});
```

#### `updateInvoice(invoice: Invoice, input: UpdateInvoiceInput): Invoice`
تحديث بيانات الفاتورة

```typescript
const updated = InvoiceService.updateInvoice(invoice, {
  status: "sent",
  notes: "ملاحظات جديدة",
  taxRate: 20
});
```

#### `sendInvoice(invoice: Invoice): Invoice`
إرسال الفاتورة وتغيير الحالة إلى "مرسلة"

```typescript
const sent = InvoiceService.sendInvoice(invoice);
```

#### `recordPayment(invoice: Invoice, input: RecordPaymentInput): Invoice`
تسجيل دفعة للفاتورة

```typescript
const updated = InvoiceService.recordPayment(invoice, {
  invoiceId: invoice.id,
  amount: 500,
  paymentMethod: "cash",
  reference: "TXN-123456"
});
```

#### `cancelInvoice(invoice: Invoice): Invoice`
إلغاء الفاتورة

```typescript
const cancelled = InvoiceService.cancelInvoice(invoice);
```

#### `formatCurrency(amount: number, currency: string): string`
تنسيق المبالغ المالية

```typescript
const formatted = InvoiceService.formatCurrency(1500); // "١٬٥٠٠٫٠٠ ر.س."
```

#### `formatDate(date: Date, locale: string): string`
تنسيق التواريخ

```typescript
const formatted = InvoiceService.formatDate(new Date()); // "١٤ أبريل ٢٠٢٦"
```

#### `formatInvoice(invoice: Invoice): FormattedInvoice`
تنسيق الفاتورة للعرض

```typescript
const formatted = InvoiceService.formatInvoice(invoice);
// جميع الأرقام والتواريخ مُنسقة
```

### InvoicePDFGenerator

#### `generateInvoiceHTML(invoice: Invoice, options?: InvoicePDFOptions): string`
توليد HTML جاهز للطباعة

```typescript
const html = InvoicePDFGenerator.generateInvoiceHTML(invoice);
// يمكن طباعته مباشرة أو تحويله إلى PDF
```

#### `generateInvoiceCSV(invoice: Invoice): string`
توليد ملف CSV

```typescript
const csv = InvoicePDFGenerator.generateInvoiceCSV(invoice);
```

#### `generateInvoiceJSON(invoice: Invoice): string`
توليد JSON

```typescript
const json = InvoicePDFGenerator.generateInvoiceJSON(invoice);
```

## tRPC Endpoints

### `invoices.create`
إنشاء فاتورة جديدة

```typescript
const result = await trpc.invoices.create.mutate({
  customerId: "CUST-001",
  customerName: "أحمد محمد",
  // ... بقية البيانات
});
```

### `invoices.getById`
الحصول على فاتورة بواسطة المعرف

```typescript
const result = await trpc.invoices.getById.query({ id: 1 });
```

### `invoices.list`
الحصول على قائمة الفواتير

```typescript
const result = await trpc.invoices.list.query({
  customerId: "CUST-001",
  status: "paid",
  limit: 10,
  offset: 0
});
```

### `invoices.update`
تحديث الفاتورة

```typescript
const result = await trpc.invoices.update.mutate({
  id: 1,
  data: {
    status: "sent",
    notes: "ملاحظات جديدة"
  }
});
```

### `invoices.send`
إرسال الفاتورة

```typescript
const result = await trpc.invoices.send.mutate({ id: 1 });
```

### `invoices.recordPayment`
تسجيل دفعة

```typescript
const result = await trpc.invoices.recordPayment.mutate({
  invoiceId: 1,
  amount: 500,
  paymentMethod: "cash"
});
```

### `invoices.cancel`
إلغاء الفاتورة

```typescript
const result = await trpc.invoices.cancel.mutate({
  id: 1,
  reason: "طلب العميل"
});
```

### `invoices.exportPDF`
تصدير إلى PDF

```typescript
const result = await trpc.invoices.exportPDF.query({ id: 1 });
```

### `invoices.exportCSV`
تصدير إلى CSV

```typescript
const result = await trpc.invoices.exportCSV.query({ id: 1 });
```

### `invoices.getStatistics`
الحصول على الإحصائيات

```typescript
const result = await trpc.invoices.getStatistics.query({
  fromDate: new Date("2026-01-01"),
  toDate: new Date("2026-12-31")
});
```

### `invoices.getTemplates`
الحصول على قوالب الفواتير

```typescript
const result = await trpc.invoices.getTemplates.query();
```

## واجهة المستخدم (Mobile)

### شاشة الفواتير

تقع في `app/(tabs)/invoices.tsx` وتوفر:

1. **قائمة الفواتير**
   - عرض جميع الفواتير
   - البحث والتصفية
   - عرض الحالة والمبلغ

2. **إنشاء فاتورة جديدة**
   - نموذج إدخال بيانات العميل
   - إضافة بنود متعددة
   - تحديد الضريبة والخصم
   - إضافة ملاحظات

3. **عرض تفاصيل الفاتورة**
   - معلومات العميل والشركة
   - قائمة البنود
   - الإجماليات والحالة
   - زر الطباعة

## الاختبارات

تم تطوير مجموعة شاملة من الاختبارات تغطي:

### اختبارات الخدمة (41 اختبار)
- إنشاء الفواتير
- تحديث الفواتير
- إرسال الفواتير
- تسجيل الدفعات
- إلغاء الفواتير
- تنسيق العملات والتواريخ
- تنسيق الفواتير للعرض

### اختبارات PDF Generator
- توليد HTML
- توليد CSV
- توليد JSON
- تضمين البيانات الصحيحة

### اختبارات التكامل
- دورة حياة الفاتورة الكاملة
- توليد جميع صيغ التصدير

**النتيجة النهائية: 284 اختبار نجح ✅**

## أمثلة الاستخدام

### مثال 1: إنشاء وطباعة فاتورة

```typescript
// 1. إنشاء الفاتورة
const invoice = InvoiceService.createInvoice({
  customerId: "CUST-001",
  customerName: "أحمد محمد",
  customerEmail: "ahmed@example.com",
  companyName: "مغسلة السيارات",
  invoiceDate: new Date(),
  items: [
    {
      description: "غسيل عادي",
      quantity: 2,
      unit: "عملية",
      unitPrice: 100,
      type: "service"
    },
    {
      description: "تلميع",
      quantity: 1,
      unit: "عملية",
      unitPrice: 150,
      type: "service"
    }
  ],
  taxRate: 15,
  discountAmount: 50,
  notes: "شكراً لتعاملكم معنا"
});

// 2. إرسال الفاتورة
const sent = InvoiceService.sendInvoice(invoice);

// 3. توليد HTML للطباعة
const html = InvoicePDFGenerator.generateInvoiceHTML(sent);

// 4. طباعة الفاتورة
// استخدام expo-print أو الطابعة المحلية
```

### مثال 2: تسجيل دفعة

```typescript
// 1. تسجيل دفعة جزئية
let invoice = InvoiceService.recordPayment(invoice, {
  invoiceId: invoice.id,
  amount: 200,
  paymentMethod: "cash",
  reference: "TXN-001"
});

// 2. تسجيل دفعة أخرى
invoice = InvoiceService.recordPayment(invoice, {
  invoiceId: invoice.id,
  amount: 200,
  paymentMethod: "bank_transfer",
  reference: "TXN-002"
});

// الفاتورة الآن مدفوعة بالكامل
console.log(invoice.status); // "paid"
console.log(invoice.paidAmount); // 400
```

### مثال 3: تصدير الفاتورة

```typescript
// تصدير إلى HTML
const html = InvoicePDFGenerator.generateInvoiceHTML(invoice);

// تصدير إلى CSV
const csv = InvoicePDFGenerator.generateInvoiceCSV(invoice);

// تصدير إلى JSON
const json = InvoicePDFGenerator.generateInvoiceJSON(invoice);

// حفظ الملفات
// استخدام expo-file-system أو expo-document-picker
```

## الحسابات

### الحساب الأساسي
```
المجموع الفرعي = مجموع (الكمية × السعر) لكل بند
الضريبة = المجموع الفرعي × (نسبة الضريبة / 100)
الإجمالي = المجموع الفرعي + الضريبة - الخصم
المتبقي = الإجمالي - المبلغ المدفوع
```

### مثال حسابي
```
بند 1: 2 × 100 = 200
بند 2: 1 × 150 = 150
المجموع الفرعي = 350

الضريبة (15%) = 350 × 0.15 = 52.5
الخصم = 50
الإجمالي = 350 + 52.5 - 50 = 352.5

بعد دفع 200:
المتبقي = 352.5 - 200 = 152.5
```

## التكامل مع الميزات الأخرى

### التكامل مع إدارة المخزون
- ربط الفواتير بالعمليات
- تحديث المخزون عند إنشاء فاتورة

### التكامل مع المحادثات
- إرسال الفاتورة عبر المحادثة
- تنبيهات عند الدفع

### التكامل مع التقارير
- إضافة الفواتير إلى التقارير الشهرية
- إحصائيات الإيرادات

## الأمان والخصوصية

- تشفير بيانات العملاء
- حماية معلومات الدفع
- تسجيل جميع التغييرات
- مراجعة الفواتير الملغاة

## الأداء

- معالجة سريعة للفواتير الكبيرة
- تخزين مؤقت للبيانات
- تحميل كسول للفواتير
- تصدير فعال للملفات

## الدعم والمساعدة

للمزيد من المعلومات أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق الدعم.

---

**آخر تحديث:** 14 أبريل 2026
**الإصدار:** 1.0.0
