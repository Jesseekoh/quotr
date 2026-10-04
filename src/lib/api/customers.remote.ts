import { command } from '$app/server';
import { requireAuth } from './guard';
import { z } from 'zod';
import { and, eq, or, like } from 'drizzle-orm';
import * as table from '../server/db/schema';
import { db } from '../server/db';

export const createCustomer = command(
	z.object({
		name: z.string().max(255),
		email: z.email().optional(),
		phone: z.string().max(255).optional(),
		address: z.string().optional()
	}),
	async (data) => {
		const user = requireAuth();
		const [customer] = await db
			.insert(table.customer)
			.values({ ...data, userId: user.id })
			.returning();
		return customer;
	}
);

export const searchCustomers = command(z.string(), async (search) => {
	const user = requireAuth();
	const term = `%${search}%`;
	const customers = await db
		.select()
		.from(table.customer)
		.where(
			and(
				eq(table.customer.userId, user.id),
				or(
					like(table.customer.name, term),
					like(table.customer.email, term),
					like(table.customer.phone, term),
					like(table.customer.address, term)
				)
			)
		);
	return customers;
});
