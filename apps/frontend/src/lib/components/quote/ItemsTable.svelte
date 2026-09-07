<script lang="ts">
	import type { QuoteItem } from '$lib/api/types';
	import { formatNaira } from '$lib/utils/format';

	let {
		items,
		onQuantityChange,
		onRemove
	}: {
		items: QuoteItem[];
		onQuantityChange: (itemId: string, quantity: number) => void;
		onRemove: (itemId: string) => void;
	} = $props();

	function handleQtyChange(item: QuoteItem, e: Event) {
		const value = Number((e.target as HTMLInputElement).value);
		if (value > 0 && value !== item.quantity) onQuantityChange(item.id, value);
	}
</script>

{#if items.length === 0}
	<p class="empty">No items yet.</p>
{:else}
	<table class="items-table">
		<thead>
			<tr>
				<th>Description</th>
				<th>Brand</th>
				<th class="num">Qty</th>
				<th class="num">Unit price</th>
				<th class="num">Total</th>
				<th class="actions"></th>
			</tr>
		</thead>
		<tbody>
			{#each items as item (item.id)}
				<tr>
					<td>
						<div class="desc">{item.description}</div>
						{#if item.specification}
							<div class="spec">{item.specification}</div>
						{/if}
					</td>
					<td>{item.brand ?? '—'}</td>
					<td class="num">
						<input
							type="number"
							min="1"
							value={item.quantity}
							onchange={(e) => handleQtyChange(item, e)}
							class="qty-input"
						/>
					</td>
					<td class="num">{formatNaira(item.unitPrice)}</td>
					<td class="num strong">{formatNaira(item.totalPrice)}</td>
					<td class="actions">
						<button type="button" class="link-danger" onclick={() => onRemove(item.id)}>
							Remove
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style>
	.empty {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		padding: var(--space-3) 0;
	}

	.items-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	.items-table th {
		text-align: left;
		font-weight: 500;
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		padding: var(--space-2) var(--space-2);
		border-bottom: 1px solid var(--color-border);
	}

	.items-table td {
		padding: var(--space-2);
		border-bottom: 1px solid var(--color-border);
		vertical-align: top;
	}

	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.strong {
		font-weight: 600;
	}

	.desc {
		font-weight: 500;
	}

	.spec {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		margin-top: 2px;
	}

	.qty-input {
		width: 3.5rem;
		text-align: right;
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
	}

	.actions {
		text-align: right;
		white-space: nowrap;
	}

	.link-danger {
		background: none;
		border: none;
		color: var(--color-danger);
		font-size: var(--text-xs);
		cursor: pointer;
		padding: 0;
	}

	.link-danger:hover {
		text-decoration: underline;
	}
</style>
