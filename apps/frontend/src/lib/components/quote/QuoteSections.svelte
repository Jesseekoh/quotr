<script lang="ts">
	import type { QuoteSection } from '$lib/api/types';
	import ItemsTable from './ItemsTable.svelte';
	import * as Card from '../ui/card/index.js';
	import { Button } from '../ui/button/index.js';

	let {
		sections,
		onAddSection,
		onAddItem,
		onRemoveSection,
		onQuantityChange,
		onRemoveItem
	}: {
		sections: QuoteSection[];
		onAddSection: () => void;
		onAddItem: (sectionId: string) => void;
		onRemoveSection: (sectionId: string) => void;
		onQuantityChange: (itemId: string, quantity: number) => void;
		onRemoveItem: (itemId: string) => void;
	} = $props();
</script>

<Card.Root>
	<Card.Header class="flex-row items-start justify-between gap-3 space-y-0">
		<div>
			<Card.Title>Sections</Card.Title>
			<Card.Description>Organize items into the numbered parts of the quote.</Card.Description>
		</div>
		<Button type="button" variant="outline" onclick={onAddSection}>Add section</Button>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		{#if sections.length === 0}
			<p class="text-sm text-muted-foreground">No sections yet.</p>
		{:else}
			{#each sections as section, index (section.id)}
				<section class="rounded-md border bg-muted/20 p-4">
					<div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h3 class="font-semibold">{index + 1}.0 {section.name}</h3>
							<p class="text-xs text-muted-foreground">
								{section.items.length} item{section.items.length === 1 ? '' : 's'}
							</p>
							{#if section.options.length > 0}
								<p class="text-xs text-muted-foreground">
									Options: {section.options.map((option) => option.name).join(', ')}
								</p>
							{/if}
						</div>
						<div class="flex flex-wrap gap-2">
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onclick={() => onAddItem(section.id)}
							>
								Add item
							</Button>
							<Button
								type="button"
								variant="destructive"
								size="sm"
								onclick={() => onRemoveSection(section.id)}
							>
								Remove
							</Button>
						</div>
					</div>
					<ItemsTable items={section.items} {onQuantityChange} onRemove={onRemoveItem} />
				</section>
			{/each}
		{/if}
	</Card.Content>
</Card.Root>
