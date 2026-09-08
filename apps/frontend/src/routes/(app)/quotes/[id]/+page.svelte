<script lang="ts">
	import type { PageData } from './$types';
	import QuoteHeader from '$lib/components/quote/QuoteHeader.svelte';
	import LoadProfileCard from '$lib/components/quote/LoadProfileCard.svelte';
	import ItemsTable from '$lib/components/quote/ItemsTable.svelte';
	import OptionTabs from '$lib/components/quote/OptionTabs.svelte';
	import TotalsSummary from '$lib/components/quote/TotalsSummary.svelte';
	import AddItemModal from '$lib/components/quote/AddItemModal.svelte';
	import AddOptionModal from '$lib/components/quote/AddOptionModal.svelte';
	import AddSectionModal from '$lib/components/quote/AddSectionModal.svelte';
	import QuoteSections from '$lib/components/quote/QuoteSections.svelte';
	import * as quotesApi from '$lib/api/quotes';
	import { ApiError } from '$lib/api/client';
	import type { PriceLabel, QuoteDetail } from '$lib/api/types';

	import * as Card from '$lib/components/ui/card/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	// import AlertCircleIcon from 'lucide-svelte/icons/circle-alert';
	import { IconAlertCircle } from '@tabler/icons-svelte';

	let { data }: { data: PageData } = $props();

	// Seed local state from the loader; every mutation below just refetches
	// the quote and replaces this, so the UI never has to reconcile partial
	// updates by hand.
	let quote = $state<QuoteDetail>(data.quote);
	let loading = $state(false);
	let errorMessage = $state<string | null>(null);

	// null = the next added item is "common" (applies to the whole quote);
	// an option id = the item should be attached to that option only.
	let addItemTarget = $state<string | null>(null);
	let showAddItemModal = $state(false);
	let showAddOptionModal = $state(false);
	let showAddSectionModal = $state(false);
	let addItemSectionId = $state<string | null>(null);

	let commonItems = $derived(quote.items.filter((item) => item.quoteSectionId === null));

	async function withLoading(fn: () => Promise<void>) {
		loading = true;
		errorMessage = null;
		try {
			await fn();
		} catch (e) {
			errorMessage = e instanceof ApiError ? e.message : 'Something went wrong. Please try again.';
		} finally {
			loading = false;
		}
	}

	function openAddItem(targetOptionId: string | null, targetSectionId: string | null = null) {
		addItemTarget = targetOptionId;
		addItemSectionId = targetSectionId;
		showAddItemModal = true;
	}

	async function handleLabelChange(label: PriceLabel) {
		await withLoading(async () => {
			quote = await quotesApi.updateQuote(quote.id, { label });
		});
	}

	async function handleLoadProfileSave(payload: {
		loadProfileTotal: number | null;
		loadProfileNotes: string;
	}) {
		await withLoading(async () => {
			quote = await quotesApi.updateQuote(quote.id, payload);
		});
	}

	async function handleAddOption(payload: {
		name: string;
		description?: string;
		quoteSectionId?: string;
	}) {
		await withLoading(async () => {
			quote = await quotesApi.addOption(quote.id, payload);
			showAddOptionModal = false;
		});
	}

	async function handleAddSection(payload: { name: string }) {
		await withLoading(async () => {
			quote = await quotesApi.addSection(quote.id, payload);
			showAddSectionModal = false;
		});
	}

	async function handleRemoveSection(sectionId: string) {
		if (!confirm('Remove this section? Its items will remain in the quote.')) return;
		await withLoading(async () => {
			quote = await quotesApi.removeSection(quote.id, sectionId);
		});
	}

	async function handleRemoveOption(optionId: string) {
		if (!confirm('Remove this option and all of its items?')) return;
		await withLoading(async () => {
			quote = await quotesApi.removeOption(quote.id, optionId);
		});
	}

	async function handleAddItem(payload: quotesApi.CreateItemPayload) {
		await withLoading(async () => {
			quote = await quotesApi.addItem(quote.id, {
				...payload,
				quoteOptionId: addItemTarget,
				quoteSectionId: addItemSectionId
			});
			showAddItemModal = false;
		});
	}

	async function handleQuantityChange(itemId: string, quantity: number) {
		await withLoading(async () => {
			quote = await quotesApi.updateItem(quote.id, itemId, { quantity });
		});
	}

	async function handleRemoveItem(itemId: string) {
		await withLoading(async () => {
			quote = await quotesApi.removeItem(quote.id, itemId);
		});
	}
</script>

<svelte:head>
	<title>{quote.quoteNumber} · Quote builder</title>
</svelte:head>

<div
	class="@container/main mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-4 md:px-6 md:py-6"
	aria-busy={loading}
>
	{#if errorMessage}
		<Alert.Root variant="destructive">
			<IconAlertCircle class="size-4" />
			<Alert.Description>{errorMessage}</Alert.Description>
		</Alert.Root>
	{/if}

	<QuoteHeader {quote} onLabelChange={handleLabelChange} disabled={loading} />

	<LoadProfileCard
		loadProfileTotal={quote.loadProfileTotal}
		loadProfileNotes={quote.loadProfileNotes}
		onSave={handleLoadProfileSave}
		disabled={loading}
	/>

	<QuoteSections
		sections={quote.quoteSections}
		onAddSection={() => (showAddSectionModal = true)}
		onAddItem={(sectionId) => openAddItem(null, sectionId)}
		onRemoveSection={handleRemoveSection}
		onQuantityChange={handleQuantityChange}
		onRemoveItem={handleRemoveItem}
	/>

	<Card.Root>
		<Card.Header
			class="flex-col items-start justify-between gap-3 space-y-0 sm:flex-row sm:items-center"
		>
			<Card.Title>Items</Card.Title>
			<Button onclick={() => openAddItem(null)} disabled={loading}>Add item</Button>
		</Card.Header>
		<Card.Content class="flex flex-col gap-3">
			<p class="text-xs text-muted-foreground">
				These apply to the whole quote. Add items to a specific option below instead if they're only
				part of one alternative package.
			</p>
			<ItemsTable
				items={commonItems}
				onQuantityChange={handleQuantityChange}
				onRemove={handleRemoveItem}
			/>
		</Card.Content>
	</Card.Root>

	<OptionTabs
		options={quote.options}
		onAddOption={() => (showAddOptionModal = true)}
		onRemoveOption={handleRemoveOption}
		onAddItem={(optionId) => openAddItem(optionId)}
		onQuantityChange={handleQuantityChange}
		onRemoveItem={handleRemoveItem}
	/>

	<TotalsSummary options={quote.options} summary={quote.summary} />
</div>

<AddItemModal
	bind:open={showAddItemModal}
	label={quote.label}
	sectionId={addItemSectionId}
	onSubmit={handleAddItem}
/>

<AddOptionModal
	bind:open={showAddOptionModal}
	sections={quote.quoteSections}
	onSubmit={handleAddOption}
/>

<AddSectionModal bind:open={showAddSectionModal} onSubmit={handleAddSection} />
