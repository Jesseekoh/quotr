<script lang="ts">
	import { searchCustomers } from '$lib/api/customers';
	import type { Customer } from '$lib/api/types';
	import Button from '../ui/button/button.svelte';
	import Input from '../ui/input/input.svelte';
	import Label from '../ui/label/label.svelte';
	import Textarea from '../ui/textarea/textarea.svelte';

	let {
		mode = $bindable<'existing' | 'new'>('existing'),
		customerId = $bindable<string | null>(null),
		newCustomer = $bindable({ name: '', phone: '', email: '', address: '' })
	} = $props();

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

	function switchMode(next: 'existing' | 'new') {
		mode = next;
		if (next === 'new') {
			customerId = null;
			selectedCustomer = null;
			search = '';
			results = [];
		}
	}
</script>

<div class="picker">
	<div class="tabs" role="tablist">
		<Button
			type="button"
			role="tab"
			class="tab {mode === 'existing' ? 'active' : ''}"
			onclick={() => switchMode('existing')}
		>
			Existing customer
		</Button>
		<Button
			type="button"
			role="tab"
			class="tab {mode === 'new' ? 'active' : ''}"
			onclick={() => switchMode('new')}
		>
			New customer
		</Button>
	</div>

	{#if mode === 'existing'}
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
	{:else}
		<div class="new-fields">
			<Label class="field">
				<span>Name</span>
				<Input bind:value={newCustomer.name} required placeholder="Customer's full name" />
			</Label>
			<div class="row">
				<Label class="field">
					<span>Phone</span>
					<Input bind:value={newCustomer.phone} placeholder="080…" />
				</Label>
				<Label class="field">
					<span>Email</span>
					<input type="email" bind:value={newCustomer.email} />
				</Label>
			</div>
			<Label class="field">
				<span>Address</span>
				<Textarea bind:value={newCustomer.address} rows={2}></Textarea>
			</Label>
		</div>
	{/if}
</div>

<style>
	.picker {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.tabs {
		display: flex;
		gap: var(--space-1);
		border-bottom: 1px solid var(--color-border);
	}

	.tab {
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		cursor: pointer;
	}

	.tab.active {
		color: var(--color-text);
		border-bottom-color: var(--color-accent);
		font-weight: 500;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: var(--text-sm);
	}

	.row {
		display: flex;
		gap: var(--space-3);
	}

	.row .field {
		flex: 1;
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
