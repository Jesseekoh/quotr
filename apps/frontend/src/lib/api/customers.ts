import { api } from './client';
import type { Customer } from './types';

export function searchCustomers(search: string, fetchFn?: typeof fetch) {
	const qs = search ? `?search=${encodeURIComponent(search)}` : '';
	return api.get<Customer[]>(`/customers${qs}`, fetchFn);
}

export interface CreateCustomerPayload {
	name: string;
	phone?: string;
	email?: string;
	address?: string;
}

export function createCustomer(payload: CreateCustomerPayload) {
	return api.post<Customer>('/customers', payload);
}
