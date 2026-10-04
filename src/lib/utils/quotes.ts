import { and, desc, eq, like } from 'drizzle-orm';
import { db } from '../server/db';
import * as table from '../server/db/schema';
export async function generateQuoteNumber(userId: string) {
	const prefix = `Q-${new Date().getFullYear()}-`;

	const [last] = await db
		.select({ quoteNumber: table.quote.quoteNumber })
		.from(table.quote)
		.where(and(eq(table.quote.userId, userId), like(table.quote.quoteNumber, `${prefix}%`)))
		.orderBy(desc(table.quote.quoteNumber))
		.limit(1);

	const next = last ? parseInt(last.quoteNumber.slice(prefix.length), 10) + 1 : 1;
	return `${prefix}${String(next).padStart(4, '0')}`;
}
