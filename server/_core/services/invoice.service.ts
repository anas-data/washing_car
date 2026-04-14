/**
 * Invoice Service
 * Handles invoice creation, management, and PDF generation
 */

export interface CreateInvoiceInput {
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
  items: CreateInvoiceItemInput[];
  taxRate?: number;
  discountAmount?: number;
  discountReason?: string;
  notes?: string;
  terms?: string;
  createdBy?: number;
}

export interface CreateInvoiceItemInput {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  type: "service" | "product";
  serviceType?: string;
}

export interface UpdateInvoiceInput {
  status?: string;
  notes?: string;
  terms?: string;
  discountAmount?: number;
  discountReason?: string;
  taxRate?: number;
}

export interface RecordPaymentInput {
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  paymentDate?: Date;
  reference?: string;
  notes?: string;
  recordedBy?: number;
}

export interface Invoice {
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

export interface InvoiceItem {
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

export interface InvoicePayment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  reference?: string;
  notes?: string;
  recordedBy?: number;
}

export class InvoiceService {
  /**
   * Generate unique invoice number
   */
  static generateInvoiceNumber(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");

    return `INV-${year}${month}-${random}`;
  }

  /**
   * Create a new invoice
   */
  static createInvoice(input: CreateInvoiceInput): Invoice {
    const invoiceNumber = this.generateInvoiceNumber();

    // Calculate totals
    let subtotal = 0;
    const itemsData = input.items.map((item) => {
      const totalPrice = item.quantity * item.unitPrice;
      subtotal += totalPrice;
      return {
        id: Math.floor(Math.random() * 100000),
        invoiceId: Math.floor(Math.random() * 100000),
        ...item,
        totalPrice,
      };
    });

    const taxRate = input.taxRate || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const discountAmount = input.discountAmount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    return {
      id: Math.floor(Math.random() * 100000),
      invoiceNumber,
      customerId: input.customerId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      customerAddress: input.customerAddress,
      companyName: input.companyName,
      companyAddress: input.companyAddress,
      companyPhone: input.companyPhone,
      companyEmail: input.companyEmail,
      companyTaxId: input.companyTaxId,
      companyLogo: input.companyLogo,
      invoiceDate: input.invoiceDate,
      dueDate: input.dueDate,
      status: "draft",
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      discountReason: input.discountReason,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      notes: input.notes,
      terms: input.terms,
      items: itemsData,
      payments: [],
      createdAt: new Date(),
    };
  }

  /**
   * Update invoice
   */
  static updateInvoice(invoice: Invoice, input: UpdateInvoiceInput): Invoice {
    const updated = { ...invoice };

    if (input.status) {
      updated.status = input.status as any;
    }

    if (input.notes) {
      updated.notes = input.notes;
    }

    if (input.terms) {
      updated.terms = input.terms;
    }

    if (input.discountAmount !== undefined) {
      updated.discountAmount = input.discountAmount;
    }

    if (input.discountReason) {
      updated.discountReason = input.discountReason;
    }

    if (input.taxRate !== undefined) {
      updated.taxRate = input.taxRate;
      updated.taxAmount = (updated.subtotal * input.taxRate) / 100;
    }

    // Recalculate total
    updated.totalAmount =
      updated.subtotal + updated.taxAmount - updated.discountAmount;
    updated.remainingAmount = updated.totalAmount - updated.paidAmount;

    return updated;
  }

  /**
   * Send invoice (change status to sent)
   */
  static sendInvoice(invoice: Invoice): Invoice {
    return {
      ...invoice,
      status: "sent",
      sentAt: new Date(),
    };
  }

  /**
   * Record payment for invoice
   */
  static recordPayment(invoice: Invoice, input: RecordPaymentInput): Invoice {
    const newPaidAmount = invoice.paidAmount + input.amount;
    let newStatus = invoice.status;

    if (newPaidAmount >= invoice.totalAmount) {
      newStatus = "paid";
    }

    const payment: InvoicePayment = {
      id: Math.floor(Math.random() * 100000),
      invoiceId: invoice.id,
      amount: input.amount,
      paymentMethod: input.paymentMethod as any,
      paymentDate: input.paymentDate || new Date(),
      reference: input.reference,
      notes: input.notes,
      recordedBy: input.recordedBy,
    };

    return {
      ...invoice,
      paidAmount: newPaidAmount,
      remainingAmount: invoice.totalAmount - newPaidAmount,
      status: newStatus as any,
      paidAt: newStatus === "paid" ? new Date() : invoice.paidAt,
      payments: [...invoice.payments, payment],
    };
  }

  /**
   * Cancel invoice
   */
  static cancelInvoice(invoice: Invoice): Invoice {
    return {
      ...invoice,
      status: "cancelled",
    };
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = "SAR"): string {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency,
    }).format(amount);
  }

  /**
   * Format date
   */
  static formatDate(date: Date, locale: string = "ar-SA"): string {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  /**
   * Generate invoice summary for display
   */
  static formatInvoice(invoice: Invoice) {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerPhone: invoice.customerPhone,
      customerAddress: invoice.customerAddress,
      companyName: invoice.companyName,
      companyAddress: invoice.companyAddress,
      companyPhone: invoice.companyPhone,
      companyEmail: invoice.companyEmail,
      companyTaxId: invoice.companyTaxId,
      companyLogo: invoice.companyLogo,
      invoiceDate: this.formatDate(invoice.invoiceDate),
      dueDate: invoice.dueDate ? this.formatDate(invoice.dueDate) : null,
      status: invoice.status,
      subtotal: this.formatCurrency(invoice.subtotal),
      taxRate: `${invoice.taxRate}%`,
      taxAmount: this.formatCurrency(invoice.taxAmount),
      discountAmount: this.formatCurrency(invoice.discountAmount),
      totalAmount: this.formatCurrency(invoice.totalAmount),
      paidAmount: this.formatCurrency(invoice.paidAmount),
      remainingAmount: this.formatCurrency(invoice.remainingAmount),
      notes: invoice.notes,
      terms: invoice.terms,
      items: invoice.items.map((item) => ({
        ...item,
        unitPrice: this.formatCurrency(item.unitPrice),
        totalPrice: this.formatCurrency(item.totalPrice),
      })),
      payments: invoice.payments.map((payment) => ({
        ...payment,
        amount: this.formatCurrency(payment.amount),
        paymentDate: this.formatDate(payment.paymentDate),
      })),
      createdAt: this.formatDate(invoice.createdAt),
      sentAt: invoice.sentAt ? this.formatDate(invoice.sentAt) : null,
      paidAt: invoice.paidAt ? this.formatDate(invoice.paidAt) : null,
    };
  }
}
