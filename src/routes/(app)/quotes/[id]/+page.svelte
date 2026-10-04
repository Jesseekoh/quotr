<script lang="ts">
	import type { PageData } from './$types';
	import QuoteHeader from '#lib/components/quote/QuoteHeader.svelte';
	import LoadProfileCard from '#lib/components/quote/LoadProfileCard.svelte';
	import TotalsSummary from '#lib/components/quote/TotalsSummary.svelte';
	import AddItemModal from '#lib/components/quote/AddItemModal.svelte';
	import AddOptionModal from '#lib/components/quote/AddOptionModal.svelte';
	import AddSectionModal from '#lib/components/quote/AddSectionModal.svelte';
	import QuoteSections from '#lib/components/quote/QuoteSections.svelte';
	import QuotePreview from '#lib/components/quote/QuotePreview.svelte';
	import { ApiError } from '#lib/api/client.js';
	import type { PriceLabel, QuoteStatus } from '#lib/api/types.js';
	import type { CreateItemPayload } from '#lib/api/quotes.js';
	import { quoteTotals } from '#lib/utils/quote-totals.js';
	import { onMount } from 'svelte';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button } from '#lib/components/ui/button/index.js';

	import * as Alert from '#lib/components/ui/alert/index.js';
	import { IconAlertCircle } from '@tabler/icons-svelte';
	import {
		updateQuote,
		addSection,
		removeSection,
		removeOption,
		addItem,
		updateItem,
		removeItem,
		addOption,
		updateOption
	} from '#lib/api/quotes.remote.js';

	type PageProps = {
		data: PageData;
	};
	let { data }: PageProps = $props();

	let quote = $derived(data.quote);
	let loading = $state(false);
	let errorMessage = $state<string | null>(null);
	let showPreview = $state(false);
	let showMobilePreview = $state(false);
	let hydrated = $state(false);
	let loadProfileDraft = $state<{
		loadProfileTotal: number | null;
		loadProfileNotes: string;
	} | null>(null);

	let addItemTarget = $state<string | null>(null);
	let addItemSectionId = $state<string | null>(null);
	let addOptionSectionId = $state<string | null>(null);
	let showAddItemModal = $state(false);
	let showAddOptionModal = $state(false);
	let showAddSectionModal = $state(false);

	onMount(() => {
		try {
			showPreview = window.localStorage.getItem('quotr:quote-preview') === 'true';
		} catch {
			showPreview = false;
		}
		hydrated = true;
	});

	$effect(() => {
		if (!hydrated) return;
		try {
			window.localStorage.setItem('quotr:quote-preview', String(showPreview));
		} catch {
			// Storage is optional and may be unavailable in private browsing.
		}
	});

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

	function openAddOption(sectionId: string) {
		addOptionSectionId = sectionId;
		showAddOptionModal = true;
	}

	async function handleLabelChange(label: PriceLabel) {
		await withLoading(async () => {
			quote = await updateQuote({ id: quote.id, label });
		});
	}

	async function handleStatusChange(status: QuoteStatus) {
		await withLoading(async () => {
			quote = await updateQuote({ id: quote.id, status });
		});
	}

	async function handleLoadProfileSave(payload: {
		loadProfileTotal: number | null;
		loadProfileNotes: string;
	}) {
		await withLoading(async () => {
			quote = await updateQuote({ id: quote.id, ...payload });
			loadProfileDraft = null;
		});
	}

	async function handleAddOption(payload: {
		name: string;
		description?: string;
		quoteSectionId?: string;
	}) {
		await withLoading(async () => {
			quote = await addOption({ quoteId: quote.id, ...payload });
			showAddOptionModal = false;
		});
	}

	async function handleRenameOption(optionId: string, name: string) {
		if (!name.trim()) return;
		await withLoading(async () => {
			const option = quote.options.find((item) => item.id === optionId);
			if (!option || !option.quoteSectionId) return;
			quote = await updateOption({
				id: optionId,
				quoteId: quote.id,
				name: name.trim(),
				quoteSectionId: option.quoteSectionId
			});
		});
	}

	async function handleAddSection(payload: { name: string }) {
		await withLoading(async () => {
			quote = await addSection({ quoteId: quote.id, ...payload });
			showAddSectionModal = false;
		});
	}

	async function handleRemoveSection(sectionId: string) {
		if (!confirm('Remove this empty section?')) return;
		await withLoading(async () => {
			quote = await removeSection({ id: sectionId, quoteId: quote.id });
		});
	}

	async function handleRemoveOption(optionId: string) {
		await withLoading(async () => {
			quote = await removeOption({ id: optionId, quoteId: quote.id });
		});
	}

	async function handleAddItem(payload: CreateItemPayload) {
		await withLoading(async () => {
			quote = await addItem({
				quoteId: quote.id,
				data: payload,
				quoteOptionId: payload.quoteOptionId ?? addItemTarget,
				quoteSectionId: payload.quoteSectionId ?? addItemSectionId
			});

			showAddItemModal = false;
		});
	}

	async function handleQuantityChange(itemId: string, quantity: number) {
		await withLoading(async () => {
			quote = await updateItem({ id: itemId, quoteId: quote.id, data: { quantity } });
		});
	}

	async function handleRemoveItem(itemId: string) {
		await withLoading(async () => {
			quote = await removeItem({ id: itemId, quoteId: quote.id });
		});
	}

	async function handleMoveItem(itemId: string, sectionId: string | null, optionId: string | null) {
		await withLoading(async () => {
			quote = await updateItem({
				id: itemId,
				quoteId: quote.id,
				quoteSectionId: sectionId,
				quoteOptionId: optionId
			});
		});
	}

	const ungroupedItems = $derived(
		(quote.items ?? []).filter(
			(item) => item.quoteSectionId === null && item.quoteOptionId === null
		)
	);
	const sections = $derived(
		(quote.sections ?? []).map((section) => ({
			...section,
			items: (quote.items ?? []).filter(
				(item) => item.quoteSectionId === section.id && item.quoteOptionId === null
			),
			options: (section.options ?? []).map((option) => ({
				...option,
				items: (quote.items ?? []).filter((item) => item.quoteOptionId === option.id)
			}))
		}))
	);
	const totals = $derived(quoteTotals({ ...quote, sections }));
</script>

<svelte:head>
	<title>{quote?.quoteNumber} · Quote builder</title>
</svelte:head>

{#key data.quote.id}
	<div
		class="@container/main mx-auto flex w-full flex-col gap-6 px-4 py-4 transition-[max-width] duration-300 md:px-6 md:py-6"
		// class:max-w-7xl={showPreview}
		// class:max-w-5xl={!showPreview}
		aria-busy={loading}
	>
		{#if errorMessage}
			<Alert.Root variant="destructive">
				<IconAlertCircle class="size-4" />
				<Alert.Description>{errorMessage}</Alert.Description>
			</Alert.Root>
		{/if}

		<QuoteHeader
			{quote}
			onLabelChange={handleLabelChange}
			onStatusChange={handleStatusChange}
			{showPreview}
			onShowPreviewChange={(value) => (showPreview = value)}
			onOpenPreview={() => (showMobilePreview = true)}
			disabled={loading}
		/>

		<div class={showPreview ? 'grid gap-6 lg:grid-cols-2' : ''}>
			<div class="flex min-w-0 flex-col gap-6">
				<LoadProfileCard
					loadProfileTotal={quote.loadProfileTotal}
					loadProfileNotes={quote.loadProfileNotes}
					onSave={handleLoadProfileSave}
					onChange={(payload) => (loadProfileDraft = payload)}
					disabled={loading}
				/>

				<QuoteSections
					{ungroupedItems}
					{sections}
					onAddSection={() => (showAddSectionModal = true)}
					onAddItem={(sectionId, optionId) => openAddItem(optionId, sectionId)}
					onAddOption={openAddOption}
					onRenameOption={handleRenameOption}
					onRemoveOption={handleRemoveOption}
					onRemoveSection={handleRemoveSection}
					onQuantityChange={handleQuantityChange}
					onRemoveItem={handleRemoveItem}
					onMoveItem={handleMoveItem}
				/>

				<TotalsSummary {totals} />
			</div>

			{#if showPreview}
				<QuotePreview
					quote={{
						...quote,
						...loadProfileDraft,
						items: quote.items ?? [],
						sections
					}}
				/>
			{/if}
		</div>
	</div>
{/key}

<Dialog.Root bind:open={showMobilePreview}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-2xl lg:hidden">
		<Dialog.Header>
			<Dialog.Title>Preview</Dialog.Title>
			<Dialog.Description>How the client will see this quote.</Dialog.Description>
		</Dialog.Header>
		<QuotePreview quote={{ ...quote, ...loadProfileDraft, items: quote.items ?? [], sections }} />
		<Dialog.Footer
			><Button type="button" onclick={() => (showMobilePreview = false)}>Close</Button
			></Dialog.Footer
		>
	</Dialog.Content>
</Dialog.Root>

<AddItemModal
	bind:open={showAddItemModal}
	label={quote.label}
	sectionId={addItemSectionId}
	optionId={addItemTarget}
	onSubmit={handleAddItem}
/>

<AddOptionModal
	bind:open={showAddOptionModal}
	sectionId={addOptionSectionId ?? ''}
	onSubmit={handleAddOption}
/>

<AddSectionModal bind:open={showAddSectionModal} onSubmit={handleAddSection} />
