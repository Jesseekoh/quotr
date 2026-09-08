<script lang="ts">
	import type { PriceLabel, QuoteDetail } from '$lib/api/types';
	import { PRICE_LABEL_OPTIONS } from '$lib/utils/pricing';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	let {
		quote,
		onLabelChange,
		disabled = false
	}: {
		quote: QuoteDetail;
		onLabelChange: (label: PriceLabel) => void;
		disabled?: boolean;
	} = $props();

	function handleChange(value: string) {
		const nextLabel = value as PriceLabel;
		if (nextLabel !== quote.label) onLabelChange(nextLabel);
	}
</script>

<Card.Root>
	<Card.Header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
		<div>
			<Card.Title class="text-2xl">{quote.quoteNumber}</Card.Title>
			<Card.Description>
				{quote.customer.name}
				{#if quote.customer.phone || quote.customer.email}
					<span> · {quote.customer.phone ?? quote.customer.email}</span>
				{/if}
			</Card.Description>
		</div>
		<Badge variant="outline" class="capitalize">{quote.status.toLowerCase()}</Badge>
	</Card.Header>
	<Card.Content>
		<div class="flex max-w-xs flex-col gap-2">
			<Label for="quote-price-label">Price label</Label>
			<Select.Root type="single" value={quote.label} onValueChange={handleChange} {disabled}>
				<Select.Trigger id="quote-price-label" class="w-full">
					{PRICE_LABEL_OPTIONS.find((option) => option.value === quote.label)?.text}
				</Select.Trigger>
				<Select.Content>
					{#each PRICE_LABEL_OPTIONS as opt (opt.value)}
						<Select.Item value={opt.value}>{opt.text}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<p class="text-xs text-muted-foreground">
				Changing this re-prices every catalog item on the quote.
			</p>
		</div>
	</Card.Content>
</Card.Root>
