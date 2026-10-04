<script lang="ts">
	import type { QuoteOptionWithTotals, QuoteSummary } from '#lib/api/types';
	import { formatNaira } from '#lib/utils/format';
	import * as Card from '#lib/components/ui/card/index.js';

	let {
		options,
		summary,
		subtotal
	}: {
		options: QuoteOptionWithTotals[];
		summary: QuoteSummary;
		subtotal: number;
	} = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Total cost</Card.Title>
	</Card.Header>
	<Card.Content>
		<dl class="flex flex-col gap-2 text-sm">
			<div class="flex justify-between gap-3">
				<dt class="text-muted-foreground">Items subtotal</dt>
				<dd class="m-0 tabular-nums">{formatNaira(subtotal)}</dd>
			</div>
			{#each options as option (option.id)}
				<div class="flex justify-between gap-3">
					<dt class="text-muted-foreground">{option.name}</dt>
					<dd class="m-0 tabular-nums">{formatNaira(option.grandTotal)}</dd>
				</div>
			{/each}
		</dl>

		<div class="mt-4 flex items-baseline justify-between gap-3 border-t pt-3">
			<span class="text-sm text-muted-foreground">Total cost</span>
			<strong class="text-lg tabular-nums">
				{#if options.length > 1}
					{formatNaira(summary.minTotal)} to {formatNaira(summary.maxTotal)}
				{:else}
					{formatNaira(summary.minTotal)}
				{/if}
			</strong>
		</div>
	</Card.Content>
</Card.Root>
