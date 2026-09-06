import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (locals.user && ['/sign-in', '/sign-up', '/'].includes(url.pathname)) {
		return redirect(302, resolve('/dashboard'));
	}
};
