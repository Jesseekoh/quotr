<script lang="ts">
	import type { QuoteOptionWithTotals } from '#lib/api/types';
	import ItemsTable from './ItemsTable.svelte';
	import { formatNaira } from '#lib/utils/format';
	import * as Card from '../ui/card/index.js';
	import * as Tabs from '../ui/tabs/index.js';
	import { Button } from '../ui/button/index.js';

	let {
		options,
		onRemoveOption,
		onAddItem,
		onQuantityChange,
		onRemoveItem
	}: {
		options: QuoteOptionWithTotals[];
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

<Card.Root>
	<Card.Header class="flex-row items-start justify-between gap-3 space-y-0">
		<div>
			<Card.Title>Options</Card.Title>
			<Card.Description>
				Alternative packages the customer can choose between, e.g. different battery choices.
			</Card.Description>
		</div>
	</Card.Header>
	<Card.Content>
		{#if options.length === 0}
			<p class="text-sm text-muted-foreground">No options yet. Add options from a quote section.</p>
		{:else}
			<Tabs.Root bind:value={() => `${activeIndex}`, (value) => (activeIndex = Number(value))}>
				<Tabs.List>
					{#each options as option, i (option.id)}
						<Tabs.Trigger value={`${i}`}>{option.name}</Tabs.Trigger>
					{/each}
				</Tabs.List>

				{#if activeOption}
					<div class="flex flex-col gap-3 pt-4">
						<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							{#if activeOption.description}
								<p class="text-sm text-muted-foreground">{activeOption.description}</p>
							{/if}
							<div class="flex flex-wrap items-center gap-2">
								<Button
									type="button"
									variant="secondary"
									disabled={!activeOption.quoteSectionId}
									onclick={() => onAddItem(activeOption!.id)}
								>
									Add item
								</Button>
								<Button
									type="button"
									variant="destructive"
									size="sm"
									onclick={() => onRemoveOption(activeOption!.id)}
								>
									Remove option
								</Button>
							</div>
						</div>

						<ItemsTable items={activeOption.items} {onQuantityChange} onRemove={onRemoveItem} />

						<div class="flex justify-end border-t pt-3 text-sm">
							<span class="text-muted-foreground">Option subtotal:&nbsp;</span>
							<strong>{formatNaira(activeOption.optionItemsTotal)}</strong>
						</div>
					</div>
				{/if}
			</Tabs.Root>
		{/if}
	</Card.Content>
</Card.Root>
