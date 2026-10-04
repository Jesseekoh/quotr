<script lang="ts">
	import type { QuoteDetail, QuoteItem, QuoteSection } from '#lib/api/types.js';
	import { formatNaira } from '#lib/utils/format.js';
	import {
		baseTotal,
		MAX_RENDERED_COMBINATIONS,
		optionTotal,
		quoteTotals,
		sectionRange
	} from '#lib/utils/quote-totals.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';

	type PreviewQuote = Pick<
		QuoteDetail,
		'quoteNumber' | 'label' | 'loadProfileTotal' | 'loadProfileNotes'
	> & {
		customer?: QuoteDetail['customer'];
		items: QuoteItem[];
		sections: QuoteSection[];
	};

	let { quote }: { quote: PreviewQuote } = $props();
	let totals = $derived(quoteTotals(quote));
	let showAll = $state(false);
	let visibleCombinations = $derived(
		totals.combinations.slice(0, showAll ? totals.combinations.length : MAX_RENDERED_COMBINATIONS)
	);
	let ungroupedItems = $derived(quote.items.filter((item) => item.quoteSectionId === null));

	function itemLabel(item: QuoteItem) {
		return `${item.quantity} x ${formatNaira(item.unitPrice)}`;
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
			<section>
				<div class="mb-2 flex items-center justify-between gap-3">
					<h3 class="font-semibold">Ungrouped items</h3>
					<strong class="tabular-nums"
						>{formatNaira(
							totals.fixedTotal -
								quote.sections.reduce((sum, section) => sum + sectionRange(section).min, 0)
						)}</strong
					>
				</div>
				<div class="divide-y rounded-md border">
					{#each ungroupedItems as item (item.id)}
						<div class="flex items-center justify-between gap-3 p-3 text-sm">
							<div>
								<div class="font-medium">{item.description}</div>
								<div class="text-xs text-muted-foreground">{itemLabel(item)}</div>
							</div>
							<strong class="tabular-nums">{formatNaira(item.totalPrice)}</strong>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		{#each quote.sections as section, index (section.id)}
			<section>
				<div class="mb-2 flex items-center justify-between gap-3">
					<h3 class="font-semibold">{index + 1}.0 {section.name}</h3>
					{#if sectionRange(section).min === sectionRange(section).max}
						<strong class="tabular-nums">{formatNaira(sectionRange(section).min)}</strong>
					{:else}
						<strong class="tabular-nums"
							>{formatNaira(sectionRange(section).min)} - {formatNaira(
								sectionRange(section).max
							)}</strong
						>
					{/if}
				</div>
				<p class="mb-2 text-xs text-muted-foreground">
					Includes {formatNaira(baseTotal(section))} in base items.
				</p>
				<div class="divide-y rounded-md border">
					{#each section.items as item (item.id)}
						<div class="flex items-center justify-between gap-3 p-3 text-sm">
							<div>
								<div class="font-medium">{item.description}</div>
								<div class="text-xs text-muted-foreground">{itemLabel(item)}</div>
							</div>
							<strong class="tabular-nums">{formatNaira(item.totalPrice)}</strong>
						</div>
					{/each}
				</div>
				{#each section.options as option (option.id)}
					<div class="mt-3 rounded-md border">
						<div class="flex justify-between gap-3 border-b p-3 text-sm font-medium">
							<span>{option.name || 'Option'}</span>
							<strong>{formatNaira(optionTotal(option))}</strong>
						</div>
						{#each option.items as item (item.id)}
							<div class="flex items-center justify-between gap-3 p-3 text-sm">
								<div>
									<div class="font-medium">{item.description}</div>
									<div class="text-xs text-muted-foreground">{itemLabel(item)}</div>
								</div>
								<strong class="tabular-nums">{formatNaira(item.totalPrice)}</strong>
							</div>
						{/each}
					</div>
				{/each}
			</section>
		{/each}

		<section class="flex flex-col gap-3 border-t pt-4">
			<h3 class="font-semibold">Pricing combinations</h3>
			<div class="divide-y rounded-md border text-sm">
				{#each visibleCombinations as combination, index (combination.label || `fixed-${index}`)}
					<div class="flex justify-between gap-3 p-3">
						<span class="text-muted-foreground">{combination.label || 'Total'}</span>
						<strong class="tabular-nums">{formatNaira(combination.total)}</strong>
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
			<div class="flex justify-between gap-3 border-t pt-3 font-semibold">
				<span>{totals.overallMin === totals.overallMax ? 'Total' : 'From total to total'}</span>
				<span class="tabular-nums"
					>{formatNaira(totals.overallMin)}{#if totals.overallMin !== totals.overallMax}
						- {formatNaira(totals.overallMax)}{/if}</span
				>
			</div>
		</section>
	</Card.Content>
</Card.Root>
