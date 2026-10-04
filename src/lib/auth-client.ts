import { createAuthClient } from 'better-auth/svelte';
export const authClient = createAuthClient({
	baseURL: import.meta.env.PUBLIC_ORIGIN,
	fetchOptions: {
		credentials: 'include'
	}
});
