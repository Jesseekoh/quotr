// import * as v from 'valibot';
import { command, query } from '$app/server';
import { db } from '../server/db';
import * as table from '../server/db/schema';
import { eq, and, or, asc, like } from 'drizzle-orm';
import { z } from 'zod';
import { requireAuth } from './guard';

import { createInsertSchema } from 'drizzle-zod';

const createProductSchema = createInsertSchema(table.product).omit({
	createdAt: true,
	updatedAt: true,
	userId: true,
	id: true
});

export type Product = Awaited<ReturnType<typeof getProducts>>[number];
const searchProductsSchema = z.object({
	// category: z.enum(table.productCategories).optional(),
	category: z.string().optional(),
	brand: z.string().optional(),
	search: z.string().optional()
});
export const getProducts = query(searchProductsSchema, async (data) => {
	const user = requireAuth();
	const term = data.search ? `%${data.search}%` : undefined;

	const products = await db
		.select()
		.from(table.product)
		.where(
			and(
				eq(table.product.userId, user.id),
				eq(table.product.isActive, true),
				data.category ? eq(table.product.category, data.category) : undefined,
				data.brand ? like(table.product.brand, `%${data.brand}%`) : undefined,
				term
					? or(
							// like(table.product.name, term),
							like(table.product.brand, term),
							like(table.product.specification, term)
						)
					: undefined
			)
		)
		.orderBy(asc(table.product.brand));

	return products;
});

export const createProduct = command(createProductSchema, async (data) => {
	const user = requireAuth();

	await db.insert(table.product).values({ ...data, userId: user.id });
});
