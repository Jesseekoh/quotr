<script lang="ts">
	import { goto } from '$app/navigation';
	import CustomerPicker from '$lib/components/quote/CustomerPicker.svelte';
	import { createCustomer } from '$lib/api/customers';
	import { createQuote } from '$lib/api/quotes';
	import { ApiError } from '$lib/api/client';
	import { PRICE_LABEL_OPTIONS } from '$lib/utils/pricing';
	import type { PriceLabel } from '$lib/api/types';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index';
	import { Input } from '$lib/components/ui/input/index';
	import Label from '$lib/components/ui/label/label.svelte';
	let mode = $state<'existing' | 'new'>('existing');
	let customerId = $state<string | null>(null);
	let newCustomer = $state({ name: '', phone: '', email: '', address: '' });

	let label = $state<PriceLabel>('ENDUSER_PRICE');
	let loadProfileTotal = $state<number | null>(null);
	let loadProfileNotes = $state('');
	let paymentTerms = $state('');

	let submitting = $state(false);
	let errorMessage = $state<string | null>(null);

	async function submit(e: Event) {
		e.preventDefault();
		errorMessage = null;

		if (mode === 'existing' && !customerId) {
			errorMessage = 'Select an existing customer, or switch to "New customer".';
			return;
		}
		if (mode === 'new' && !newCustomer.name.trim()) {
			errorMessage = "Enter the new customer's name.";
			return;
		}

		submitting = true;
		try {
			let resolvedCustomerId = customerId;

			if (mode === 'new') {
				const customer = await createCustomer({
					name: newCustomer.name.trim(),
					phone: newCustomer.phone.trim() || undefined,
					email: newCustomer.email.trim() || undefined,
					address: newCustomer.address.trim() || undefined
				});
				resolvedCustomerId = customer.id;
			}

			const quote = await createQuote({
				customerId: resolvedCustomerId as string,
				label,
				loadProfileTotal: loadProfileTotal ?? undefined,
				loadProfileNotes: loadProfileNotes.trim() || undefined,
				paymentTerms: paymentTerms.trim() || undefined
			});

			// Land straight in the builder - items/options are added there.
			await goto(resolve(`/quotes/${quote.id}`));
		} catch (err) {
			errorMessage =
				err instanceof ApiError ? err.message : 'Could not create the quote. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>New quote</title>
</svelte:head>

<div class="page">
	<h1>New quote</h1>

	{#if errorMessage}
		<p class="error-banner">{errorMessage}</p>
	{/if}

	<form onsubmit={submit}>
		<section class="card">
			<h2>Customer</h2>
			<CustomerPicker bind:mode bind:customerId bind:newCustomer />
		</section>

		<section class="card">
			<h2>Quote details</h2>

			<label class="field">
				<span>Price label</span>
				<select bind:value={label}>
					{#each PRICE_LABEL_OPTIONS as opt (opt.value)}
						<option value={opt.value}>{opt.text}</option>
					{/each}
				</select>
				<span class="hint">Decides which price tier catalog items use on this quote.</span>
			</label>

			<div class="row">
				<Label class="field">
					<span>Total load (optional)</span>
					<Input
						type="number"
						min="0"
						step="any"
						bind:value={loadProfileTotal}
						placeholder="e.g. 5580"
					/>
				</Label>
				<Label class="field grow">
					<span>Load profile notes (optional)</span>
					<Input bind:value={loadProfileNotes} placeholder="e.g. Fridge, TVs, lights, sockets" />
				</Label>
			</div>

			<Label class="field">
				<span>Payment terms (optional)</span>
				<Input bind:value={paymentTerms} placeholder="e.g. 80% prepayment, balance on completion" />
			</Label>
		</section>

		<div class="actions">
			<Button type="submit" class="btn-primary" disabled={submitting}>
				{submitting ? 'Creating…' : 'Create quote'}
			</Button>
		</div>
	</form>
</div>

<style>
	.page {
		max-width: 640px;
		margin: 0 auto;
		padding: var(--space-6) var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	h1 {
		font-size: var(--text-xl);
		font-weight: 600;
		margin: 0;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.card h2 {
		font-size: var(--text-base);
		font-weight: 600;
		margin: 0 0 var(--space-3);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: var(--text-sm);
		margin-bottom: var(--space-3);
	}

	.field:last-child {
		margin-bottom: 0;
	}

	.field.grow {
		flex: 1;
	}

	.row {
		display: flex;
		gap: var(--space-3);
	}

	select,
	input {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-family: inherit;
	}

	.hint {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
	}
</style>
