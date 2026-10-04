import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { user } from './auth.schema';
export const priceLabels = [
	'DISCOUNT_PRICE',
	'RESALE_PRICE',
	'SPECIAL_PRICE',
	'ENDUSER_PRICE'
] as const;
export type PriceLabel = (typeof priceLabels)[number];

export const quoteStatuses = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'] as const;
export type QuoteStatus = (typeof quoteStatuses)[number];

export const productCategories = [
	'SOLAR_PANEL',
	'INVERTER',
	'CHARGE_CONTROLLER',
	'BATTERY',
	'RACK_MOUNTING',
	'CABLE',
	'CABINET',
	'ACCESSORY',
	'OTHER'
] as const;
export type ProductCategory = (typeof productCategories)[number];

const timestamps = {
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
};

export const product = sqliteTable(
	'product',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),

		userId: text('user_id')
			.notNull()
			.references(() => user.id, {
				onDelete: 'cascade'
			}),

		// name: text('name').notNull(),

		brand: text('brand').notNull(),

		category: text('category', {
			enum: productCategories
		}).notNull(),

		specification: text('specification').notNull(),

		warranty: text('warranty').notNull().default('N/A'),

		technicalSpecs: text('technical_specs', {
			mode: 'json'
		}),

		unit: text('unit').default('pcs'),

		// Store money as integer minor units.
		// e.g. ₦150,000.50 -> 15000050
		costPrice: integer('cost_price').notNull(),

		discountPrice: integer('discount_price').notNull(),

		resalePrice: integer('resale_price').notNull(),

		specialPrice: integer('special_price').notNull(),

		enduserPrice: integer('enduser_price').notNull(),

		isActive: integer('is_active', {
			mode: 'boolean'
		})
			.notNull()
			.default(true),

		createdAt: integer('created_at', {
			mode: 'timestamp_ms'
		})
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),

		updatedAt: integer('updated_at', {
			mode: 'timestamp_ms'
		})
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [
		index('product_category_idx').on(table.category),
		index('product_brand_idx').on(table.brand),
		index('product_user_id_idx').on(table.userId)
	]
);

// ─────────────────────────────────────────────
// Customer
// ─────────────────────────────────────────────

export const customer = sqliteTable(
	'customer',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),

		userId: text('user_id')
			.notNull()
			.references(() => user.id, {
				onDelete: 'cascade'
			}),

		name: text('name').notNull(),

		phone: text('phone'),

		email: text('email'),

		address: text('address'),

		...timestamps
	},
	(table) => [index('customer_user_id_idx').on(table.userId)]
);

// ─────────────────────────────────────────────
// Quote
// ─────────────────────────────────────────────

export const quote = sqliteTable(
	'quote',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),

		userId: text('user_id')
			.notNull()
			.references(() => user.id, {
				onDelete: 'cascade'
			}),

		quoteNumber: text('quote_number').notNull().unique(),

		customerId: text('customer_id')
			.notNull()
			.references(() => customer.id),

		label: text('label', {
			enum: priceLabels
		})
			.notNull()
			.default('ENDUSER_PRICE'),

		status: text('status', {
			enum: quoteStatuses
		})
			.notNull()
			.default('DRAFT'),

		loadProfileTotal: integer('load_profile_total'),

		loadProfileNotes: text('load_profile_notes'),

		paymentTerms: text('payment_terms'),

		notes: text('notes'),

		...timestamps
	},
	(table) => [index('quote_user_id_idx').on(table.userId)]
);

// ─────────────────────────────────────────────
// Quote Section
// ─────────────────────────────────────────────

export const quoteSection = sqliteTable(
	'quote_section',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),

		quoteId: text('quote_id')
			.notNull()
			.references(() => quote.id, {
				onDelete: 'cascade'
			}),

		name: text('name').notNull(),

		sortOrder: integer('sort_order').notNull().default(0),

		...timestamps
	},
	(table) => [index('quote_section_quote_id_idx').on(table.quoteId)]
);

// ─────────────────────────────────────────────
// Quote Option
// ─────────────────────────────────────────────

export const quoteOption = sqliteTable(
	'quote_option',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),

		quoteId: text('quote_id')
			.notNull()
			.references(() => quote.id, {
				onDelete: 'cascade'
			}),

		name: text('name').notNull(),

		description: text('description'),

		isDefault: integer('is_default', {
			mode: 'boolean'
		})
			.notNull()
			.default(false),

		sortOrder: integer('sort_order').notNull().default(0),

		quoteSectionId: text('quote_section_id').references(() => quoteSection.id),

		...timestamps
	},
	(table) => [index('quote_option_quote_id_idx').on(table.quoteId)]
);

// ─────────────────────────────────────────────
// Quote Item
// ─────────────────────────────────────────────

export const quoteItem = sqliteTable(
	'quote_item',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),

		quoteId: text('quote_id')
			.notNull()
			.references(() => quote.id, {
				onDelete: 'cascade'
			}),

		quoteOptionId: text('quote_option_id').references(() => quoteOption.id, {
			onDelete: 'cascade'
		}),

		productId: text('product_id').references(() => product.id),

		description: text('description').notNull(),

		brand: text('brand'),

		specification: text('specification'),

		category: text('category', {
			enum: productCategories
		}),

		quantity: integer('quantity').notNull().default(1),

		unit: text('unit').default('pcs'),

		unitPrice: integer('unit_price').notNull(),

		totalPrice: integer('total_price').notNull(),

		sortOrder: integer('sort_order').notNull().default(0),

		quoteSectionId: text('quote_section_id').references(() => quoteSection.id),

		...timestamps
	},
	(table) => [
		index('quote_item_quote_id_idx').on(table.quoteId),
		index('quote_item_quote_option_id_idx').on(table.quoteOptionId)
	]
);
// ─────────────────────────────────────────────
// User relations
// ─────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
	products: many(product),
	customers: many(customer),
	quotes: many(quote)
}));

// ─────────────────────────────────────────────
// Product relations
// ─────────────────────────────────────────────

export const productRelations = relations(product, ({ one, many }) => ({
	user: one(user, {
		fields: [product.userId],
		references: [user.id]
	}),

	quoteItems: many(quoteItem)
}));

// ─────────────────────────────────────────────
// Customer relations
// ─────────────────────────────────────────────

export const customerRelations = relations(customer, ({ one, many }) => ({
	user: one(user, {
		fields: [customer.userId],
		references: [user.id]
	}),

	quotes: many(quote)
}));

// ─────────────────────────────────────────────
// Quote relations
// ─────────────────────────────────────────────

export const quoteRelations = relations(quote, ({ one, many }) => ({
	user: one(user, {
		fields: [quote.userId],
		references: [user.id]
	}),

	customer: one(customer, {
		fields: [quote.customerId],
		references: [customer.id]
	}),

	items: many(quoteItem),

	options: many(quoteOption),

	sections: many(quoteSection)
}));

// ─────────────────────────────────────────────
// Quote Section relations
// ─────────────────────────────────────────────

export const quoteSectionRelations = relations(quoteSection, ({ one, many }) => ({
	quote: one(quote, {
		fields: [quoteSection.quoteId],
		references: [quote.id]
	}),

	items: many(quoteItem),

	options: many(quoteOption)
}));

// ─────────────────────────────────────────────
// Quote Option relations
// ─────────────────────────────────────────────

export const quoteOptionRelations = relations(quoteOption, ({ one, many }) => ({
	quote: one(quote, {
		fields: [quoteOption.quoteId],
		references: [quote.id]
	}),

	quoteSection: one(quoteSection, {
		fields: [quoteOption.quoteSectionId],
		references: [quoteSection.id]
	}),

	items: many(quoteItem)
}));

// ─────────────────────────────────────────────
// Quote Item relations
// ─────────────────────────────────────────────

export const quoteItemRelations = relations(quoteItem, ({ one }) => ({
	quote: one(quote, {
		fields: [quoteItem.quoteId],
		references: [quote.id]
	}),

	quoteOption: one(quoteOption, {
		fields: [quoteItem.quoteOptionId],
		references: [quoteOption.id]
	}),

	product: one(product, {
		fields: [quoteItem.productId],
		references: [product.id]
	}),

	quoteSection: one(quoteSection, {
		fields: [quoteItem.quoteSectionId],
		references: [quoteSection.id]
	})
}));
export * from './auth.schema';
