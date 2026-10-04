import { getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export function requireAuth() {
	const { locals } = getRequestEvent();
	if (!locals.user) redirect(307, resolve('/(auth)/login'));
	return locals.user;
}
