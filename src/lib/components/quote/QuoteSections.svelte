<script lang="ts">
	import type { QuoteSection } from '#lib/api/types.js';
	import ItemsTable from './ItemsTable.svelte';
	import SectionOptionsTabs from './SectionOptionsTabs.svelte';
	import * as Card from '../ui/card/index.js';
	import { Button } from '../ui/button/index.js';

	let {
		ungroupedItems,
		sections,
		onAddSection,
		onAddItem,
		onAddOption,
		onRenameOption,
		onRemoveOption,
		onRemoveSection,
		onItemChange,
		onRemoveItem,
		onMoveItem
	}: {
		ungroupedItems: QuoteSection['items'];
		sections: QuoteSection[];
		onAddSection: () => void;
		onAddItem: (sectionId: string | null, optionId: string | null) => void;
		onAddOption: (sectionId: string) => void;
		onRenameOption: (optionId: string, name: string) => void;
		onRemoveOption: (optionId: string) => void;
		onRemoveSection: (sectionId: string) => void;
		onItemChange: (
			itemId: string,
			patch: { description?: string; quantity?: number; unitPrice?: number }
		) => void;
		onRemoveItem: (itemId: string) => void;
		onMoveItem: (itemId: string, sectionId: string | null, optionId: string | null) => void;
	} = $props();
</script>

<Card.Root>
	<Card.Header class="flex-row items-start justify-between gap-3 space-y-0">
		<div>
			<Card.Title>Items</Card.Title>
			<Card.Description>Items that apply without belonging to a numbered section.</Card.Description>
		</div>
		<Button type="button" variant="outline" onclick={() => onAddItem(null, null)}>Add item</Button>
	</Card.Header>
	<Card.Content>
		<ItemsTable
			items={ungroupedItems}
			destinations={[
				{ value: 'ungrouped', sectionId: null, optionId: null, label: 'Ungrouped' },
				...sections.map((section) => ({
					value: `section:${section.id}`,
					sectionId: section.id,
					optionId: null,
					label: section.name
				}))
			]}
			{onItemChange}
			onRemove={onRemoveItem}
			onMove={onMoveItem}
		/>
	</Card.Content>
</Card.Root>

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
			<p class="text-sm text-muted-foreground">
				No items yet. Add an item, or create a section to organize them.
			</p>
		{:else}
			{#each sections as section, index (section.id)}
				<section class="rounded-md border bg-muted/20 p-4">
					<div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h3 class="font-semibold">{index + 1}.0 {section.name}</h3>
							<p class="text-xs text-muted-foreground">
								{section.items.length} base item{section.items.length === 1 ? '' : 's'}
							</p>
						</div>
						<div class="flex flex-wrap gap-2">
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onclick={() => onAddItem(section.id, null)}
							>
								Add item
							</Button>
							<Button
								type="button"
								variant="destructive"
								size="sm"
								disabled={section.items.length > 0 || section.options.length > 0}
								onclick={() => onRemoveSection(section.id)}
							>
								Remove
							</Button>
						</div>
					</div>
					<ItemsTable
						items={section.items}
						destinations={[
							{ value: 'ungrouped', sectionId: null, optionId: null, label: 'Ungrouped' },
							{
								value: `section:${section.id}:base`,
								sectionId: section.id,
								optionId: null,
								label: 'Included in all options'
							},
							...section.options.map((option, optionIndex) => ({
								value: `section:${section.id}:option:${option.id}`,
								sectionId: section.id,
								optionId: option.id,
								label: option.name.trim() || `Option ${String.fromCharCode(65 + optionIndex)}`
							}))
						]}
						{onItemChange}
						onRemove={onRemoveItem}
						onMove={onMoveItem}
					/>
					<SectionOptionsTabs
						{section}
						onAddOption={() => onAddOption(section.id)}
						onAddItem={(optionId) => onAddItem(section.id, optionId)}
						{onRenameOption}
						{onRemoveOption}
						{onItemChange}
						{onRemoveItem}
						{onMoveItem}
					/>
				</section>
			{/each}
		{/if}
	</Card.Content>
</Card.Root>
