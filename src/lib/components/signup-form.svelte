<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import type { ComponentProps } from 'svelte';
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	let { ...restProps }: ComponentProps<typeof Card.Root> = $props();

	let loading = $state(false);
</script>

<Card.Root {...restProps}>
	<Card.Header>
		<Card.Title>Create an account</Card.Title>
		<Card.Description>Enter your information below to create your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
			method="post"
			use:enhance={() => {
				return ({ result, update }) => {
					if (result.type === 'failure') {
						toast.error(result.data?.message);
					} else {
						update();
						toast.success('Logged in successfully');
					}
				};
			}}
		>
			<Field.Group>
				<Field.Field>
					<Field.Label for="name">Full Name</Field.Label>
					<Input id="name" name="name" type="text" placeholder="John Doe" required />
				</Field.Field>
				<Field.Field>
					<Field.Label for="email">Email</Field.Label>
					<Input id="email" name="email" type="email" placeholder="m@example.com" required />
					<!-- <Field.Description>
						We'll use this to contact you. We will not share your email with anyone else.
					</Field.Description> -->
				</Field.Field>
				<Field.Field>
					<Field.Label for="password">Password</Field.Label>
					<Input id="password" name="password" type="password" required />
					<Field.Description>Must be at least 8 characters long.</Field.Description>
				</Field.Field>
				<Field.Field>
					<Field.Label for="confirm-password">Confirm Password</Field.Label>
					<Input id="confirm-password" name="confirm-password" type="password" required />
					<Field.Description>Please confirm your password.</Field.Description>
				</Field.Field>
				<Field.Group>
					<Field.Field>
						<Button type="submit" disabled={loading}
							>{loading ? 'Creating Account...' : 'Create Account'}</Button
						>
						<Button variant="outline" type="button">Sign up with Google</Button>
						<Field.Description class="px-6 text-center">
							Already have an account? <a href={resolve('/(auth)/login')}>Sign in</a>
						</Field.Description>
					</Field.Field>
				</Field.Group>
			</Field.Group>
		</form>
	</Card.Content>
</Card.Root>
