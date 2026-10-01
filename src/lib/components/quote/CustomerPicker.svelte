<script lang="ts">
	import { searchCustomers } from '#lib/api/customers';
	import type { Customer } from '#lib/api/types';
	import Button from '../ui/button/button.svelte';
	import Input from '../ui/input/input.svelte';
	import Label from '../ui/label/label.svelte';
	import Textarea from '../ui/textarea/textarea.svelte';
	import * as Tabs from '#lib/components/ui/tabs/index.js';
	import { FieldGroup, FieldLabel } from '../ui/field/index.js';

	let {
		mode = $bindable<'existing' | 'new'>('existing'),
		customerId = $bindable<string | null>(null),
		newCustomer = $bindable({ name: '', phone: '', email: '', address: '' })
	} = $props();
	const id = $props.id();

	let search = $state('');
	let results = $state<Customer[]>([]);
	let searching = $state(false);
	let selectedCustomer = $state<Customer | null>(null);
	let searchTimer: ReturnType<typeof setTimeout>;

	$effect(() => {
		void search;
		clearTimeout(searchTimer);
		if (!search.trim() || (selectedCustomer && search === selectedCustomer.name)) {
			results = [];
			return;
		}
		searchTimer = setTimeout(async () => {
			searching = true;
			try {
				results = await searchCustomers(search.trim());
			} finally {
				searching = false;
			}
		}, 300);
	});

	function selectCustomer(customer: Customer) {
		selectedCustomer = customer;
		customerId = customer.id;
		search = customer.name;
		results = [];
	}

	function handleSearchInput() {
		if (selectedCustomer && search !== selectedCustomer.name) {
			selectedCustomer = null;
			customerId = null;
		}
	}
</script>

<div class="picker">
	<Tabs.Root
		value={mode === 'existing' ? 'existing-customer' : 'new-customer'}
		onValueChange={(v) => (mode = v === 'existing-customer' ? 'existing' : 'new')}
	>
		<Tabs.List>
			<Tabs.Trigger value="existing-customer">Existing customer</Tabs.Trigger>

			<Tabs.Trigger value="new-customer">New customer</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="existing-customer">
			<div class="existing">
				<Label class="field">
					<span>Search customers</span>
					<Input
						bind:value={search}
						oninput={handleSearchInput}
						placeholder="Search by name, phone, or email…"
					/>
				</Label>

				{#if searching}
					<p class="hint">Searching…</p>
				{:else if results.length > 0}
					<ul class="results">
						{#each results as customer (customer.id)}
							<li>
								<Button type="button" onclick={() => selectCustomer(customer)}>
									<span class="name">{customer.name}</span>
									{#if customer.phone || customer.email}
										<span class="muted">{customer.phone ?? customer.email}</span>
									{/if}
								</Button>
							</li>
						{/each}
					</ul>
				{:else if search.trim() && !selectedCustomer}
					<p class="hint">No matches. Switch to "New customer" to add them.</p>
				{/if}

				{#if selectedCustomer}
					<p class="selected">
						Selected: <strong>{selectedCustomer.name}</strong>
					</p>
				{/if}
			</div>
		</Tabs.Content>
		<Tabs.Content value="new-customer">
			<div class="new-fields">
				<FieldGroup>
					<FieldLabel for="name-{id}">Name</FieldLabel>
					<Input bind:value={newCustomer.name} required placeholder="Customer's full name" />
					<div class="row">
						<Label class="field">
							<span>Phone</span>
							<Input bind:value={newCustomer.phone} placeholder="080…" />
						</Label>
						<Label class="field">
							<span>Email</span>
							<Input type="email" bind:value={newCustomer.email} />
						</Label>
					</div>
					<Label class="field">
						<span>Address</span>
						<Textarea bind:value={newCustomer.address} rows={2}></Textarea>
					</Label>
				</FieldGroup>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>

<style>
	.picker {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.row {
		display: flex;
		gap: var(--space-3);
	}

	input,
	textarea {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-family: inherit;
	}

	textarea {
		resize: vertical;
	}

	.hint {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		margin: 0;
	}

	.results {
		list-style: none;
		margin: 0;
		padding: 0;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		max-height: 10rem;
		overflow-y: auto;
	}

	.results li + li {
		border-top: 1px solid var(--color-border);
	}

	.results button {
		width: 100%;
		display: flex;
		justify-content: space-between;
		gap: var(--space-2);
		background: none;
		border: none;
		text-align: left;
		padding: var(--space-2) var(--space-3);
		cursor: pointer;
		font-size: var(--text-sm);
	}

	.results button:hover {
		background: var(--color-accent-tint);
	}

	.muted {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
	}

	.selected {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-success);
	}
</style>
