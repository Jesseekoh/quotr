<script lang="ts">
	import type { QuoteItem } from '$lib/api/types';
	import { formatNaira } from '$lib/utils/format';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

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
	<p class="py-3 text-sm text-muted-foreground">No items yet.</p>
{:else}
	<div class="overflow-x-auto rounded-md border">
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
						<Table.Cell>
							<div class="font-medium">{item.description}</div>
							{#if item.specification}
								<div class="text-xs text-muted-foreground">{item.specification}</div>
							{/if}
						</Table.Cell>
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
{/if}
