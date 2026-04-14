/**
 * Invoice PDF Generator
 * Generates PDF invoices for printing and export
 */

import { Invoice, InvoiceService } from "../server/_core/services/invoice.service";

export interface InvoicePDFOptions {
  includeWatermark?: boolean;
  includeSignature?: boolean;
  includeQRCode?: boolean;
  paperSize?: "A4" | "letter";
  orientation?: "portrait" | "landscape";
}

export class InvoicePDFGenerator {
  /**
   * Generate HTML content for invoice
   */
  static generateInvoiceHTML(invoice: Invoice, options?: InvoicePDFOptions): string {
    const formatted = InvoiceService.formatInvoice(invoice);
    const isArabic = true; // Default to Arabic

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فاتورة ${invoice.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }

        .container {
            max-width: 210mm;
            height: 297mm;
            margin: 10mm auto;
            background: white;
            padding: 20mm;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
        }

        .company-info {
            flex: 1;
        }

        .company-info h1 {
            font-size: 24px;
            color: #007bff;
            margin-bottom: 10px;
        }

        .company-info p {
            font-size: 12px;
            color: #666;
            margin: 5px 0;
        }

        .invoice-title {
            text-align: center;
            flex: 1;
        }

        .invoice-title h2 {
            font-size: 28px;
            color: #007bff;
            margin-bottom: 10px;
        }

        .invoice-number {
            font-size: 14px;
            color: #666;
        }

        .logo {
            width: 80px;
            height: 80px;
            flex: 1;
            text-align: left;
        }

        .logo img {
            max-width: 100%;
            max-height: 100%;
        }

        /* Invoice Details */
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 20px;
        }

        .detail-section {
            flex: 1;
        }

        .detail-section h3 {
            font-size: 12px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
            text-transform: uppercase;
        }

        .detail-section p {
            font-size: 12px;
            color: #333;
            margin: 5px 0;
        }

        .detail-label {
            font-weight: bold;
            color: #666;
        }

        /* Items Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .items-table thead {
            background-color: #f8f9fa;
            border-top: 2px solid #007bff;
            border-bottom: 2px solid #007bff;
        }

        .items-table th {
            padding: 12px;
            text-align: right;
            font-weight: bold;
            color: #333;
            font-size: 12px;
        }

        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
            font-size: 12px;
            color: #333;
        }

        .items-table tbody tr:hover {
            background-color: #f9f9f9;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        /* Totals Section */
        .totals {
            display: flex;
            justify-content: flex-start;
            margin-bottom: 30px;
        }

        .totals-table {
            width: 40%;
            border-collapse: collapse;
        }

        .totals-table tr {
            border-bottom: 1px solid #ddd;
        }

        .totals-table td {
            padding: 10px;
            font-size: 12px;
        }

        .totals-table .label {
            text-align: right;
            color: #666;
            font-weight: 500;
        }

        .totals-table .value {
            text-align: left;
            color: #333;
            font-weight: 500;
        }

        .totals-table .total-row {
            background-color: #f0f0f0;
            font-weight: bold;
            font-size: 14px;
        }

        .totals-table .total-row.grand-total {
            background-color: #007bff;
            color: white;
            border-top: 2px solid #007bff;
        }

        /* Notes and Terms */
        .notes-section {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #007bff;
        }

        .notes-section h4 {
            font-size: 12px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
        }

        .notes-section p {
            font-size: 11px;
            color: #666;
            line-height: 1.5;
        }

        /* Footer */
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            min-height: 80px;
        }

        .signature {
            text-align: center;
            width: 30%;
        }

        .signature-line {
            border-top: 1px solid #333;
            margin-top: 40px;
            padding-top: 10px;
            font-size: 11px;
            color: #666;
        }

        .footer-text {
            font-size: 10px;
            color: #999;
            text-align: center;
            flex: 1;
        }

        .qr-code {
            width: 80px;
            height: 80px;
            text-align: center;
        }

        .qr-code img {
            max-width: 100%;
            max-height: 100%;
        }

        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-draft {
            background-color: #e9ecef;
            color: #495057;
        }

        .status-sent {
            background-color: #cfe2ff;
            color: #084298;
        }

        .status-paid {
            background-color: #d1e7dd;
            color: #0f5132;
        }

        .status-overdue {
            background-color: #f8d7da;
            color: #842029;
        }

        .status-cancelled {
            background-color: #e2e3e5;
            color: #383d41;
        }

        @media print {
            body {
                background: white;
            }

            .container {
                margin: 0;
                padding: 0;
                box-shadow: none;
                height: auto;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <h1>${invoice.companyName}</h1>
                ${invoice.companyPhone ? `<p><strong>الهاتف:</strong> ${invoice.companyPhone}</p>` : ""}
                ${invoice.companyEmail ? `<p><strong>البريد:</strong> ${invoice.companyEmail}</p>` : ""}
                ${invoice.companyTaxId ? `<p><strong>الرقم الضريبي:</strong> ${invoice.companyTaxId}</p>` : ""}
            </div>

            <div class="invoice-title">
                <h2>فاتورة</h2>
                <p class="invoice-number">${invoice.invoiceNumber}</p>
            </div>

            ${invoice.companyLogo ? `<div class="logo"><img src="${invoice.companyLogo}" alt="Logo"></div>` : ""}
        </div>

        <!-- Invoice Details -->
        <div class="invoice-details">
            <div class="detail-section">
                <h3>معلومات العميل</h3>
                <p><span class="detail-label">الاسم:</span> ${invoice.customerName}</p>
                ${invoice.customerPhone ? `<p><span class="detail-label">الهاتف:</span> ${invoice.customerPhone}</p>` : ""}
                ${invoice.customerEmail ? `<p><span class="detail-label">البريد:</span> ${invoice.customerEmail}</p>` : ""}
                ${invoice.customerAddress ? `<p><span class="detail-label">العنوان:</span> ${invoice.customerAddress}</p>` : ""}
            </div>

            <div class="detail-section">
                <h3>تفاصيل الفاتورة</h3>
                <p><span class="detail-label">رقم الفاتورة:</span> ${invoice.invoiceNumber}</p>
                <p><span class="detail-label">التاريخ:</span> ${formatted.invoiceDate}</p>
                ${invoice.dueDate ? `<p><span class="detail-label">تاريخ الاستحقاق:</span> ${formatted.dueDate}</p>` : ""}
                <p><span class="detail-label">الحالة:</span> <span class="status-badge status-${invoice.status}">${this.getStatusLabel(invoice.status)}</span></p>
            </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>الوصف</th>
                    <th class="text-center">الكمية</th>
                    <th class="text-center">الوحدة</th>
                    <th class="text-center">السعر</th>
                    <th class="text-center">الإجمالي</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items
                  .map(
                    (item) => `
                    <tr>
                        <td>${item.description}</td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-center">${item.unit}</td>
                        <td class="text-center">${InvoiceService.formatCurrency(item.unitPrice)}</td>
                        <td class="text-center">${InvoiceService.formatCurrency(item.totalPrice)}</td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
            <table class="totals-table">
                <tr>
                    <td class="label">المجموع الفرعي:</td>
                    <td class="value">${formatted.subtotal}</td>
                </tr>
                ${invoice.taxRate > 0
                  ? `
                    <tr>
                        <td class="label">الضريبة (${invoice.taxRate}%):</td>
                        <td class="value">${formatted.taxAmount}</td>
                    </tr>
                `
                  : ""}
                ${invoice.discountAmount > 0
                  ? `
                    <tr>
                        <td class="label">الخصم:</td>
                        <td class="value">-${formatted.discountAmount}</td>
                    </tr>
                `
                  : ""}
                <tr class="total-row grand-total">
                    <td class="label">الإجمالي:</td>
                    <td class="value">${formatted.totalAmount}</td>
                </tr>
                ${invoice.paidAmount > 0
                  ? `
                    <tr>
                        <td class="label">المبلغ المدفوع:</td>
                        <td class="value">${formatted.paidAmount}</td>
                    </tr>
                    <tr>
                        <td class="label">المتبقي:</td>
                        <td class="value">${formatted.remainingAmount}</td>
                    </tr>
                `
                  : ""}
            </table>
        </div>

        <!-- Notes and Terms -->
        ${
          invoice.notes || invoice.terms
            ? `
            <div class="notes-section">
                ${invoice.notes ? `<h4>ملاحظات</h4><p>${invoice.notes}</p>` : ""}
                ${invoice.terms ? `<h4>الشروط والأحكام</h4><p>${invoice.terms}</p>` : ""}
            </div>
        `
            : ""
        }

        <!-- Footer -->
        <div class="footer">
            <div class="signature">
                <p>توقيع العميل</p>
                <div class="signature-line"></div>
            </div>

            <div class="footer-text">
                <p>شكراً لتعاملكم معنا</p>
                <p style="font-size: 9px; margin-top: 10px;">تم إنشاء هذه الفاتورة بواسطة نظام إدارة مخزون مغسلة السيارات</p>
            </div>

            <div class="signature">
                <p>توقيع المسؤول</p>
                <div class="signature-line"></div>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    return html;
  }

  /**
   * Get status label in Arabic
   */
  private static getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: "مسودة",
      sent: "مرسلة",
      paid: "مدفوعة",
      overdue: "متأخرة",
      cancelled: "ملغاة",
    };
    return labels[status] || status;
  }

  /**
   * Generate CSV content for invoice
   */
  static generateInvoiceCSV(invoice: Invoice): string {
    const formatted = InvoiceService.formatInvoice(invoice);

    let csv = "رقم الفاتورة,تاريخ الفاتورة,اسم العميل,الوصف,الكمية,السعر,الإجمالي\n";

    invoice.items.forEach((item, index) => {
      csv += `${index === 0 ? invoice.invoiceNumber : ""},${
        index === 0 ? formatted.invoiceDate : ""
      },${index === 0 ? invoice.customerName : ""},"${item.description}",${
        item.quantity
      },${item.unitPrice},${item.totalPrice}\n`;
    });

    csv += `\n,,,المجموع الفرعي,,${formatted.subtotal}\n`;
    if (invoice.taxRate > 0) {
      csv += `\n,,,الضريبة (${invoice.taxRate}%),,${formatted.taxAmount}\n`;
    }
    if (invoice.discountAmount > 0) {
      csv += `\n,,,الخصم,,${formatted.discountAmount}\n`;
    }
    csv += `\n,,,الإجمالي,,${formatted.totalAmount}\n`;

    return csv;
  }

  /**
   * Generate JSON content for invoice
   */
  static generateInvoiceJSON(invoice: Invoice): string {
    return JSON.stringify(InvoiceService.formatInvoice(invoice), null, 2);
  }
}
