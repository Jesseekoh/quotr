// import { getQuote } from '#lib/api/quotes';
import { getQuote } from '#lib/api/quotes.remote.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const quote = await getQuote(params.id);
	return { quote };
};
