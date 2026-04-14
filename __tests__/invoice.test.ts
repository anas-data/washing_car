/**
 * Invoice System Tests
 * Comprehensive tests for invoice functionality
 */

import { describe, it, expect, beforeEach } from "vitest";
import { InvoiceService, CreateInvoiceInput } from "../server/_core/services/invoice.service";
import { InvoicePDFGenerator } from "../lib/invoice-pdf";

describe("Invoice Service", () => {
  let testInvoice: any;

  beforeEach(() => {
    // Create a test invoice
    const input: CreateInvoiceInput = {
      customerId: "CUST-001",
      customerName: "أحمد محمد",
      customerEmail: "ahmed@example.com",
      customerPhone: "+966501234567",
      customerAddress: "الرياض، المملكة العربية السعودية",
      companyName: "مغسلة السيارات",
      companyAddress: "الرياض",
      companyPhone: "+966501234567",
      companyEmail: "info@carwash.com",
      companyTaxId: "123456789",
      invoiceDate: new Date("2026-04-14"),
      dueDate: new Date("2026-05-14"),
      items: [
        {
          description: "غسيل عادي",
          quantity: 2,
          unit: "عملية",
          unitPrice: 100,
          type: "service",
          serviceType: "wash",
        },
        {
          description: "تلميع السيارة",
          quantity: 1,
          unit: "عملية",
          unitPrice: 150,
          type: "service",
          serviceType: "polish",
        },
      ],
      taxRate: 15,
      discountAmount: 50,
      discountReason: "خصم خاص",
      notes: "شكراً لتعاملكم معنا",
      terms: "يرجى الدفع خلال 30 يوم",
    };

    testInvoice = InvoiceService.createInvoice(input);
  });

  describe("Invoice Creation", () => {
    it("should create an invoice with correct structure", () => {
      expect(testInvoice).toBeDefined();
      expect(testInvoice.id).toBeDefined();
      expect(testInvoice.invoiceNumber).toMatch(/^INV-\d{6}-\d{4}$/);
      expect(testInvoice.customerId).toBe("CUST-001");
      expect(testInvoice.customerName).toBe("أحمد محمد");
    });

    it("should calculate correct subtotal", () => {
      const expectedSubtotal = 2 * 100 + 1 * 150; // 350
      expect(testInvoice.subtotal).toBe(expectedSubtotal);
    });

    it("should calculate correct tax amount", () => {
      const expectedTax = (testInvoice.subtotal * 15) / 100; // 52.5
      expect(testInvoice.taxAmount).toBe(expectedTax);
    });

    it("should calculate correct total amount", () => {
      const expectedTotal = testInvoice.subtotal + testInvoice.taxAmount - 50;
      expect(testInvoice.totalAmount).toBe(expectedTotal);
    });

    it("should have draft status by default", () => {
      expect(testInvoice.status).toBe("draft");
    });

    it("should include all items", () => {
      expect(testInvoice.items).toHaveLength(2);
      expect(testInvoice.items[0].description).toBe("غسيل عادي");
      expect(testInvoice.items[1].description).toBe("تلميع السيارة");
    });

    it("should have empty payments array", () => {
      expect(testInvoice.payments).toHaveLength(0);
    });
  });

  describe("Invoice Update", () => {
    it("should update invoice notes", () => {
      const updated = InvoiceService.updateInvoice(testInvoice, {
        notes: "ملاحظات جديدة",
      });

      expect(updated.notes).toBe("ملاحظات جديدة");
    });

    it("should update invoice status", () => {
      const updated = InvoiceService.updateInvoice(testInvoice, {
        status: "sent",
      });

      expect(updated.status).toBe("sent");
    });

    it("should update discount and recalculate total", () => {
      const updated = InvoiceService.updateInvoice(testInvoice, {
        discountAmount: 100,
      });

      const expectedTotal = testInvoice.subtotal + testInvoice.taxAmount - 100;
      expect(updated.totalAmount).toBe(expectedTotal);
      expect(updated.discountAmount).toBe(100);
    });

    it("should update tax rate and recalculate total", () => {
      const updated = InvoiceService.updateInvoice(testInvoice, {
        taxRate: 20,
      });

      const expectedTax = (testInvoice.subtotal * 20) / 100;
      const expectedTotal = testInvoice.subtotal + expectedTax - testInvoice.discountAmount;

      expect(updated.taxRate).toBe(20);
      expect(updated.taxAmount).toBe(expectedTax);
      expect(updated.totalAmount).toBe(expectedTotal);
    });
  });

  describe("Invoice Sending", () => {
    it("should change status to sent", () => {
      const sent = InvoiceService.sendInvoice(testInvoice);

      expect(sent.status).toBe("sent");
      expect(sent.sentAt).toBeDefined();
    });

    it("should preserve other invoice data when sending", () => {
      const sent = InvoiceService.sendInvoice(testInvoice);

      expect(sent.customerId).toBe(testInvoice.customerId);
      expect(sent.totalAmount).toBe(testInvoice.totalAmount);
      expect(sent.items).toEqual(testInvoice.items);
    });
  });

  describe("Payment Recording", () => {
    it("should record a partial payment", () => {
      const updated = InvoiceService.recordPayment(testInvoice, {
        invoiceId: testInvoice.id,
        amount: 100,
        paymentMethod: "cash",
      });

      expect(updated.paidAmount).toBe(100);
      expect(updated.remainingAmount).toBe(testInvoice.totalAmount - 100);
      expect(updated.status).toBe("draft"); // Status should not change for partial payment
    });

    it("should record full payment and change status to paid", () => {
      const updated = InvoiceService.recordPayment(testInvoice, {
        invoiceId: testInvoice.id,
        amount: testInvoice.totalAmount,
        paymentMethod: "bank_transfer",
      });

      expect(updated.paidAmount).toBe(testInvoice.totalAmount);
      expect(updated.remainingAmount).toBe(0);
      expect(updated.status).toBe("paid");
      expect(updated.paidAt).toBeDefined();
    });

    it("should add payment to payments array", () => {
      const updated = InvoiceService.recordPayment(testInvoice, {
        invoiceId: testInvoice.id,
        amount: 100,
        paymentMethod: "credit_card",
        reference: "TXN-123456",
      });

      expect(updated.payments).toHaveLength(1);
      expect(updated.payments[0].amount).toBe(100);
      expect(updated.payments[0].paymentMethod).toBe("credit_card");
      expect(updated.payments[0].reference).toBe("TXN-123456");
    });

    it("should record multiple payments", () => {
      let updated = InvoiceService.recordPayment(testInvoice, {
        invoiceId: testInvoice.id,
        amount: 100,
        paymentMethod: "cash",
      });

      updated = InvoiceService.recordPayment(updated, {
        invoiceId: testInvoice.id,
        amount: 100,
        paymentMethod: "cash",
      });

      expect(updated.payments).toHaveLength(2);
      expect(updated.paidAmount).toBe(200);
    });
  });

  describe("Invoice Cancellation", () => {
    it("should change status to cancelled", () => {
      const cancelled = InvoiceService.cancelInvoice(testInvoice);

      expect(cancelled.status).toBe("cancelled");
    });

    it("should preserve other invoice data when cancelling", () => {
      const cancelled = InvoiceService.cancelInvoice(testInvoice);

      expect(cancelled.customerId).toBe(testInvoice.customerId);
      expect(cancelled.totalAmount).toBe(testInvoice.totalAmount);
    });
  });

  describe("Currency Formatting", () => {
    it("should format currency correctly", () => {
      const formatted = InvoiceService.formatCurrency(1500);
      expect(formatted).toBeDefined();
      expect(formatted).toContain("ر.س"); // Arabic abbreviation for SAR
    });

    it("should handle decimal amounts", () => {
      const formatted = InvoiceService.formatCurrency(1500.5);
      expect(formatted).toBeDefined();
      expect(formatted).toContain("ر.س");
    });

    it("should handle zero amount", () => {
      const formatted = InvoiceService.formatCurrency(0);
      expect(formatted).toBeDefined();
      expect(formatted).toContain("ر.س");
    });
  });

  describe("Date Formatting", () => {
    it("should format date correctly", () => {
      const date = new Date("2026-04-14");
      const formatted = InvoiceService.formatDate(date);
      expect(formatted).toBeDefined();
      expect(formatted).toContain("٢٠٢٦"); // Arabic numerals for 2026
    });
  });

  describe("Invoice Formatting", () => {
    it("should format invoice for display", () => {
      const formatted = InvoiceService.formatInvoice(testInvoice);

      expect(formatted.id).toBe(testInvoice.id);
      expect(formatted.invoiceNumber).toBe(testInvoice.invoiceNumber);
      expect(formatted.customerId).toBe(testInvoice.customerId);
      expect(formatted.subtotal).toContain("ر.س");
      expect(formatted.totalAmount).toContain("ر.س");
    });

    it("should include formatted items", () => {
      const formatted = InvoiceService.formatInvoice(testInvoice);

      expect(formatted.items).toHaveLength(2);
      expect(formatted.items[0].totalPrice).toContain("ر.س");
    });

    it("should include formatted payments", () => {
      const updated = InvoiceService.recordPayment(testInvoice, {
        invoiceId: testInvoice.id,
        amount: 100,
        paymentMethod: "cash",
      });

      const formatted = InvoiceService.formatInvoice(updated);

      expect(formatted.payments).toHaveLength(1);
      expect(formatted.payments[0].amount).toContain("ر.س");
    });
  });
});

describe("Invoice PDF Generator", () => {
  let testInvoice: any;

  beforeEach(() => {
    const input: CreateInvoiceInput = {
      customerId: "CUST-001",
      customerName: "أحمد محمد",
      customerEmail: "ahmed@example.com",
      customerPhone: "+966501234567",
      customerAddress: "الرياض",
      companyName: "مغسلة السيارات",
      companyPhone: "+966501234567",
      companyEmail: "info@carwash.com",
      companyTaxId: "123456789",
      invoiceDate: new Date("2026-04-14"),
      dueDate: new Date("2026-05-14"),
      items: [
        {
          description: "غسيل عادي",
          quantity: 2,
          unit: "عملية",
          unitPrice: 100,
          type: "service",
        },
      ],
      taxRate: 15,
      discountAmount: 0,
      notes: "شكراً لتعاملكم معنا",
    };

    testInvoice = InvoiceService.createInvoice(input);
  });

  describe("HTML Generation", () => {
    it("should generate valid HTML", () => {
      const html = InvoicePDFGenerator.generateInvoiceHTML(testInvoice);

      expect(html).toBeDefined();
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("</html>");
      expect(html).toContain("<html");
    });

    it("should include invoice number in HTML", () => {
      const html = InvoicePDFGenerator.generateInvoiceHTML(testInvoice);

      expect(html).toContain(testInvoice.invoiceNumber);
    });

    it("should include customer information in HTML", () => {
      const html = InvoicePDFGenerator.generateInvoiceHTML(testInvoice);

      expect(html).toContain(testInvoice.customerName);
      expect(html).toContain(testInvoice.customerEmail);
    });

    it("should include company information in HTML", () => {
      const html = InvoicePDFGenerator.generateInvoiceHTML(testInvoice);

      expect(html).toContain(testInvoice.companyName);
      expect(html).toContain(testInvoice.companyPhone);
    });

    it("should include items in HTML table", () => {
      const html = InvoicePDFGenerator.generateInvoiceHTML(testInvoice);

      expect(html).toContain("غسيل عادي");
      expect(html).toContain("2"); // quantity
    });

    it("should include totals in HTML", () => {
      const html = InvoicePDFGenerator.generateInvoiceHTML(testInvoice);

      expect(html).toContain("المجموع");
      expect(html).toContain("الضريبة");
    });

    it("should have RTL direction", () => {
      const html = InvoicePDFGenerator.generateInvoiceHTML(testInvoice);

      expect(html).toContain('dir="rtl"');
      expect(html).toContain('lang="ar"');
    });
  });

  describe("CSV Generation", () => {
    it("should generate valid CSV", () => {
      const csv = InvoicePDFGenerator.generateInvoiceCSV(testInvoice);

      expect(csv).toBeDefined();
      expect(csv).toContain("رقم الفاتورة");
      expect(csv).toContain("تاريخ الفاتورة");
    });

    it("should include invoice data in CSV", () => {
      const csv = InvoicePDFGenerator.generateInvoiceCSV(testInvoice);

      expect(csv).toContain(testInvoice.invoiceNumber);
      expect(csv).toContain(testInvoice.customerName);
    });

    it("should include items in CSV", () => {
      const csv = InvoicePDFGenerator.generateInvoiceCSV(testInvoice);

      expect(csv).toContain("غسيل عادي");
    });

    it("should include totals in CSV", () => {
      const csv = InvoicePDFGenerator.generateInvoiceCSV(testInvoice);

      expect(csv).toContain("المجموع الفرعي");
      expect(csv).toContain("الإجمالي");
    });
  });

  describe("JSON Generation", () => {
    it("should generate valid JSON", () => {
      const json = InvoicePDFGenerator.generateInvoiceJSON(testInvoice);

      expect(json).toBeDefined();
      const parsed = JSON.parse(json);
      expect(parsed).toBeDefined();
    });

    it("should include invoice data in JSON", () => {
      const json = InvoicePDFGenerator.generateInvoiceJSON(testInvoice);
      const parsed = JSON.parse(json);

      expect(parsed.invoiceNumber).toBe(testInvoice.invoiceNumber);
      expect(parsed.customerName).toBe(testInvoice.customerName);
    });
  });
});

describe("Invoice Integration", () => {
  it("should handle complete invoice lifecycle", () => {
    // Create
    const input: CreateInvoiceInput = {
      customerId: "CUST-001",
      customerName: "أحمد محمد",
      companyName: "مغسلة السيارات",
      invoiceDate: new Date(),
      items: [
        {
          description: "غسيل",
          quantity: 1,
          unit: "عملية",
          unitPrice: 100,
          type: "service",
        },
      ],
    };

    let invoice = InvoiceService.createInvoice(input);
    expect(invoice.status).toBe("draft");

    // Send
    invoice = InvoiceService.sendInvoice(invoice);
    expect(invoice.status).toBe("sent");

    // Record payment
    invoice = InvoiceService.recordPayment(invoice, {
      invoiceId: invoice.id,
      amount: invoice.totalAmount,
      paymentMethod: "cash",
    });
    expect(invoice.status).toBe("paid");
    expect(invoice.paidAmount).toBe(invoice.totalAmount);
  });

  it("should generate all export formats", () => {
    const input: CreateInvoiceInput = {
      customerId: "CUST-001",
      customerName: "أحمد محمد",
      companyName: "مغسلة السيارات",
      invoiceDate: new Date(),
      items: [
        {
          description: "غسيل",
          quantity: 1,
          unit: "عملية",
          unitPrice: 100,
          type: "service",
        },
      ],
    };

    const invoice = InvoiceService.createInvoice(input);

    const html = InvoicePDFGenerator.generateInvoiceHTML(invoice);
    const csv = InvoicePDFGenerator.generateInvoiceCSV(invoice);
    const json = InvoicePDFGenerator.generateInvoiceJSON(invoice);

    expect(html).toBeDefined();
    expect(csv).toBeDefined();
    expect(json).toBeDefined();
  });
});
