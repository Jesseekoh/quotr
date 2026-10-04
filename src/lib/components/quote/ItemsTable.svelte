<script lang="ts">
	import type { QuoteItem } from '#lib/api/types';
	import { formatNaira } from '#lib/utils/format';
	import * as Table from '#lib/components/ui/table/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Button } from '#lib/components/ui/button/index.js';

	let {
		items,
		sections = [],
		onQuantityChange,
		onRemove,
		onMove
	}: {
		items: QuoteItem[];
		sections?: { id: string; name: string }[];
		onQuantityChange: (itemId: string, quantity: number) => void;
		onRemove: (itemId: string) => void;
		onMove?: (itemId: string, sectionId: string | null) => void;
	} = $props();

	function handleQtyChange(item: QuoteItem, e: Event) {
		if (!(e.currentTarget instanceof HTMLInputElement)) return;
		const value = Number(e.currentTarget.value);
		if (value > 0 && value !== item.quantity) onQuantityChange(item.id, value);
	}

	function handleMove(item: QuoteItem, e: Event) {
		if (!(e.currentTarget instanceof HTMLSelectElement) || !onMove) return;
		onMove(item.id, e.currentTarget.value || null);
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
					<Table.Head>Brand</Table.Head>
					<Table.Head class="text-right">Qty</Table.Head>
					<Table.Head class="text-right">Unit price</Table.Head>
					<Table.Head class="text-right">Total</Table.Head>
					<Table.Head></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each items as item (item.id)}
					<Table.Row>
						<Table.Cell class="max-w-xs">
							<div class="font-medium wrap-break-word whitespace-normal">{item.description}</div>
							{#if item.specification}
								<div class="text-xs wrap-break-word whitespace-normal text-muted-foreground">
									{item.specification}
								</div>
							{/if}
						</Table.Cell>
						<!-- <Table.Cell>
							<div class="font-medium">{item.description}</div>
							{#if item.specification}
								<div class="text-xs text-muted-foreground">{item.specification}</div>
							{/if}
						</Table.Cell> -->
						<Table.Cell>{item.brand ?? '—'}</Table.Cell>
						<Table.Cell class="text-right">
							<Input
								type="number"
								min="1"
								value={item.quantity}
								onchange={(e) => handleQtyChange(item, e)}
								class="ml-auto w-20 text-right"
							/>
						</Table.Cell>
						<Table.Cell class="text-right tabular-nums">{formatNaira(item.unitPrice)}</Table.Cell>
						<Table.Cell class="text-right font-semibold tabular-nums"
							>{formatNaira(item.totalPrice)}</Table.Cell
						>
						<Table.Cell>
							{#if onMove}
								<select
									class="h-8 max-w-32 rounded-md border bg-background px-2 text-xs"
									aria-label={`Move ${item.description}`}
									value={item.quoteSectionId ?? ''}
									onchange={(e) => handleMove(item, e)}
								>
									<option value="">Ungrouped</option>
									{#each sections as section (section.id)}
										<option value={section.id}>{section.name}</option>
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
					<div class="min-w-0">
						<h3 class="font-medium wrap-break-word">{item.description}</h3>
						{#if item.specification}
							<p class="mt-1 text-xs wrap-break-word text-muted-foreground">{item.specification}</p>
						{/if}
					</div>
					<Button type="button" variant="link" size="sm" onclick={() => onRemove(item.id)}>
						Remove
					</Button>
				</div>

				<div class="mt-4 grid grid-cols-2 gap-3 text-sm">
					<div>
						<div class="text-xs text-muted-foreground">Brand</div>
						<div>{item.brand ?? '—'}</div>
					</div>
					<div>
						<div class="text-xs text-muted-foreground">Unit price</div>
						<div class="tabular-nums">{formatNaira(item.unitPrice)}</div>
					</div>
					<div>
						<div class="text-xs text-muted-foreground">Quantity</div>
						<Input
							type="number"
							min="1"
							value={item.quantity}
							onchange={(e) => handleQtyChange(item, e)}
							class="mt-1 w-20"
						/>
					</div>
					<div>
						<div class="text-xs text-muted-foreground">Total</div>
						<div class="font-semibold tabular-nums">{formatNaira(item.totalPrice)}</div>
					</div>
					{#if onMove}
						<label class="col-span-2 flex flex-col gap-1">
							<span class="text-xs text-muted-foreground">Move to</span>
							<select
								class="h-9 rounded-md border bg-background px-2"
								value={item.quoteSectionId ?? ''}
								onchange={(e) => handleMove(item, e)}
							>
								<option value="">Ungrouped</option>
								{#each sections as section (section.id)}
									<option value={section.id}>{section.name}</option>
								{/each}
							</select>
						</label>
					{/if}
				</div>
			</article>
		{/each}
	</div>
{/if}
