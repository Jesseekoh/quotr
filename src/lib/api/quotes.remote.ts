import { command, query } from '$app/server';
import { requireAuth } from './guard';
import { db } from '../server/db';
import * as table from '../server/db/schema';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { generateQuoteNumber } from '#lib/utils/quotes.js';
import { error } from '@sveltejs/kit';

type Quote = typeof table.quote.$inferSelect;
type Option = typeof table.quoteOption.$inferSelect;

type QuoteItem = typeof table.quoteItem.$inferSelect;

const quoteChildIdSchema = z.object({ quoteId: z.string(), id: z.string() });

export const getQuotes = query(async () => {
	const user = requireAuth();

	const quotes = await db.query.quote.findMany({
		where: eq(table.quote.userId, user.id),
		with: {
			customer: true
			// options: true,
			// sections: true
		}
	});

	return quotes;
});

export const getQuote = query(z.string(), async (id) => {
	const user = requireAuth();
	const quote = await db.query.quote.findFirst({
		where: and(eq(table.quote.id, id), eq(table.quote.userId, user.id)),
		// with: quoteWithRelations as never
		with: {
			items: true,
			customer: true,
			options: {
				with: {
					items: true
				}
			},
			sections: {
				with: {
					items: true,
					options: {
						with: {
							items: true
						}
					}
				}
			}
		}
	});
	if (!quote) error(404, `Quote ${id} not found`);
	return attachSummary(quote);
});

export const createQuote = command(
	z.object({
		customerId: z.string(),
		quoteNumber: z.string().optional(),
		label: z.enum(table.priceLabels),
		loadProfileTotal: z.number().optional(),
		loadProfileNotes: z.string().optional(),
		paymentTerms: z.string().optional(),
		notes: z.string().optional()
	}),
	async (payload) => {
		const user = requireAuth();
		const customer = await db.query.customer.findFirst({
			where: and(eq(table.customer.id, payload.customerId), eq(table.customer.userId, user.id))
		});
		if (!customer) error(404, `Customer ${payload.customerId} not found`);
		const quoteNumber = payload.quoteNumber ?? generateQuoteNumber();
		const [quote] = await db
			.insert(table.quote)
			.values({ ...payload, quoteNumber, userId: user.id })
			.returning();
		return quote;
	}
);

// export interface UpdateQuotePayload {
// 	label?: PriceLabel;
// 	status?: QuoteStatus;
// 	loadProfileTotal?: number | null;
// 	loadProfileNotes?: string;
// 	paymentTerms?: string;
// 	notes?: string;
// }
export const updateQuote = command(
	z.object({
		id: z.string(),
		customerId: z.string().optional(),
		label: z.enum(table.priceLabels).optional(),
		status: z.enum(table.quoteStatuses).optional(),
		loadProfileTotal: z.number().nullable().optional(),
		loadProfileNotes: z.string().nullable().optional(),
		paymentTerms: z.string().nullable().optional(),
		notes: z.string().nullable().optional()
	}),
	async (payload) => {
		const user = requireAuth();
		const existing = await findQuoteOrThrow(user.id, payload.id);
		if (payload.customerId) {
			const customer = await db.query.customer.findFirst({
				where: and(eq(table.customer.id, payload.customerId), eq(table.customer.userId, user.id))
			});
			if (!customer) error(404, `Customer ${payload.customerId} not found`);
		}

		const { id, ...updateData } = payload;
		const [updatedQuote] = await db
			.update(table.quote)
			.set({ ...updateData })
			.where(and(eq(table.quote.id, id), eq(table.quote.userId, user.id)))
			.returning();

		if (!updatedQuote) error(404, `Quote ${id} not found`);
		if (payload.label && payload.label !== existing.label) {
			await recalculatePricesForLabel(user.id, id, payload.label);
		}
		return getQuote(id);
	}
);

export const removeQuote = command(z.string(), async (id) => {
	const user = requireAuth();
	await db.delete(table.quote).where(and(eq(table.quote.id, id), eq(table.quote.userId, user.id)));
});

export const addOption = command(
	z.object({
		quoteId: z.string(),
		quoteSectionId: z.string().optional(),
		name: z.string(),
		description: z.string().optional(),
		isDefault: z.boolean().optional(),
		sortOrder: z.number().optional()
	}),
	async (payload) => {
		const user = requireAuth();
		await findQuoteOrThrow(user.id, payload.quoteId);
		if (!payload.quoteSectionId) error(400, 'quoteSectionId is required');
		await findSectionOrThrow(user.id, payload.quoteId, payload.quoteSectionId);
		await db.insert(table.quoteOption).values({ ...payload });
		return getQuote(payload.quoteId);
	}
);

export const updateOption = command(
	z.object({
		quoteId: z.string(),
		id: z.string(),
		quoteSectionId: z.string().nullable().optional(),
		name: z.string().optional(),
		description: z.string().nullable().optional(),
		isDefault: z.boolean().optional(),
		sortOrder: z.number().optional()
	}),
	async ({ quoteId, id, quoteSectionId, ...data }) => {
		const user = requireAuth();
		await findOptionOrThrow(user.id, quoteId, id);
		if (quoteSectionId) await findSectionOrThrow(user.id, quoteId, quoteSectionId);
		await db
			.update(table.quoteOption)
			.set({ ...data, quoteSectionId })
			.where(eq(table.quoteOption.id, id));
		return getQuote(quoteId);
	}
);

export const removeOption = command(quoteChildIdSchema, async ({ quoteId, id }) => {
	const user = requireAuth();
	await findOptionOrThrow(user.id, quoteId, id);
	await db.delete(table.quoteOption).where(eq(table.quoteOption.id, id));
	return getQuote(quoteId);
});

const itemSchema = z.object({
	quoteId: z.string(),
	data: z.object({
		productId: z.string().optional(),
		description: z.string().optional(),
		brand: z.string().optional(),
		specification: z.string().optional(),
		category: z.enum(table.productCategories).optional(),
		quantity: z.number().int().positive().optional(),
		unit: z.string().optional(),
		unitPrice: z.number().optional(),
		sortOrder: z.number().int().optional()
	}),
	quoteOptionId: z.string().nullable().optional(),
	quoteSectionId: z.string().nullable().optional()
});

export const addItem = command(itemSchema, async ({ quoteId, ...payload }) => {
	const user = requireAuth();
	const quote = await findQuoteOrThrow(user.id, quoteId);
	if (!payload.quoteSectionId) error(400, 'quoteSectionId is required');
	if (payload.quoteOptionId) await findOptionOrThrow(user.id, quoteId, payload.quoteOptionId);
	await findSectionOrThrow(user.id, quoteId, payload.quoteSectionId);
	const data = await buildItemData(user.id, quote, payload.data);
	await db.insert(table.quoteItem).values({
		quoteId,
		quoteOptionId: payload.quoteOptionId ?? null,
		quoteSectionId: payload.quoteSectionId,
		...data
	} as typeof table.quoteItem.$inferInsert);
	return getQuote(quoteId);
});

export const updateItem = command(
	itemSchema.partial().extend({ quoteId: z.string(), id: z.string() }),
	async ({ quoteId, id, ...payload }) => {
		const user = requireAuth();
		const quote = await findQuoteOrThrow(user.id, quoteId);
		const item = await findItemOrThrow(user.id, quoteId, id);
		if (payload.quoteOptionId) await findOptionOrThrow(user.id, quoteId, payload.quoteOptionId);
		if (payload.quoteSectionId) await findSectionOrThrow(user.id, quoteId, payload.quoteSectionId);
		const data = await buildItemData(user.id, quote, { ...item, ...payload });
		await db
			.update(table.quoteItem)
			.set({
				...data,
				quoteOptionId: payload.quoteOptionId ?? item.quoteOptionId,
				quoteSectionId: payload.quoteSectionId ?? item.quoteSectionId
			})
			.where(eq(table.quoteItem.id, id));
		return getQuote(quoteId);
	}
);

export const removeItem = command(quoteChildIdSchema, async ({ quoteId, id }) => {
	const user = requireAuth();
	await findItemOrThrow(user.id, quoteId, id);
	await db.delete(table.quoteItem).where(eq(table.quoteItem.id, id));
	return getQuote(quoteId);
});

export const addSection = command(
	z.object({ quoteId: z.string(), name: z.string(), sortOrder: z.number().int().optional() }),
	async ({ quoteId, ...data }) => {
		console.log('addSection called with quoteId:', quoteId, 'data:', data);
		const user = requireAuth();
		await findQuoteOrThrow(user.id, quoteId);
		await db.insert(table.quoteSection).values({ quoteId, ...data });
		return getQuote(quoteId);
	}
);

export const updateSection = command(
	z.object({
		quoteId: z.string(),
		id: z.string(),
		name: z.string().optional(),
		sortOrder: z.number().int().optional()
	}),
	async ({ quoteId, id, ...data }) => {
		const user = requireAuth();
		await findSectionOrThrow(user.id, quoteId, id);
		await db.update(table.quoteSection).set(data).where(eq(table.quoteSection.id, id));
		return getQuote(quoteId);
	}
);

export const removeSection = command(quoteChildIdSchema, async ({ quoteId, id }) => {
	const user = requireAuth();
	await findSectionOrThrow(user.id, quoteId, id);
	const [items, options] = await Promise.all([
		db.$count(table.quoteItem, eq(table.quoteItem.quoteSectionId, id)),
		db.$count(table.quoteOption, eq(table.quoteOption.quoteSectionId, id))
	]);
	if (items || options) error(400, 'Only empty sections can be removed');
	await db.delete(table.quoteSection).where(eq(table.quoteSection.id, id));
	return getQuote(quoteId);
});

async function findQuoteOrThrow(userId: string, id: string) {
	const quote = await db.query.quote.findFirst({
		where: and(eq(table.quote.id, id), eq(table.quote.userId, userId))
	});
	if (!quote) error(404, `Quote ${id} not found`);
	return quote;
}

async function findOptionOrThrow(userId: string, quoteId: string, id: string) {
	const option = await db.query.quoteOption.findFirst({
		where: and(eq(table.quoteOption.id, id), eq(table.quoteOption.quoteId, quoteId))
	});
	if (!option) error(404, `Option ${id} not found on quote ${quoteId}`);
	return option;
}

async function findItemOrThrow(userId: string, quoteId: string, id: string) {
	const item = await db.query.quoteItem.findFirst({
		where: and(eq(table.quoteItem.id, id), eq(table.quoteItem.quoteId, quoteId))
	});
	if (!item) error(404, `Item ${id} not found on quote ${quoteId}`);
	return item;
}

async function findSectionOrThrow(userId: string, quoteId: string, id: string) {
	const section = await db.query.quoteSection.findFirst({
		where: and(eq(table.quoteSection.id, id), eq(table.quoteSection.quoteId, quoteId))
	});
	if (!section) error(404, `Section ${id} not found on quote ${quoteId}`);
	return section;
}

async function recalculatePricesForLabel(
	userId: string,
	quoteId: string,
	label: (typeof table.priceLabels)[number]
) {
	const items = await db.query.quoteItem.findMany({
		where: and(eq(table.quoteItem.quoteId, quoteId), isNotNull(table.quoteItem.productId)),
		with: { product: true }
	});
	await db.transaction(async (tx) => {
		for (const item of items) {
			if (!item.product) continue;
			const unitPrice = getPriceForLabel(item.product, label);
			await tx
				.update(table.quoteItem)
				.set({ unitPrice, totalPrice: unitPrice * item.quantity })
				.where(eq(table.quoteItem.id, item.id));
		}
	});
}

async function buildItemData(
	userId: string,
	quote: { label: (typeof table.priceLabels)[number] },
	payload: ItemPayload
) {
	const quantity = payload.quantity ?? 1;
	if (payload.productId) {
		const product = await db.query.product.findFirst({
			where: and(eq(table.product.id, payload.productId), eq(table.product.userId, userId))
		});
		if (!product) error(404, `Product ${payload.productId} not found`);
		const unitPrice = payload.unitPrice ?? getPriceForLabel(product, quote.label);
		return {
			productId: product.id,
			description: payload.description ?? `${product.brand} ${product.specification}`,
			brand: payload.brand ?? product.brand,
			specification: payload.specification ?? product.specification,
			category: payload.category ?? product.category,
			quantity,
			unit: payload.unit ?? product.unit ?? 'pcs',
			unitPrice,
			totalPrice: unitPrice * quantity,
			sortOrder: payload.sortOrder ?? 0
		};
	}
	if (!payload.description) error(400, 'description is required when productId is not provided');
	if (payload.unitPrice === undefined || payload.unitPrice === null)
		error(400, 'unitPrice is required when productId is not provided');
	const unitPrice = payload.unitPrice;
	return {
		productId: null,
		description: payload.description,
		brand: payload.brand ?? null,
		specification: payload.specification ?? null,
		category: payload.category ?? null,
		quantity,
		unit: payload.unit ?? 'pcs',
		unitPrice,
		totalPrice: unitPrice * quantity,
		sortOrder: payload.sortOrder ?? 0
	};
}

function getPriceForLabel(
	product: typeof table.product.$inferSelect,
	label: (typeof table.priceLabels)[number]
) {
	return {
		DISCOUNT_PRICE: product.discountPrice,
		RESALE_PRICE: product.resalePrice,
		SPECIAL_PRICE: product.specialPrice,
		ENDUSER_PRICE: product.enduserPrice
	}[label];
}

type ItemPayload = {
	quoteOptionId?: string | null;
	quoteSectionId?: string | null;
	productId?: string | null;
	description?: string | null;
	brand?: string | null;
	specification?: string | null;
	category?: (typeof table.productCategories)[number] | null;
	quantity?: number | null;
	unit?: string | null;
	unitPrice?: number | null;
	sortOrder?: number | null;
};

type QuoteWithRelations = Quote & {
	options?: (Option & { items: QuoteItem[] })[];
	items?: QuoteItem[];
	sections?: (typeof table.quoteSection.$inferSelect & {
		options?: (Option & { items: QuoteItem[] })[];
	})[];
};

function attachSummary(quote: QuoteWithRelations) {
	const commonItemsTotal = (quote.items ?? []).reduce(
		(sum: number, item: QuoteItem) => sum + Number(item.totalPrice),
		0
	);

	const options = (quote.options ?? []).map((option) => {
		const optionItemsTotal = (option.items ?? []).reduce(
			(sum: number, item: QuoteItem) => sum + Number(item.totalPrice),
			0
		);
		return {
			...option,
			optionItemsTotal,
			grandTotal: commonItemsTotal + optionItemsTotal
		};
	});

	const grandTotals = options.length
		? options.map((option) => option.grandTotal)
		: [commonItemsTotal];

	return {
		...quote,
		options,
		summary: {
			commonItemsTotal,
			minTotal: Math.min(...grandTotals),
			maxTotal: Math.max(...grandTotals)
		}
	};
}
