import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('better-auth.session_token');

	if (token) {
		try {
			// 2. Forward the token to NestJS to get the user state
			const res = await event.fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/get-session`, {
				headers: {
					// Forward cookie string so NestJS recognizes the request
					Cookie: `better-auth.session_token=${token}`
				}
			});

			if (res.ok) {
				const sessionData = await res.json();
				// 3. Populate locals for downstream load functions
				event.locals.user = sessionData.user;
				event.locals.session = sessionData.session;
			}
		} catch (err) {
			console.error('Failed to fetch session from NestJS:', err);
		}
	}

	return resolve(event);
};
