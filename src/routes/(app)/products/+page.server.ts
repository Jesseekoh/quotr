import type { PageServerLoad } from './$types';

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export const load: PageServerLoad = async ({ url, fetch }) => {
	const category = url.searchParams.get('category') ?? '';
	const search = url.searchParams.get('search') ?? '';

	const params = new URLSearchParams();
	if (category) params.set('category', category);
	if (search) params.set('search', search);

	const qs = params.toString();
	const res = await fetch(`${API_BASE}/products${qs ? `?${qs}` : ''}`);
	const products: Product[] = await res.json();

	return { products, category, search };
};

export interface Product {
	id: string;
	name: string;
	brand: string;
	category: string;
	specification: string;
	costPrice: string | number;
	discountPrice: string | number;
	resalePrice: string | number;
	specialPrice: string | number;
	enduserPrice: string | number;
}
