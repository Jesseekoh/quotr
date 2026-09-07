<script lang="ts">
	import { resolve } from '$app/paths';
	import PlusIcon from '@tabler/icons-svelte/icons/plus';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import type { QuoteStatus } from '$lib/api/types';

	let { data } = $props();

	const statusLabels: Record<QuoteStatus, string> = {
		DRAFT: 'Draft',
		SENT: 'Sent',
		ACCEPTED: 'Accepted',
		REJECTED: 'Rejected'
	};

	function formatStatus(status: QuoteStatus) {
		return statusLabels[status];
	}
</script>

<svelte:head>
	<title>Quotes</title>
</svelte:head>

<div class="flex flex-1 flex-col">
	<div class="@container/main flex flex-1 flex-col gap-2">
		<div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
			<div class="flex items-center justify-between px-4 lg:px-6">
				<div>
					<h1 class="text-2xl font-semibold tracking-tight">Quotes</h1>
					<p class="text-sm text-muted-foreground">Manage your customer quotes.</p>
				</div>
				<Button href={resolve('/quotes/new')}>
					<PlusIcon class="size-4" />
					New quote
				</Button>
			</div>

			<div class="px-4 lg:px-6">
				<div class="overflow-hidden rounded-lg border">
					<Table.Root>
						<Table.Header class="bg-muted">
							<Table.Row>
								<Table.Head>Quote number</Table.Head>
								<Table.Head>Customer</Table.Head>
								<Table.Head>Status</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#if data.quotes.length}
								{#each data.quotes as quote (quote.id)}
									<Table.Row>
										<Table.Cell class="font-medium">
											<a
												href={resolve(`/quotes/${quote.id}`)}
												class="underline-offset-4 hover:underline"
											>
												{quote.quoteNumber}
											</a>
										</Table.Cell>
										<Table.Cell>{quote.customer.name}</Table.Cell>
										<Table.Cell>
											<Badge variant="outline">{formatStatus(quote.status)}</Badge>
										</Table.Cell>
									</Table.Row>
								{/each}
							{:else}
								<Table.Row>
									<Table.Cell colspan={3} class="h-24 text-center text-muted-foreground">
										No quotes found.
									</Table.Cell>
								</Table.Row>
							{/if}
						</Table.Body>
					</Table.Root>
				</div>
			</div>
		</div>
	</div>
</div>
