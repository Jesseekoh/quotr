import { getProducts } from '#lib/api/products.remote.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const category = url.searchParams.get('category') ?? undefined;
	const search = url.searchParams.get('search') ?? '';

	const params = new URLSearchParams();
	if (category) params.set('category', category);
	if (search) params.set('search', search);

	const products = await getProducts({ search, category });

	return { products, category, search };
};
