import { api } from './client';
import type { ProductCategory, PriceLabel, QuoteDetail, QuoteStatus } from './types';

export function getQuote(id: string, fetchFn?: typeof fetch) {
	return api.get<QuoteDetail>(`/quotes/${id}`, fetchFn);
}

export interface CreateQuotePayload {
	customerId: string;
	quoteNumber?: string;
	label?: PriceLabel;
	loadProfileTotal?: number;
	loadProfileNotes?: string;
	paymentTerms?: string;
	notes?: string;
}

export function createQuote(payload: CreateQuotePayload) {
	return api.post<QuoteDetail>('/quotes', payload);
}

export function listQuotes(fetchFn?: typeof fetch) {
	return api.get<QuoteDetail[]>('/quotes', fetchFn);
}

export interface UpdateQuotePayload {
	label?: PriceLabel;
	status?: QuoteStatus;
	loadProfileTotal?: number | null;
	loadProfileNotes?: string;
	paymentTerms?: string;
	notes?: string;
}

export function updateQuote(id: string, payload: UpdateQuotePayload) {
	return api.patch<QuoteDetail>(`/quotes/${id}`, payload);
}

export interface CreateOptionPayload {
	name: string;
	description?: string;
	isDefault?: boolean;
	sortOrder?: number;
}

export function addOption(quoteId: string, payload: CreateOptionPayload) {
	return api.post<QuoteDetail>(`/quotes/${quoteId}/options`, payload);
}

export function removeOption(quoteId: string, optionId: string) {
	return api.delete<QuoteDetail>(`/quotes/${quoteId}/options/${optionId}`);
}

// Either pass `productId` (+ optional overrides) to pull from the catalog,
// or pass `description` + `unitPrice` for a freeform line item.
export interface CreateItemPayload {
	quoteOptionId?: string | null;
	productId?: string;
	description?: string;
	brand?: string;
	specification?: string;
	category?: ProductCategory;
	quantity?: number;
	unit?: string;
	unitPrice?: number;
	sortOrder?: number;
}

export function addItem(quoteId: string, payload: CreateItemPayload) {
	return api.post<QuoteDetail>(`/quotes/${quoteId}/items`, payload);
}

export function updateItem(quoteId: string, itemId: string, payload: Partial<CreateItemPayload>) {
	return api.patch<QuoteDetail>(`/quotes/${quoteId}/items/${itemId}`, payload);
}

export function removeItem(quoteId: string, itemId: string) {
	return api.delete<QuoteDetail>(`/quotes/${quoteId}/items/${itemId}`);
}
