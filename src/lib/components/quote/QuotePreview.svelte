<script lang="ts">
	import type { QuoteItem, QuoteSection } from '#lib/api/types.js';
	import { formatNaira } from '#lib/utils/format.js';
	import { quoteSubtotal } from '#lib/utils/quote-totals.js';
	import * as Card from '#lib/components/ui/card/index.js';

	type PreviewQuote = {
		quoteNumber: string;
		customer?: { name: string; email: string | null; address: string | null } | null;
		label: string;
		loadProfileTotal: string | number | null;
		loadProfileNotes: string | null;
		items?: QuoteItem[];
		sections?: QuoteSection[];
	};

	let { quote }: { quote: PreviewQuote } = $props();

	const ungroupedItems = $derived(
		(quote.items ?? []).filter(
			(item) => item.quoteSectionId === null && item.quoteOptionId === null
		)
	);
	const subtotal = $derived(quoteSubtotal(quote));

	function renderItems(items: QuoteItem[]) {
		return items.filter((item) => item.quoteOptionId === null);
	}
</script>

<Card.Root class="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-auto">
	<Card.Header>
		<Card.Title class="text-2xl">Quote preview</Card.Title>
		<Card.Description>{quote.quoteNumber} · {quote.customer?.name ?? 'Client'}</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-5">
		<div class="grid gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
			<div>
				<div class="text-xs text-muted-foreground">Client</div>
				<div class="font-medium">{quote.customer?.name ?? 'Client'}</div>
				{#if quote.customer?.email}<div>{quote.customer.email}</div>{/if}
			</div>
			<div>
				<div class="text-xs text-muted-foreground">Price label</div>
				<div class="font-medium">{quote.label.replaceAll('_', ' ')}</div>
			</div>
			{#if quote.customer?.address}
				<div class="sm:col-span-2">
					<div class="text-xs text-muted-foreground">Address</div>
					<div>{quote.customer.address}</div>
				</div>
			{/if}
			{#if quote.loadProfileNotes || quote.loadProfileTotal !== null}
				<div class="sm:col-span-2">
					<div class="text-xs text-muted-foreground">Load profile</div>
					<div>
						{quote.loadProfileTotal !== null ? formatNaira(quote.loadProfileTotal) : ''}
						{quote.loadProfileNotes ?? ''}
					</div>
				</div>
			{/if}
		</div>

		{#if ungroupedItems.length > 0}
			<div>
				<h3 class="mb-2 font-semibold">Items</h3>
				<div class="divide-y rounded-md border">
					{#each ungroupedItems as item (item.id)}
						<div class="flex items-center justify-between gap-3 p-3 text-sm">
							<div class="min-w-0">
								<div class="font-medium">{item.description}</div>
								<div class="text-xs text-muted-foreground">
									{item.quantity} × {formatNaira(item.unitPrice)}
								</div>
							</div>
							<div class="shrink-0 font-medium tabular-nums">{formatNaira(item.totalPrice)}</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#each quote.sections ?? [] as section, index (section.id)}
			<section>
				<h3 class="mb-2 font-semibold">{index + 1}.0 {section.name}</h3>
				<div class="divide-y rounded-md border">
					{#each renderItems(section.items) as item (item.id)}
						<div class="flex items-center justify-between gap-3 p-3 text-sm">
							<div class="min-w-0">
								<div class="font-medium">{item.description}</div>
								<div class="text-xs text-muted-foreground">
									{item.quantity} × {formatNaira(item.unitPrice)}
								</div>
							</div>
							<div class="shrink-0 font-medium tabular-nums">{formatNaira(item.totalPrice)}</div>
						</div>
					{/each}
					{#if renderItems(section.items).length === 0}
						<p class="p-3 text-sm text-muted-foreground">No items in this section.</p>
					{/if}
				</div>
			</section>
		{/each}

		<dl class="rounded-md border p-4 text-sm">
			<div class="flex justify-between gap-3">
				<dt class="text-muted-foreground">Subtotal</dt>
				<dd class="tabular-nums">{formatNaira(subtotal)}</dd>
			</div>
			<div class="flex justify-between gap-3">
				<dt class="text-muted-foreground">Discount</dt>
				<dd class="tabular-nums">—</dd>
			</div>
			<div class="flex justify-between gap-3">
				<dt class="text-muted-foreground">Tax</dt>
				<dd class="tabular-nums">—</dd>
			</div>
			<div class="mt-3 flex justify-between gap-3 border-t pt-3 font-semibold">
				<dt>Total</dt>
				<dd class="tabular-nums">{formatNaira(subtotal)}</dd>
			</div>
		</dl>
	</Card.Content>
</Card.Root>
