// src/schema/index.ts
import { pgTable, uuid, varchar, text, decimal, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';

// ====================================
// USERS & AUTH TABLES
// ====================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  role: varchar('role', { length: 20 }).notNull().default('cashier'), // owner, admin, cashier
  isActive: boolean('is_active').notNull().default(true),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ====================================
// PRODUCT & INVENTORY TABLES
// ====================================

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 7 }).default('#3B82F6'), // hex color
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }).unique().notNull(),
  barcode: varchar('barcode', { length: 100 }).unique(),
  categoryId: uuid('category_id').references(() => categories.id),
  description: text('description'),
  
  // Pricing
  costPrice: decimal('cost_price', { precision: 12, scale: 2 }).notNull(),
  sellPrice: decimal('sell_price', { precision: 12, scale: 2 }).notNull(),
  
  // Inventory
  stockQuantity: integer('stock_quantity').notNull().default(0),
  minStockAlert: integer('min_stock_alert').default(10),
  maxStock: integer('max_stock'),
  
  // Product info
  unit: varchar('unit', { length: 20 }).default('pcs'), // pcs, kg, liter, etc
  weight: decimal('weight', { precision: 8, scale: 2 }),
  dimensions: jsonb('dimensions'), // {length, width, height}
  
  // Media & status
  imageUrl: text('image_url'),
  images: jsonb('images'), // array of image urls
  isActive: boolean('is_active').notNull().default(true),
  isTaxable: boolean('is_taxable').notNull().default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ====================================
// CUSTOMER & SUPPLIER TABLES
// ====================================

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  
  // Customer specific
  customerCode: varchar('customer_code', { length: 50 }).unique(),
  loyaltyPoints: integer('loyalty_points').default(0),
  totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0'),
  
  // Metadata
  notes: text('notes'),
  tags: jsonb('tags'), // array of tags
  isActive: boolean('is_active').notNull().default(true),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  
  // Supplier specific
  supplierCode: varchar('supplier_code', { length: 50 }).unique(),
  contactPerson: varchar('contact_person', { length: 255 }),
  paymentTerms: varchar('payment_terms', { length: 100 }), // Net 30, COD, etc
  
  // Financial
  totalPurchased: decimal('total_purchased', { precision: 12, scale: 2 }).default('0'),
  outstandingBalance: decimal('outstanding_balance', { precision: 12, scale: 2 }).default('0'),
  
  // Metadata
  notes: text('notes'),
  tags: jsonb('tags'),
  isActive: boolean('is_active').notNull().default(true),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ====================================
// TRANSACTION TABLES (SALES)
// ====================================

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  transactionNumber: varchar('transaction_number', { length: 50 }).unique().notNull(),
  
  // Customer & Staff
  customerId: uuid('customer_id').references(() => customers.id),
  cashierId: uuid('cashier_id').references(() => users.id).notNull(),
  
  // Financial totals
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0'),
  discountPercent: decimal('discount_percent', { precision: 5, scale: 2 }).default('0'),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0'),
  taxPercent: decimal('tax_percent', { precision: 5, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  
  // Payment
  amountPaid: decimal('amount_paid', { precision: 12, scale: 2 }).notNull(),
  changeAmount: decimal('change_amount', { precision: 12, scale: 2 }).default('0'),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(), // cash, card, ewallet
  paymentStatus: varchar('payment_status', { length: 20 }).default('completed'), // pending, completed, refunded
  
  // Transaction details
  itemCount: integer('item_count').notNull(),
  status: varchar('status', { length: 20 }).default('completed'), // pending, completed, cancelled, refunded
  notes: text('notes'),
  
  // Receipt info
  receiptPrinted: boolean('receipt_printed').default(false),
  receiptEmail: varchar('receipt_email', { length: 255 }),
  
  // Metadata
  metadata: jsonb('metadata'), // for future AI analysis
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transactionItems = pgTable('transaction_items', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  transactionId: uuid('transaction_id').references(() => transactions.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  
  // Product info at time of sale
  productName: varchar('product_name', { length: 255 }).notNull(),
  productSku: varchar('product_sku', { length: 100 }).notNull(),
  
  // Quantity & pricing
  quantity: decimal('quantity', { precision: 10, scale: 3 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
  
  // Discounts
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0'),
  discountPercent: decimal('discount_percent', { precision: 5, scale: 2 }).default('0'),
  finalPrice: decimal('final_price', { precision: 12, scale: 2 }).notNull(),
  
  // Cost tracking for profit calculation
  costPrice: decimal('cost_price', { precision: 12, scale: 2 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ====================================
// PURCHASE ORDER TABLES
// ====================================

export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  poNumber: varchar('po_number', { length: 50 }).unique().notNull(),
  
  // Supplier & staff
  supplierId: uuid('supplier_id').references(() => suppliers.id).notNull(),
  createdById: uuid('created_by_id').references(() => users.id).notNull(),
  approvedById: uuid('approved_by_id').references(() => users.id),
  
  // Financial
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  
  // Status & dates
  status: varchar('status', { length: 20 }).default('draft'), // draft, sent, approved, received, cancelled
  expectedDelivery: timestamp('expected_delivery'),
  actualDelivery: timestamp('actual_delivery'),
  
  // Notes
  notes: text('notes'),
  terms: text('terms'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const purchaseOrderItems = pgTable('purchase_order_items', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  purchaseOrderId: uuid('purchase_order_id').references(() => purchaseOrders.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  
  // Order details
  quantity: decimal('quantity', { precision: 10, scale: 3 }).notNull(),
  unitCost: decimal('unit_cost', { precision: 12, scale: 2 }).notNull(),
  totalCost: decimal('total_cost', { precision: 12, scale: 2 }).notNull(),
  
  // Received tracking
  quantityReceived: decimal('quantity_received', { precision: 10, scale: 3 }).default('0'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, partial, received
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ====================================
// INVENTORY MOVEMENT TABLES
// ====================================

export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  productId: uuid('product_id').references(() => products.id).notNull(),
  
  // Movement details
  type: varchar('type', { length: 20 }).notNull(), // sale, purchase, adjustment, return, damage
  quantity: decimal('quantity', { precision: 10, scale: 3 }).notNull(), // positive for in, negative for out
  previousStock: decimal('previous_stock', { precision: 10, scale: 3 }).notNull(),
  newStock: decimal('new_stock', { precision: 10, scale: 3 }).notNull(),
  
  // Cost tracking
  unitCost: decimal('unit_cost', { precision: 12, scale: 2 }),
  totalValue: decimal('total_value', { precision: 12, scale: 2 }),
  
  // References
  referenceId: uuid('reference_id'), // transaction_id, purchase_order_id, etc
  referenceType: varchar('reference_type', { length: 50 }), // transaction, purchase_order, adjustment
  
  // User & notes
  userId: uuid('user_id').references(() => users.id),
  notes: text('notes'),
  reason: varchar('reason', { length: 100 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ====================================
// SETTINGS & CONFIGURATION
// ====================================

export const settings = pgTable('settings', {
  id: uuid('id').primaryKey().$defaultFn(() => createId()),
  key: varchar('key', { length: 100 }).unique().notNull(),
  value: jsonb('value').notNull(),
  category: varchar('category', { length: 50 }).notNull(), // business, tax, payment, etc
  description: text('description'),
  isPublic: boolean('is_public').default(false), // can be accessed by client
  updatedBy: uuid('updated_by').references(() => users.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ====================================
// RELATIONS
// ====================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  transactions: many(transactions),
  purchaseOrders: many(purchaseOrders),
  stockMovements: many(stockMovements),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  transactionItems: many(transactionItems),
  purchaseOrderItems: many(purchaseOrderItems),
  stockMovements: many(stockMovements),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  transactions: many(transactions),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  purchaseOrders: many(purchaseOrders),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.id],
  }),
  cashier: one(users, {
    fields: [transactions.cashierId],
    references: [users.id],
  }),
  items: many(transactionItems),
}));

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionItems.transactionId],
    references: [transactions.id],
  }),
  product: one(products, {
    fields: [transactionItems.productId],
    references: [products.id],
  }),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [purchaseOrders.supplierId],
    references: [suppliers.id],
  }),
  createdBy: one(users, {
    fields: [purchaseOrders.createdById],
    references: [users.id],
  }),
  items: many(purchaseOrderItems),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  product: one(products, {
    fields: [purchaseOrderItems.productId],
    references: [products.id],
  }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  product: one(products, {
    fields: [stockMovements.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [stockMovements.userId],
    references: [users.id],
  }),
}));