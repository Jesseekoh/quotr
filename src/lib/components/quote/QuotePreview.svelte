<script lang="ts">
	import type { QuoteDetail, QuoteItem, QuoteSection } from '#lib/api/types.js';
	import { formatNaira } from '#lib/utils/format.js';
	import {
		MAX_RENDERED_COMBINATIONS,
		lineTotal,
		optionTotal,
		quoteTotals,
		sectionRange,
		ungroupedTotal
	} from '#lib/utils/quote-totals.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';

	type PreviewQuote = Omit<
		Pick<
			QuoteDetail,
			'quoteNumber' | 'label' | 'loadProfileTotal' | 'loadProfileNotes' | 'createdAt'
		>,
		'createdAt'
	> & {
		// The remote layer returns Drizzle rows with Date objects; the API client returns strings.
		createdAt?: string | Date;
		customer?: QuoteDetail['customer'];
		items: QuoteItem[];
		sections: QuoteSection[];
	};

	let { quote }: { quote: PreviewQuote } = $props();

	let totals = $derived(quoteTotals(quote));
	let commonItems = $derived(quote.items.filter((item) => item.quoteSectionId === null));
	let commonTotal = $derived(ungroupedTotal(quote));
	let showAll = $state(false);
	let visibleCombinations = $derived(
		totals.combinations.slice(0, showAll ? totals.combinations.length : MAX_RENDERED_COMBINATIONS)
	);

	const dateFormatter = new Intl.DateTimeFormat('en-NG', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
	let issuedDate = $derived(
		quote.createdAt ? dateFormatter.format(new Date(quote.createdAt)) : '—'
	);

	function sectionTotalLabel(section: QuoteSection) {
		const range = sectionRange(section);
		return range.min === range.max
			? formatNaira(range.min)
			: `${formatNaira(range.min)} – ${formatNaira(range.max)}`;
	}

	function overallTotalLabel() {
		return totals.overallMin === totals.overallMax
			? formatNaira(totals.overallMin)
			: `${formatNaira(totals.overallMin)} – ${formatNaira(totals.overallMax)}`;
	}
</script>

{#snippet itemTable(items: QuoteItem[])}
	<div class="overflow-x-auto rounded-lg border">
		<Table.Root>
			<Table.Header>
				<Table.Row class="bg-muted/50 hover:bg-muted/50">
					<Table.Head>Items</Table.Head>
					<Table.Head class="text-center">QTY</Table.Head>
					<Table.Head class="text-right">Rate</Table.Head>
					<Table.Head class="text-right">Total</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if items.length === 0}
					<Table.Row>
						<Table.Cell colspan={4} class="py-4 text-muted-foreground">No items.</Table.Cell>
					</Table.Row>
				{:else}
					{#each items as item (item.id)}
						<Table.Row>
							<Table.Cell class="max-w-56 font-medium wrap-break-word whitespace-normal">
								{item.description}
							</Table.Cell>
							<Table.Cell class="text-center tabular-nums">{item.quantity}</Table.Cell>
							<Table.Cell class="text-right tabular-nums">{formatNaira(item.unitPrice)}</Table.Cell>
							<Table.Cell class="text-right font-medium tabular-nums"
								>{formatNaira(lineTotal(item))}</Table.Cell
							>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
{/snippet}

{#snippet totalRow(label: string, value: string)}
	<div class="flex items-center justify-between gap-3 border-t pt-2 text-sm">
		<span class="text-muted-foreground">{label}</span>
		<span class="font-semibold tabular-nums">{value}</span>
	</div>
{/snippet}

<Card.Root class="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-auto">
	<Card.Content class="flex flex-col gap-6 p-6">
		<header>
			<h1 class="text-3xl font-bold tracking-tight">Quote</h1>
			<div class="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
				<span class="text-muted-foreground">
					Quote Number <span class="font-medium text-foreground">{quote.quoteNumber}</span>
				</span>
				<span class="text-muted-foreground">
					Pricing <span class="font-medium text-foreground">{quote.label.replaceAll('_', ' ')}</span
					>
				</span>
			</div>
		</header>

		<div class="grid gap-4 rounded-xl border p-4 text-sm sm:grid-cols-2">
			<div>
				<div class="text-xs text-muted-foreground">Bill to</div>
				<div class="mt-1 font-semibold">{quote.customer?.name ?? 'Client'}</div>
				{#if quote.customer?.email}<div class="text-muted-foreground">
						{quote.customer.email}
					</div>{/if}
			</div>
			<div>
				<div class="text-xs text-muted-foreground">Date</div>
				<div class="mt-1 font-semibold">{issuedDate}</div>
			</div>
			{#if quote.customer?.address}
				<div class="sm:col-span-2">
					<div class="text-xs text-muted-foreground">Address</div>
					<div class="mt-1 font-semibold">{quote.customer.address}</div>
				</div>
			{/if}
			{#if quote.loadProfileTotal !== null || quote.loadProfileNotes}
				<div class="border-t pt-3 text-xs text-muted-foreground sm:col-span-2">
					Load profile:
					{quote.loadProfileTotal !== null ? formatNaira(quote.loadProfileTotal) : ''}
					{quote.loadProfileNotes}
				</div>
			{/if}
		</div>

		{#if commonItems.length > 0}
			<section class="flex flex-col gap-2">
				<h2 class="font-semibold">Common items</h2>
				{@render itemTable(commonItems)}
				{@render totalRow('Total', formatNaira(commonTotal))}
			</section>
		{/if}

		{#each quote.sections as section, index (section.id)}
			<section class="flex flex-col gap-2">
				<h2 class="font-semibold">{index + 1}.0 {section.name}</h2>
				{@render itemTable(section.items)}
				{@render totalRow('Total', sectionTotalLabel(section))}
				{#each section.options as option (option.id)}
					<div class="mt-3 flex flex-col gap-2">
						<h3 class="text-sm font-medium text-muted-foreground">
							Option: {option.name || 'Option'}
						</h3>
						{@render itemTable(option.items)}
						{@render totalRow('Option total', formatNaira(optionTotal(option)))}
					</div>
				{/each}
			</section>
		{/each}

		<section class="flex flex-col gap-3 border-t pt-5">
			<h2 class="font-semibold">Permuted prices</h2>
			<div class="rounded-lg border">
				{#each visibleCombinations as combination, index (combination.label || `fixed-${index}`)}
					<div class="flex justify-between gap-3 border-b px-4 py-2.5 text-sm last:border-b-0">
						<span class="text-muted-foreground">{combination.label || 'Fixed total'}</span>
						<span class="font-medium tabular-nums">{formatNaira(combination.total)}</span>
					</div>
				{/each}
			</div>
			{#if totals.combinationCount > MAX_RENDERED_COMBINATIONS}
				<div class="flex items-center justify-between text-sm text-muted-foreground">
					<span>{totals.combinationCount} combinations</span>
					{#if !totals.truncated}<Button
							type="button"
							variant="link"
							size="sm"
							onclick={() => (showAll = !showAll)}>{showAll ? 'Show fewer' : 'Show all'}</Button
						>{/if}
				</div>
			{/if}
			<div class="w-full rounded-xl border p-4 text-sm sm:ml-auto sm:max-w-xs">
				<div class="flex justify-between gap-3 py-1">
					<span class="text-muted-foreground">Fixed items</span>
					<span class="tabular-nums">{formatNaira(totals.fixedTotal)}</span>
				</div>
				<div class="mt-2 flex justify-between gap-3 border-t pt-3 font-semibold">
					<span>{totals.overallMin === totals.overallMax ? 'Total' : 'Total (min – max)'}</span>
					<span class="tabular-nums">{overallTotalLabel()}</span>
				</div>
			</div>
		</section>
	</Card.Content>
</Card.Root>
