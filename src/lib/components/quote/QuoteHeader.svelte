<script lang="ts">
	import type { PriceLabel, QuoteDetail, QuoteStatus } from '#lib/api/types';
	import { PRICE_LABEL_OPTIONS } from '#lib/utils/pricing';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import * as Switch from '#lib/components/ui/switch/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	let {
		quote,
		onLabelChange,
		onStatusChange,
		showPreview,
		onShowPreviewChange,
		onOpenPreview,
		disabled = false
	}: {
		quote: QuoteDetail;
		onLabelChange: (label: PriceLabel) => void;
		onStatusChange: (status: QuoteStatus) => void;
		showPreview: boolean;
		onShowPreviewChange: (show: boolean) => void;
		onOpenPreview: () => void;
		disabled?: boolean;
	} = $props();

	const STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
		{ value: 'DRAFT', label: 'Draft' },
		{ value: 'SENT', label: 'Sent' },
		{ value: 'ACCEPTED', label: 'Accepted' },
		{ value: 'REJECTED', label: 'Rejected' }
	];

	function handleChange(value: string) {
		const nextLabel = value as PriceLabel;
		if (nextLabel !== quote.label) onLabelChange(nextLabel);
	}

	function handleStatusChange(value: string) {
		const nextStatus = value as QuoteStatus;
		if (nextStatus !== quote.status) onStatusChange(nextStatus);
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
		<div class="flex flex-wrap items-center justify-end gap-3">
			<div class="flex items-center gap-2">
				<Switch.Root
					id="quote-preview-toggle"
					checked={showPreview}
					onCheckedChange={onShowPreviewChange}
					{disabled}
				/>
				<Label for="quote-preview-toggle">Show preview</Label>
			</div>
			<Button type="button" variant="outline" class="lg:hidden" onclick={onOpenPreview}>
				Preview
			</Button>
			<Select.Root type="single" value={quote.status} onValueChange={handleStatusChange} {disabled}>
				<Select.Trigger
					aria-label="Quote status"
					class="h-7 w-auto rounded-full border px-3 text-xs font-medium capitalize"
				>
					{STATUS_OPTIONS.find((option) => option.value === quote.status)?.label}
				</Select.Trigger>
				<Select.Content>
					{#each STATUS_OPTIONS as option (option.value)}
						<Select.Item value={option.value}>{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
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
