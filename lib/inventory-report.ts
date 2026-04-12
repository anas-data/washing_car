export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  lastUpdated: Date;
}

export interface MonthlyInventoryReport {
  month: string;
  year: number;
  generatedDate: Date;
  items: InventoryItem[];
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

const arabicMonths = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

/**
 * Generate monthly inventory report
 */
export function generateMonthlyInventoryReport(
  items: InventoryItem[],
  date: Date = new Date()
): MonthlyInventoryReport {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const filteredItems = items.filter(
    (item) =>
      new Date(item.lastUpdated) >= monthStart &&
      new Date(item.lastUpdated) <= monthEnd
  );

  const totalValue = filteredItems.reduce(
    (sum, item) => sum + item.totalValue,
    0
  );
  const lowStockItems = filteredItems.filter(
    (item) => item.status === "low_stock"
  ).length;
  const outOfStockItems = filteredItems.filter(
    (item) => item.status === "out_of_stock"
  ).length;

  return {
    month: arabicMonths[monthStart.getMonth()],
    year: monthStart.getFullYear(),
    generatedDate: new Date(),
    items: filteredItems,
    totalItems: filteredItems.length,
    totalValue,
    lowStockItems,
    outOfStockItems,
  };
}

/**
 * Format currency for Arabic locale
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
  }).format(value);
}

/**
 * Format date for Arabic locale
 */
export function formatDateArabic(date: Date): string {
  const day = date.getDate();
  const month = arabicMonths[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Generate PDF content as HTML
 */
export function generateInventoryReportHTML(
  report: MonthlyInventoryReport
): string {
  const itemsHTML = report.items
    .map(
      (item, index) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.sku}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity} ${item.unit}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.totalValue)}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
        <span style="padding: 4px 8px; border-radius: 4px; ${
          item.status === "in_stock"
            ? "background-color: #4CAF50; color: white;"
            : item.status === "low_stock"
              ? "background-color: #FFC107; color: black;"
              : "background-color: #F44336; color: white;"
        }">
          ${
            item.status === "in_stock"
              ? "متوفر"
              : item.status === "low_stock"
                ? "منخفض"
                : "نافد"
          }
        </span>
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>تقرير الجرد الشهري</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          direction: rtl;
          margin: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #1976d2;
          padding-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          color: #1976d2;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .info-label {
          font-weight: bold;
          color: #333;
        }
        .info-value {
          color: #1976d2;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #1976d2;
          color: white;
          padding: 12px;
          text-align: right;
          font-weight: bold;
        }
        td {
          padding: 10px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .summary {
          margin-top: 30px;
          padding: 20px;
          background-color: #f0f7ff;
          border-left: 4px solid #1976d2;
          border-radius: 4px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 16px;
        }
        .summary-label {
          font-weight: bold;
          color: #333;
        }
        .summary-value {
          color: #1976d2;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .signature {
          text-align: center;
          width: 200px;
        }
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 40px;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>تقرير الجرد الشهري</h1>
          <p>منفذ السلامة - نظام إدارة مخزون مغسلة السيارات</p>
          <p>${report.month} ${report.year}</p>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">تاريخ التقرير:</span>
            <span class="info-value">${formatDateArabic(report.generatedDate)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">إجمالي الأصناف:</span>
            <span class="info-value">${report.totalItems}</span>
          </div>
          <div class="info-item">
            <span class="info-label">إجمالي القيمة:</span>
            <span class="info-value">${formatCurrency(report.totalValue)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">أصناف منخفضة:</span>
            <span class="info-value">${report.lowStockItems}</span>
          </div>
        </div>

        <h2 style="color: #1976d2; margin-top: 30px;">تفاصيل الجرد</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>اسم الصنف</th>
              <th>رمز الصنف</th>
              <th>الكمية</th>
              <th>السعر الوحدة</th>
              <th>القيمة الإجمالية</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="summary">
          <h3 style="margin-top: 0; color: #1976d2;">ملخص التقرير</h3>
          <div class="summary-item">
            <span class="summary-label">إجمالي الأصناف:</span>
            <span class="summary-value">${report.totalItems}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">إجمالي القيمة:</span>
            <span class="summary-value">${formatCurrency(report.totalValue)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">أصناف متوفرة:</span>
            <span class="summary-value">${report.totalItems - report.lowStockItems - report.outOfStockItems}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">أصناف منخفضة:</span>
            <span class="summary-value" style="color: #FFC107;">${report.lowStockItems}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">أصناف نافدة:</span>
            <span class="summary-value" style="color: #F44336;">${report.outOfStockItems}</span>
          </div>
        </div>

        <div class="footer">
          <div class="signature">
            <div>المراجع</div>
            <div class="signature-line"></div>
          </div>
          <div class="signature">
            <div>المدير</div>
            <div class="signature-line"></div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
