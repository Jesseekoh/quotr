import { env } from '$env/dynamic/public';

// Set PUBLIC_API_URL in your .env; falls back to the local Nest dev server.
const BASE_URL = env.PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

async function request<T>(
	path: string,
	options: RequestInit = {},
	fetchFn: typeof fetch = fetch
): Promise<T> {
	const res = await fetchFn(`${BASE_URL}${path}`, {
		...options,
		headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) }
	});

	if (!res.ok) {
		const body = await res.json().catch(() => null);
		const message = body?.message ?? res.statusText ?? 'Request failed';
		throw new ApiError(res.status, Array.isArray(message) ? message.join(', ') : message);
	}

	if (res.status === 204) return undefined as T;
	return res.json();
}

// `fetchFn` lets SvelteKit `load` functions pass their own `fetch` so
// requests are properly tracked/cached during SSR; component code can omit
// it and the global `fetch` is used instead.
export const api = {
	get: <T>(path: string, fetchFn?: typeof fetch) =>
		request<T>(path, { method: 'GET', credentials: 'include' }, fetchFn),
	post: <T>(path: string, body?: unknown, fetchFn?: typeof fetch) =>
		request<T>(
			path,
			{ method: 'POST', credentials: 'include', body: body ? JSON.stringify(body) : undefined },
			fetchFn
		),
	patch: <T>(path: string, body?: unknown, fetchFn?: typeof fetch) =>
		request<T>(
			path,
			{ method: 'PATCH', body: body ? JSON.stringify(body) : undefined, credentials: 'include' },
			fetchFn
		),
	delete: <T>(path: string, fetchFn?: typeof fetch) =>
		request<T>(path, { method: 'DELETE', credentials: 'include' }, fetchFn)
};
