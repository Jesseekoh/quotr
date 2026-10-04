<script lang="ts">
	import type { QuoteItem } from '#lib/api/types.js';
	import { formatNaira } from '#lib/utils/format.js';
	import { lineTotal } from '#lib/utils/quote-totals.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Button } from '#lib/components/ui/button/index.js';

	let {
		items,
		destinations = [],
		onItemChange,
		onRemove,
		onMove
	}: {
		items: QuoteItem[];
		destinations?: {
			value: string;
			sectionId: string | null;
			optionId: string | null;
			label: string;
		}[];
		onItemChange: (
			itemId: string,
			patch: { description?: string; quantity?: number; unitPrice?: number }
		) => void;
		onRemove: (itemId: string) => void;
		onMove?: (itemId: string, sectionId: string | null, optionId: string | null) => void;
	} = $props();

	// Borderless until hover/focus so the table stays readable while signalling editability.
	const cellInput =
		'h-8 border-transparent bg-transparent px-2 shadow-none hover:border-input focus-visible:border-input';

	function commitDescription(item: QuoteItem, event: Event) {
		const input = event.currentTarget;
		if (!(input instanceof HTMLInputElement)) return;
		const value = input.value.trim();
		if (value && value !== item.description) onItemChange(item.id, { description: value });
		else input.value = item.description;
	}

	function commitQuantity(item: QuoteItem, event: Event) {
		const input = event.currentTarget;
		if (!(input instanceof HTMLInputElement)) return;
		const value = Number(input.value);
		if (Number.isInteger(value) && value > 0 && value !== item.quantity) {
			onItemChange(item.id, { quantity: value });
		} else {
			input.value = String(item.quantity);
		}
	}

	function commitUnitPrice(item: QuoteItem, event: Event) {
		const input = event.currentTarget;
		if (!(input instanceof HTMLInputElement)) return;
		const value = Number(input.value);
		if (Number.isFinite(value) && value >= 0 && value !== Number(item.unitPrice)) {
			onItemChange(item.id, { unitPrice: value });
		} else {
			input.value = String(item.unitPrice);
		}
	}

	function itemSublabel(item: QuoteItem) {
		return [item.brand, item.specification].filter(Boolean).join(' · ');
	}

	function handleMove(item: QuoteItem, e: Event) {
		const select = e.currentTarget;
		if (!(select instanceof HTMLSelectElement) || !onMove) return;
		const destination = destinations.find((candidate) => candidate.value === select.value);
		if (destination) onMove(item.id, destination.sectionId, destination.optionId);
	}
</script>

{#if items.length === 0}
	<p class="py-3 text-sm text-muted-foreground">No items yet.</p>
{:else}
	<div class="hidden overflow-x-auto rounded-md border md:block">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Description</Table.Head>
					<Table.Head class="text-right">Qty</Table.Head>
					<Table.Head class="text-right">Unit price</Table.Head>
					<Table.Head class="text-right">Total</Table.Head>
					<Table.Head>Move to</Table.Head>
					<Table.Head></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each items as item (item.id)}
					<Table.Row>
						<Table.Cell class="max-w-xs">
							<Input
								value={item.description}
								onchange={(e) => commitDescription(item, e)}
								aria-label="Description"
								class="{cellInput} font-medium"
							/>
							{#if itemSublabel(item)}
								<div
									class="mt-0.5 px-2 text-xs wrap-break-word whitespace-normal text-muted-foreground"
								>
									{itemSublabel(item)}
								</div>
							{/if}
						</Table.Cell>
						<Table.Cell class="text-right">
							<Input
								type="number"
								min="1"
								step="1"
								value={item.quantity}
								onchange={(e) => commitQuantity(item, e)}
								aria-label={`Quantity for ${item.description}`}
								class="ml-auto w-20 text-right {cellInput}"
							/>
						</Table.Cell>
						<Table.Cell class="text-right">
							<Input
								type="number"
								min="0"
								step="1"
								value={item.unitPrice}
								onchange={(e) => commitUnitPrice(item, e)}
								aria-label={`Unit price for ${item.description}`}
								class="ml-auto w-24 text-right {cellInput}"
							/>
						</Table.Cell>
						<Table.Cell class="text-right font-semibold tabular-nums"
							>{formatNaira(lineTotal(item))}</Table.Cell
						>
						<Table.Cell>
							{#if onMove}
								<select
									class="h-8 max-w-32 rounded-md border bg-background px-2 text-xs"
									aria-label={`Move ${item.description}`}
									value={destinations.find(
										(destination) =>
											destination.sectionId === item.quoteSectionId &&
											destination.optionId === item.quoteOptionId
									)?.value ?? ''}
									onchange={(e) => handleMove(item, e)}
								>
									{#each destinations as destination (destination.value)}
										<option value={destination.value}>{destination.label}</option>
									{/each}
								</select>
							{/if}
						</Table.Cell>
						<Table.Cell class="text-right">
							<Button type="button" variant="link" size="sm" onclick={() => onRemove(item.id)}>
								Remove
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<div class="flex flex-col gap-3 md:hidden">
		{#each items as item (item.id)}
			<article class="rounded-md border bg-card p-4">
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0 flex-1">
						<Input
							value={item.description}
							onchange={(e) => commitDescription(item, e)}
							aria-label="Description"
							class="{cellInput} font-medium"
						/>
						{#if itemSublabel(item)}
							<p class="mt-0.5 px-2 text-xs wrap-break-word text-muted-foreground">
								{itemSublabel(item)}
							</p>
						{/if}
					</div>
					<Button type="button" variant="link" size="sm" onclick={() => onRemove(item.id)}>
						Remove
					</Button>
				</div>

				<div class="mt-3 grid grid-cols-2 gap-3 text-sm">
					<label class="flex flex-col gap-1">
						<span class="text-xs text-muted-foreground">Quantity</span>
						<Input
							type="number"
							min="1"
							step="1"
							value={item.quantity}
							onchange={(e) => commitQuantity(item, e)}
							class="{cellInput} border-input"
						/>
					</label>
					<label class="flex flex-col gap-1">
						<span class="text-xs text-muted-foreground">Unit price</span>
						<Input
							type="number"
							min="0"
							step="1"
							value={item.unitPrice}
							onchange={(e) => commitUnitPrice(item, e)}
							class="{cellInput} border-input"
						/>
					</label>
					<div class="col-span-2 flex items-center justify-between">
						<span class="text-xs text-muted-foreground">Total</span>
						<span class="font-semibold tabular-nums">{formatNaira(lineTotal(item))}</span>
					</div>
					{#if onMove}
						<label class="col-span-2 flex flex-col gap-1">
							<span class="text-xs text-muted-foreground">Move to</span>
							<select
								class="h-9 rounded-md border bg-background px-2"
								value={destinations.find(
									(destination) =>
										destination.sectionId === item.quoteSectionId &&
										destination.optionId === item.quoteOptionId
								)?.value ?? ''}
								onchange={(e) => handleMove(item, e)}
							>
								{#each destinations as destination (destination.value)}
									<option value={destination.value}>{destination.label}</option>
								{/each}
							</select>
						</label>
					{/if}
				</div>
			</article>
		{/each}
	</div>
{/if}
