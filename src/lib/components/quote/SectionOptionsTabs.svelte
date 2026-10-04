<script lang="ts">
	import type { QuoteSection } from '#lib/api/types.js';
	import { formatNaira } from '#lib/utils/format.js';
	import { optionTotal, sectionRange } from '#lib/utils/quote-totals.js';
	import ItemsTable from './ItemsTable.svelte';
	import * as Tabs from '../ui/tabs/index.js';
	import { Button } from '../ui/button/index.js';
	import { Input } from '../ui/input/index.js';

	let {
		section,
		onAddOption,
		onAddItem,
		onRenameOption,
		onRemoveOption,
		onItemChange,
		onRemoveItem,
		onMoveItem
	}: {
		section: QuoteSection;
		onAddOption: () => void;
		onAddItem: (optionId: string) => void;
		onRenameOption: (optionId: string, name: string) => void;
		onRemoveOption: (optionId: string) => void;
		onItemChange: (
			itemId: string,
			patch: { description?: string; quantity?: number; unitPrice?: number }
		) => void;
		onRemoveItem: (itemId: string) => void;
		onMoveItem: (itemId: string, sectionId: string | null, optionId: string | null) => void;
	} = $props();

	let activeIndex = $state(0);
	let activeOption = $derived(section.options[activeIndex]);
	let range = $derived(sectionRange(section));
	let destinations = $derived([
		{
			value: `section:${section.id}:base`,
			sectionId: section.id,
			optionId: null,
			label: 'Included in all options'
		},
		...section.options.map((option, index) => ({
			value: `section:${section.id}:option:${option.id}`,
			sectionId: section.id,
			optionId: option.id,
			label: option.name.trim() || `Option ${String.fromCharCode(65 + index)}`
		}))
	]);

	$effect(() => {
		if (activeIndex >= section.options.length)
			activeIndex = Math.max(0, section.options.length - 1);
	});

	function optionName(name: string, index: number) {
		return name.trim() || `Option ${String.fromCharCode(65 + index)}`;
	}

	function rename(optionId: string, event: Event) {
		if (!(event.currentTarget instanceof HTMLInputElement)) return;
		onRenameOption(optionId, event.currentTarget.value);
	}

	function remove(optionId: string, name: string) {
		if (confirm(`Delete ${name} and all of its items? This cannot be undone.`)) {
			onRemoveOption(optionId);
		}
	}
</script>

{#if section.options.length === 0}
	<div class="flex items-center justify-between gap-3 border-t pt-4">
		<p class="text-sm text-muted-foreground">No options yet.</p>
		<Button type="button" variant="outline" size="sm" onclick={onAddOption}>Add option</Button>
	</div>
{:else}
	<div class="flex flex-col gap-3 border-t pt-4">
		<div class="flex items-center justify-between gap-3">
			<div class="text-sm font-medium">Options</div>
			<Button type="button" variant="outline" size="sm" onclick={onAddOption}>Add option</Button>
		</div>
		<Tabs.Root bind:value={() => `${activeIndex}`, (value) => (activeIndex = Number(value))}>
			<Tabs.List>
				{#each section.options as option, index (option.id)}
					<Tabs.Trigger value={`${index}`}>
						{optionName(option.name, index)} · {formatNaira(optionTotal(option))}
					</Tabs.Trigger>
				{/each}
			</Tabs.List>
			{#if activeOption}
				<Tabs.Content value={`${activeIndex}`} class="flex flex-col gap-3 pt-4">
					<div class="flex flex-wrap items-end gap-2">
						<label class="flex min-w-48 flex-1 flex-col gap-1 text-sm">
							<span class="text-xs text-muted-foreground">Option name</span>
							<Input
								value={activeOption.name}
								onchange={(event) => rename(activeOption.id, event)}
							/>
						</label>
						<Button type="button" variant="secondary" onclick={() => onAddItem(activeOption.id)}>
							Add item
						</Button>
						<Button
							type="button"
							variant="destructive"
							onclick={() => remove(activeOption.id, optionName(activeOption.name, activeIndex))}
						>
							Delete option
						</Button>
					</div>
					{#if activeOption.description}
						<p class="text-sm text-muted-foreground">{activeOption.description}</p>
					{/if}
					<ItemsTable
						items={activeOption.items}
						{destinations}
						{onItemChange}
						onRemove={onRemoveItem}
						onMove={onMoveItem}
					/>
					<div class="flex justify-end border-t pt-3 text-sm">
						<span class="text-muted-foreground">Option total:&nbsp;</span>
						<strong>{formatNaira(optionTotal(activeOption))}</strong>
					</div>
				</Tabs.Content>
			{/if}
		</Tabs.Root>
		<p class="text-xs text-muted-foreground">
			Section total: {range.min === range.max
				? formatNaira(range.min)
				: `${formatNaira(range.min)} – ${formatNaira(range.max)}`}
		</p>
	</div>
{/if}
