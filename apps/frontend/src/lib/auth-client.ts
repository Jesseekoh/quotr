import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_API_BASE_URL as string,
	fetchOptions: {
		credentials: 'include'
	}
});
