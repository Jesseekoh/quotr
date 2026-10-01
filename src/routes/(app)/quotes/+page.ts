import { listQuotes } from '#lib/api/quotes';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const quotes = await listQuotes(fetch);
	return { quotes };
};
