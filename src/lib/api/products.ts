import { api } from './client';
import type { Product, ProductCategory } from './types';

export function searchProducts(
	params: { category?: ProductCategory | ''; brand?: string; search?: string },
	fetchFn?: typeof fetch
) {
	const qs = new URLSearchParams();
	if (params.category) qs.set('category', params.category);
	if (params.brand) qs.set('brand', params.brand);
	if (params.search) qs.set('search', params.search);
	const query = qs.toString();
	return api.get<Product[]>(`/products${query ? `?${query}` : ''}`, fetchFn);
}

export function getProduct(id: string, fetchFn?: typeof fetch) {
	return api.get<Product>(`/products/${id}`, fetchFn);
}
