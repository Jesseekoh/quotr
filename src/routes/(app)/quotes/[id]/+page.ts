import { getQuote } from '#lib/api/quotes';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const quote = await getQuote(params.id, fetch);
	return { quote };
};
