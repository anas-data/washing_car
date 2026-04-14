/**
 * Invoice Router
 * tRPC routes for invoice operations
 */

import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { InvoiceService, CreateInvoiceInput } from "../services/invoice.service";

// Validation schemas
const invoiceItemSchema = z.object({
  description: z.string().min(1, "الوصف مطلوب"),
  quantity: z.number().positive("الكمية يجب أن تكون موجبة"),
  unit: z.string().min(1, "الوحدة مطلوبة"),
  unitPrice: z.number().nonnegative("السعر يجب أن يكون موجباً"),
  type: z.enum(["service", "product"]),
  serviceType: z.string().optional(),
});

const createInvoiceSchema = z.object({
  customerId: z.string().min(1, "معرف العميل مطلوب"),
  customerName: z.string().min(1, "اسم العميل مطلوب"),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  companyName: z.string().min(1, "اسم الشركة مطلوب"),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email().optional(),
  companyTaxId: z.string().optional(),
  companyLogo: z.string().url().optional(),
  invoiceDate: z.date(),
  dueDate: z.date().optional(),
  items: z.array(invoiceItemSchema).min(1, "يجب إضافة بند واحد على الأقل"),
  taxRate: z.number().nonnegative().optional(),
  discountAmount: z.number().nonnegative().optional(),
  discountReason: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

const updateInvoiceSchema = z.object({
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  discountAmount: z.number().nonnegative().optional(),
  discountReason: z.string().optional(),
  taxRate: z.number().nonnegative().optional(),
});

const recordPaymentSchema = z.object({
  invoiceId: z.number().positive(),
  amount: z.number().positive("المبلغ يجب أن يكون موجباً"),
  paymentMethod: z.enum(["cash", "credit_card", "debit_card", "bank_transfer", "check"]),
  paymentDate: z.date().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const listInvoicesSchema = z.object({
  customerId: z.string().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
  limit: z.number().positive().optional(),
  offset: z.number().nonnegative().optional(),
});

/**
 * Invoice Router
 */
export const invoiceRouter = router({
  /**
   * Create a new invoice
   */
  create: publicProcedure
    .input(createInvoiceSchema)
    .mutation(async ({ input }) => {
      try {
        const invoice = InvoiceService.createInvoice(input as CreateInvoiceInput);
        return {
          success: true,
          data: invoice,
          message: "تم إنشاء الفاتورة بنجاح",
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "فشل إنشاء الفاتورة",
        };
      }
    }),

  /**
   * Get invoice by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number().positive() }))
    .query(async ({ input }) => {
      try {
        // In a real app, this would fetch from database
        // For now, return a mock invoice
        return {
          success: true,
          data: {
            id: input.id,
            invoiceNumber: "INV-202604-0001",
            customerName: "أحمد محمد",
            totalAmount: 1500,
            status: "draft",
            items: [],
            payments: [],
          },
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "فشل جلب الفاتورة",
        };
      }
    }),

  /**
   * List invoices with filters
   */
  list: publicProcedure
    .input(listInvoicesSchema)
    .query(async ({ input }) => {
      try {
        // In a real app, this would query the database
        // For now, return mock data
        return {
          success: true,
          data: [],
          total: 0,
          message: "تم جلب الفواتير بنجاح",
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "فشل جلب الفواتير",
        };
      }
    }),

  /**
   * Update invoice
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.number().positive(),
        data: updateInvoiceSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        // In a real app, this would update the database
        return {
          success: true,
          message: "تم تحديث الفاتورة بنجاح",
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "فشل تحديث الفاتورة",
        };
      }
    }),

  /**
   * Send invoice
   */
  send: publicProcedure
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ input }) => {
      try {
        // In a real app, this would send the invoice via email
        return {
          success: true,
          message: "تم إرسال الفاتورة بنجاح",
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "فشل إرسال الفاتورة",
        };
      }
    }),

  /**
   * Record payment
   */
  recordPayment: publicProcedure
    .input(recordPaymentSchema)
    .mutation(async ({ input }) => {
      try {
        // In a real app, this would record the payment in database
        return {
          success: true,
          message: "تم تسجيل الدفع بنجاح",
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "فشل تسجيل الدفع",
        };
      }
    }),

  /**
   * Cancel invoice
   */
  cancel: publicProcedure
    .input(
      z.object({
        id: z.number().positive(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // In a real app, this would cancel the invoice in database
        return {
          success: true,
          message: "تم إلغاء الفاتورة بنجاح",
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "فشل إلغاء الفاتورة",
        };
      }
    }),

  /**
   * Export invoice as PDF
   */
  exportPDF: publicProcedure
    .input(z.object({ id: z.number().positive() }))
    .query(async ({ input }) => {
      try {
        // In a real app, this would generate PDF
        return {
          success: true,
          data: {
            url: `/invoices/${input.id}.pdf`,
            filename: `invoice-${input.id}.pdf`,
          },
          message: "تم إنشاء ملف PDF بنجاح",
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "فشل إنشاء ملف PDF",
        };
      }
    }),

  /**
   * Export invoice as CSV
   */
  exportCSV: publicProcedure
    .input(z.object({ id: z.number().positive() }))
    .query(async ({ input }) => {
      try {
        // In a real app, this would generate CSV
        return {
          success: true,
          data: {
            url: `/invoices/${input.id}.csv`,
            filename: `invoice-${input.id}.csv`,
          },
          message: "تم إنشاء ملف CSV بنجاح",
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "فشل إنشاء ملف CSV",
        };
      }
    }),

  /**
   * Get invoice statistics
   */
  getStatistics: publicProcedure
    .input(
      z.object({
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        // In a real app, this would calculate from database
        return {
          success: true,
          data: {
            totalInvoices: 0,
            totalRevenue: 0,
            totalPaid: 0,
            totalPending: 0,
            averageInvoiceValue: 0,
            invoicesByStatus: {
              draft: 0,
              sent: 0,
              paid: 0,
              overdue: 0,
              cancelled: 0,
            },
          },
          message: "تم جلب الإحصائيات بنجاح",
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "فشل جلب الإحصائيات",
        };
      }
    }),

  /**
   * Get invoice templates
   */
  getTemplates: publicProcedure.query(async () => {
    try {
      // In a real app, this would fetch from database
      return {
        success: true,
        data: [
          {
            id: 1,
            name: "القالب الافتراضي",
            isDefault: true,
          },
        ],
        message: "تم جلب القوالب بنجاح",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "فشل جلب القوالب",
      };
    }
  }),
});
