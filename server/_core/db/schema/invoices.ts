/**
 * Invoice Schema
 * Defines the database structure for invoices
 */

import {
  pgTable,
  serial,
  varchar,
  text,
  decimal,
  timestamp,
  integer,
  jsonb,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Invoice status enum
export const invoiceStatusEnum = pgEnum("invoice_status", {
  draft: "draft",
  sent: "sent",
  paid: "paid",
  overdue: "overdue",
  cancelled: "cancelled",
});

// Payment method enum
export const paymentMethodEnum = pgEnum("payment_method", {
  cash: "cash",
  credit_card: "credit_card",
  debit_card: "debit_card",
  bank_transfer: "bank_transfer",
  check: "check",
});

/**
 * Invoices table
 * Stores invoice records
 */
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).unique().notNull(),
  customerId: varchar("customer_id", { length: 100 }).notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 20 }),
  customerAddress: text("customer_address"),

  // Company information
  companyName: varchar("company_name", { length: 255 }).notNull(),
  companyAddress: text("company_address"),
  companyPhone: varchar("company_phone", { length: 20 }),
  companyEmail: varchar("company_email", { length: 255 }),
  companyTaxId: varchar("company_tax_id", { length: 50 }),
  companyLogo: text("company_logo"), // URL to company logo

  // Invoice details
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date"),
  status: invoiceStatusEnum("status").default("draft").notNull(),

  // Financial information
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  discountReason: text("discount_reason"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),

  // Payment information
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentDate: timestamp("payment_date"),
  paymentReference: varchar("payment_reference", { length: 100 }),

  // Operations linked to invoice
  operationIds: jsonb("operation_ids").$type<number[]>().default([]),

  // Notes and terms
  notes: text("notes"),
  terms: text("terms"),

  // Metadata
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
  paidAt: timestamp("paid_at"),

  // Document URLs
  pdfUrl: text("pdf_url"),
  htmlUrl: text("html_url"),
});

/**
 * Invoice items table
 * Stores individual line items for each invoice
 */
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id")
    .references(() => invoices.id, { onDelete: "cascade" })
    .notNull(),

  // Item details
  description: varchar("description", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(), // e.g., "لتر", "قطعة", "ساعة"
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),

  // Service/Product type
  type: varchar("type", { length: 50 }).notNull(), // "service" or "product"
  serviceType: varchar("service_type", { length: 100 }), // e.g., "wash", "maintenance", "inspection"

  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Invoice payments table
 * Tracks payment history for each invoice
 */
export const invoicePayments = pgTable("invoice_payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id")
    .references(() => invoices.id, { onDelete: "cascade" })
    .notNull(),

  // Payment details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  reference: varchar("reference", { length: 100 }),
  notes: text("notes"),

  // Metadata
  recordedBy: integer("recorded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Invoice templates table
 * Stores customizable invoice templates
 */
export const invoiceTemplates = pgTable("invoice_templates", {
  id: serial("id").primaryKey(),

  // Template details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),

  // Template configuration
  headerHtml: text("header_html"),
  footerHtml: text("footer_html"),
  termsText: text("terms_text"),
  notesText: text("notes_text"),

  // Styling
  primaryColor: varchar("primary_color", { length: 7 }).default("#000000"),
  secondaryColor: varchar("secondary_color", { length: 7 }).default("#666666"),
  fontFamily: varchar("font_family", { length: 100 }).default("Arial"),

  // Company branding
  companyName: varchar("company_name", { length: 255 }),
  companyLogo: text("company_logo"),
  companyAddress: text("company_address"),
  companyPhone: varchar("company_phone", { length: 20 }),
  companyEmail: varchar("company_email", { length: 255 }),
  companyTaxId: varchar("company_tax_id", { length: 50 }),

  // Tax settings
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxLabel: varchar("tax_label", { length: 100 }).default("ضريبة القيمة المضافة"),

  // Metadata
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Invoice audit log table
 * Tracks all changes to invoices
 */
export const invoiceAuditLog = pgTable("invoice_audit_log", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id")
    .references(() => invoices.id, { onDelete: "cascade" })
    .notNull(),

  // Action details
  action: varchar("action", { length: 50 }).notNull(), // "created", "updated", "sent", "paid", "cancelled"
  changedFields: jsonb("changed_fields").$type<Record<string, unknown>>(),
  oldValues: jsonb("old_values").$type<Record<string, unknown>>(),
  newValues: jsonb("new_values").$type<Record<string, unknown>>(),

  // Metadata
  changedBy: integer("changed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Relations
 */
export const invoicesRelations = relations(invoices, ({ many }) => ({
  items: many(invoiceItems),
  payments: many(invoicePayments),
  auditLog: many(invoiceAuditLog),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const invoicePaymentsRelations = relations(invoicePayments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoicePayments.invoiceId],
    references: [invoices.id],
  }),
}));

export const invoiceTemplatesRelations = relations(invoiceTemplates, ({ one }) => ({
}));

export const invoiceAuditLogRelations = relations(invoiceAuditLog, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceAuditLog.invoiceId],
    references: [invoices.id],
  }),
}));
