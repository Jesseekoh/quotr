import { getQuotes } from '#lib/api/quotes.remote.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const quotes = await getQuotes();
	return { quotes };
};
