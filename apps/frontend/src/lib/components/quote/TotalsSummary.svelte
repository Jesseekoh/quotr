<script lang="ts">
	import type { QuoteOptionWithTotals, QuoteSummary } from '$lib/api/types';
	import { formatNaira } from '$lib/utils/format';

	let {
		options,
		summary
	}: {
		options: QuoteOptionWithTotals[];
		summary: QuoteSummary;
	} = $props();
</script>

<section class="card totals">
	<h2>Total cost</h2>

	<dl>
		<div class="line">
			<dt>Common items</dt>
			<dd>{formatNaira(summary.commonItemsTotal)}</dd>
		</div>
		{#each options as option (option.id)}
			<div class="line">
				<dt>{option.name}</dt>
				<dd>{formatNaira(option.grandTotal)}</dd>
			</div>
		{/each}
	</dl>

	<div class="range">
		{#if options.length > 1}
			<span>Total cost</span>
			<strong>{formatNaira(summary.minTotal)} to {formatNaira(summary.maxTotal)}</strong>
		{:else}
			<span>Total cost</span>
			<strong>{formatNaira(summary.minTotal)}</strong>
		{/if}
	</div>
</section>

<style>
	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
	}

	h2 {
		font-size: var(--text-base);
		font-weight: 600;
		margin: 0 0 var(--space-3);
	}

	dl {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.line {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		font-size: var(--text-sm);
	}

	dt {
		color: var(--color-text-muted);
	}

	dd {
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	.range {
		margin-top: var(--space-4);
		padding-top: var(--space-3);
		border-top: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.range span {
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.range strong {
		font-size: var(--text-lg);
		font-variant-numeric: tabular-nums;
	}
</style>
