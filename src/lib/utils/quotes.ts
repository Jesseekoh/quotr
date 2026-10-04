// import { and, desc, eq, like } from 'drizzle-orm';
// import { db } from '../server/db';
// import * as table from '../server/db/schema';
export function generateQuoteNumber() {
	const now = new Date();
	const stamp = now
		.toISOString()
		.replace(/[-:T.]/g, '')
		.slice(0, 14);
	return `Q-${stamp}`;
}
