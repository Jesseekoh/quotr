<script lang="ts">
	import type { QuoteOptionWithTotals } from '$lib/api/types';
	import ItemsTable from './ItemsTable.svelte';
	import { formatNaira } from '$lib/utils/format';
	import Button from '../ui/button/button.svelte';

	let {
		options,
		onAddOption,
		onRemoveOption,
		onAddItem,
		onQuantityChange,
		onRemoveItem
	}: {
		options: QuoteOptionWithTotals[];
		onAddOption: () => void;
		onRemoveOption: (optionId: string) => void;
		onAddItem: (optionId: string) => void;
		onQuantityChange: (itemId: string, quantity: number) => void;
		onRemoveItem: (itemId: string) => void;
	} = $props();

	let activeIndex = $state(0);

	// Keep the active tab in range if an option gets removed.
	$effect(() => {
		if (activeIndex > 0 && activeIndex >= options.length) {
			activeIndex = Math.max(0, options.length - 1);
		}
	});

	let activeOption = $derived(options[activeIndex] as QuoteOptionWithTotals | undefined);
</script>

<section class="card">
	<div class="section-header">
		<div>
			<h2>Options</h2>
			<p class="hint">
				Alternative packages the customer can choose between, e.g. different battery choices.
			</p>
		</div>
		<Button type="button" class="btn-secondary" onclick={onAddOption}>Add option</Button>
	</div>

	{#if options.length === 0}
		<p class="empty">No options yet. Items you add outside an option apply to the whole quote.</p>
	{:else}
		<div class="tabs" role="tablist">
			{#each options as option, i (option.id)}
				<Button
					type="button"
					role="tab"
					aria-selected={i === activeIndex}
					class="tab {i === activeIndex ? 'active' : ''}"
					onclick={() => (activeIndex = i)}
				>
					{option.name}
				</Button>
			{/each}
		</div>

		{#if activeOption}
			<div class="panel">
				<div class="panel-header">
					{#if activeOption.description}
						<p class="option-desc">{activeOption.description}</p>
					{/if}
					<div class="panel-actions">
						<button type="button" class="btn-secondary" onclick={() => onAddItem(activeOption!.id)}>
							Add item to this option
						</button>
						<button
							type="button"
							class="link-danger"
							onclick={() => onRemoveOption(activeOption!.id)}
						>
							Remove option
						</button>
					</div>
				</div>

				<ItemsTable items={activeOption.items} {onQuantityChange} onRemove={onRemoveItem} />

				<p class="subtotal">
					Option subtotal: <strong>{formatNaira(activeOption.optionItemsTotal)}</strong>
				</p>
			</div>
		{/if}
	{/if}
</section>

<style>
	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}

	h2 {
		font-size: var(--text-base);
		font-weight: 600;
		margin: 0;
	}

	.hint {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		margin: var(--space-1) 0 0;
	}

	.empty {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.tabs {
		display: flex;
		gap: var(--space-1);
		border-bottom: 1px solid var(--color-border);
		margin-bottom: var(--space-3);
		flex-wrap: wrap;
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

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-3);
		margin-bottom: var(--space-2);
	}

	.option-desc {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		margin: 0;
	}

	.panel-actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		white-space: nowrap;
	}

	.subtotal {
		text-align: right;
		font-size: var(--text-sm);
		margin: var(--space-3) 0 0;
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

	.btn-secondary {
		background: var(--color-surface);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.btn-secondary:hover {
		border-color: var(--color-accent);
	}
</style>
