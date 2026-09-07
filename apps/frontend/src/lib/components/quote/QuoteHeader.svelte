<script lang="ts">
	import type { PriceLabel, QuoteDetail } from '$lib/api/types';
	import { PRICE_LABEL_OPTIONS } from '$lib/utils/pricing';

	let {
		quote,
		onLabelChange,
		disabled = false
	}: {
		quote: QuoteDetail;
		onLabelChange: (label: PriceLabel) => void;
		disabled?: boolean;
	} = $props();

	function handleChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value as PriceLabel;
		if (value !== quote.label) onLabelChange(value);
	}
</script>

<header class="header">
	<div class="identity">
		<h1>{quote.quoteNumber}</h1>
		<p class="customer">
			{quote.customer.name}
			{#if quote.customer.phone || quote.customer.email}
				<span class="muted"> · {quote.customer.phone ?? quote.customer.email}</span>
			{/if}
		</p>
	</div>

	<div class="controls">
		<label class="field">
			<span>Price label</span>
			<select value={quote.label} onchange={handleChange} {disabled}>
				{#each PRICE_LABEL_OPTIONS as opt (opt.value)}
					<option value={opt.value}>{opt.text}</option>
				{/each}
			</select>
			<span class="hint">Changing this re-prices every catalog item on the quote.</span>
		</label>

		<span class="badge badge-{quote.status.toLowerCase()}">{quote.status.toLowerCase()}</span>
	</div>
</header>

<style>
	.header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-4);
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-border);
	}

	h1 {
		font-size: var(--text-xl);
		font-weight: 600;
		margin: 0;
	}

	.customer {
		margin: var(--space-1) 0 0;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.controls {
		display: flex;
		align-items: flex-start;
		gap: var(--space-4);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: var(--text-sm);
	}

	.field select {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		font-size: var(--text-sm);
		min-width: 12rem;
	}

	.hint {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		max-width: 16rem;
	}

	.badge {
		padding: var(--space-1) var(--space-3);
		border-radius: 999px;
		font-size: var(--text-xs);
		text-transform: capitalize;
		border: 1px solid transparent;
		align-self: flex-start;
	}

	.badge-draft {
		background: var(--color-accent-tint);
		color: var(--color-accent);
	}

	.badge-sent {
		background: #eaf0fb;
		color: #2c4f8f;
	}

	.badge-accepted {
		background: var(--color-success-tint);
		color: var(--color-success);
	}

	.badge-rejected {
		background: var(--color-danger-tint);
		color: var(--color-danger);
	}
</style>
