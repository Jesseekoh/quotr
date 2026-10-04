<script lang="ts">
	import { formatNaira } from '#lib/utils/format.js';
	import { MAX_RENDERED_COMBINATIONS, type QuoteTotals } from '#lib/utils/quote-totals.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';

	let { totals }: { totals: QuoteTotals } = $props();
	let showAll = $state(false);
	let visibleCombinations = $derived(
		totals.combinations.slice(0, showAll ? totals.combinations.length : MAX_RENDERED_COMBINATIONS)
	);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Quote total</Card.Title>
		<Card.Description
			>Ungrouped items and the available section pricing combinations.</Card.Description
		>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<div class="divide-y rounded-md border text-sm">
			{#each visibleCombinations as combination, index (combination.label || `fixed-${index}`)}
				<div class="flex justify-between gap-3 p-3">
					<span class="text-muted-foreground">{combination.label || 'Total'}</span>
					<strong class="tabular-nums">{formatNaira(combination.total)}</strong>
				</div>
			{/each}
		</div>

		{#if totals.combinationCount > MAX_RENDERED_COMBINATIONS}
			<div class="flex items-center justify-between gap-3 text-sm text-muted-foreground">
				<span>{totals.combinationCount} combinations</span>
				{#if !totals.truncated}
					<Button type="button" variant="link" size="sm" onclick={() => (showAll = !showAll)}>
						{showAll ? 'Show fewer' : 'Show all'}
					</Button>
				{/if}
			</div>
		{/if}

		<div class="flex items-baseline justify-between gap-3 border-t pt-3">
			<span class="text-sm text-muted-foreground">Overall total</span>
			<strong class="text-lg tabular-nums">
				{#if totals.overallMin === totals.overallMax}
					{formatNaira(totals.overallMin)}
				{:else}
					{formatNaira(totals.overallMin)} - {formatNaira(totals.overallMax)}
				{/if}
			</strong>
		</div>
	</Card.Content>
</Card.Root>
