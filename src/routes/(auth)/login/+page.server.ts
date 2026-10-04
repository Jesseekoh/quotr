import { auth } from '#lib/server/auth.js';
import { APIError } from 'better-auth';
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		console.log(email, password);
		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					rememberMe: true
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Signin failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}
		console.log('sljdsljfd');
		return redirect(302, resolve('/(app)/dashboard'));
	}
};
