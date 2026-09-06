<script lang="ts">
	import SearchIcon from '@tabler/icons-svelte/icons/search';
	import ChevronLeftIcon from '@tabler/icons-svelte/icons/chevron-left';
	import ChevronRightIcon from '@tabler/icons-svelte/icons/chevron-right';
	import ChevronsLeftIcon from '@tabler/icons-svelte/icons/chevrons-left';
	import ChevronsRightIcon from '@tabler/icons-svelte/icons/chevrons-right';
	import { FlexRender, createColumnHelper, createTable } from '@tanstack/svelte-table';
	import { goto } from '$app/navigation';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { features, type DashboardTableFeatures } from '$lib/components/data-table-features.js';
	import { resolve } from '$app/paths';
	import type { Product } from './+page.server.js';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let { data } = $props();

	// --- Filter state, seeded from the URL ---
	// eslint-disable-next-line svelte/state_referenced_locally -- intentionally capturing the initial value
	let category = $state(data.category);
	// eslint-disable-next-line svelte/state_referenced_locally
	let search = $state(data.search);

	const CATEGORIES = [
		{ value: '', label: 'All Categories' },
		{ value: 'SOLAR_PANEL', label: 'Solar Panel' },
		{ value: 'INVERTER', label: 'Inverter' },
		{ value: 'CHARGE_CONTROLLER', label: 'Charge Controller' },
		{ value: 'BATTERY', label: 'Battery' },
		{ value: 'RACK_MOUNTING', label: 'Rack / Mounting' },
		{ value: 'CABLE', label: 'Cable' },
		{ value: 'CABINET', label: 'Cabinet' },
		{ value: 'ACCESSORY', label: 'Accessory' },
		{ value: 'OTHER', label: 'Other' }
	];

	let categoryLabel = $derived(
		CATEGORIES.find((c) => c.value === category)?.label ?? 'All Categories'
	);

	/** Navigate with updated query params — lets the server re-run the load. */
	function applyFilters() {
		const params = new SvelteURLSearchParams();
		if (category) params.set('category', category);
		if (search) params.set('search', search);
		const qs = params.toString();
		goto(resolve(`/products${qs ? `?${qs}` : ''}`), { invalidateAll: true });
	}

	function onCategoryChange(value: string) {
		category = value;
		applyFilters();
	}

	let debounceTimer: ReturnType<typeof setTimeout>;
	function onSearchInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => applyFilters(), 350);
	}

	/** Format a Decimal/number value as currency. */
	function fmt(value: string | number): string {
		const n = typeof value === 'string' ? parseFloat(value) : value;
		return new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: 'NGN',
			minimumFractionDigits: 2
		}).format(n);
	}

	/** Pretty-print a SCREAMING_SNAKE category enum value. */
	function fmtCategory(cat: string): string {
		return CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
	}

	// --- TanStack Table v9 setup ---
	const columnHelper = createColumnHelper<DashboardTableFeatures, Product>();

	const columns = columnHelper.columns([
		columnHelper.accessor('name', {
			header: 'Name',
			enableHiding: false
		}),
		columnHelper.accessor('brand', {
			header: 'Brand'
		}),
		columnHelper.accessor('category', {
			header: 'Category',
			cell: ({ getValue }) => fmtCategory(getValue())
		}),
		columnHelper.accessor('specification', {
			header: 'Specification'
		}),
		columnHelper.accessor('costPrice', {
			header: 'Cost Price',
			cell: ({ getValue }) => fmt(getValue())
		}),
		columnHelper.accessor('enduserPrice', {
			header: 'End User Price',
			cell: ({ getValue }) => fmt(getValue())
		}),
		columnHelper.accessor('discountPrice', {
			header: 'Discount Price',
			cell: ({ getValue }) => fmt(getValue())
		}),
		columnHelper.accessor('resalePrice', {
			header: 'Resale Price',
			cell: ({ getValue }) => fmt(getValue())
		}),
		columnHelper.accessor('specialPrice', {
			header: 'Special Price',
			cell: ({ getValue }) => fmt(getValue())
		})
	]);

	const table = createTable({
		features,
		get data() {
			return data.products;
		},
		columns,
		getRowId: (row) => row.id
	});

	const pagination = $derived(table.atoms.pagination.get());
</script>

<div class="flex flex-1 flex-col">
	<div class="@container/main flex flex-1 flex-col gap-2">
		<div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
			<!-- Toolbar: category filter + search -->
			<div class="flex flex-col gap-3 px-4 sm:flex-row sm:items-end lg:px-6">
				<div class="flex flex-col gap-1.5">
					<Label for="category-filter" class="text-sm font-medium">Category</Label>
					<Select.Root type="single" bind:value={() => category, onCategoryChange}>
						<Select.Trigger class="w-[200px]" id="category-filter">
							{categoryLabel}
						</Select.Trigger>
						<Select.Content>
							{#each CATEGORIES as cat (cat.value)}
								<Select.Item value={cat.value}>{cat.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="relative flex-1 sm:max-w-sm">
					<Label for="search-input" class="sr-only">Search products</Label>
					<SearchIcon
						class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						id="search-input"
						type="search"
						placeholder="Search by name, brand, spec…"
						class="pl-9"
						bind:value={search}
						oninput={onSearchInput}
					/>
				</div>
			</div>

			<!-- Data table -->
			<div class="px-4 lg:px-6">
				<div class="overflow-hidden rounded-lg border">
					<Table.Root>
						<Table.Header class="bg-muted">
							{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
								<Table.Row>
									{#each headerGroup.headers as header (header.id)}
										<Table.Head colspan={header.colSpan}>
											{#if !header.isPlaceholder}
												<FlexRender {header} />
											{/if}
										</Table.Head>
									{/each}
								</Table.Row>
							{/each}
						</Table.Header>
						<Table.Body>
							{#if table.getRowModel().rows?.length}
								{#each table.getRowModel().rows as row (row.id)}
									<Table.Row>
										{#each row.getVisibleCells() as cell (cell.id)}
											<Table.Cell>
												<FlexRender {cell} />
											</Table.Cell>
										{/each}
									</Table.Row>
								{/each}
							{:else}
								<Table.Row>
									<Table.Cell colspan={columns.length} class="h-24 text-center">
										No products found.
									</Table.Cell>
								</Table.Row>
							{/if}
						</Table.Body>
					</Table.Root>
				</div>

				<!-- Pagination -->
				<div class="flex items-center justify-between px-4 py-4">
					<div class="hidden flex-1 text-sm text-muted-foreground lg:flex">
						{table.getRowModel().rows.length} product(s)
					</div>
					<div class="flex w-full items-center gap-8 lg:w-fit">
						<div class="hidden items-center gap-2 lg:flex">
							<Label for="rows-per-page" class="text-sm font-medium">Rows per page</Label>
							<Select.Root
								type="single"
								bind:value={() => `${pagination.pageSize}`, (v) => table.setPageSize(Number(v))}
							>
								<Select.Trigger size="sm" class="w-20" id="rows-per-page">
									{pagination.pageSize}
								</Select.Trigger>
								<Select.Content side="top">
									{#each [10, 20, 30, 40, 50] as pageSize (pageSize)}
										<Select.Item value={pageSize.toString()}>
											{pageSize}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="flex w-fit items-center justify-center text-sm font-medium">
							Page {pagination.pageIndex + 1} of
							{table.getPageCount()}
						</div>
						<div class="ms-auto flex items-center gap-2 lg:ms-0">
							<Button
								variant="outline"
								class="hidden h-8 w-8 p-0 lg:flex"
								onclick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<span class="sr-only">Go to first page</span>
								<ChevronsLeftIcon />
							</Button>
							<Button
								variant="outline"
								class="size-8"
								size="icon"
								onclick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<span class="sr-only">Go to previous page</span>
								<ChevronLeftIcon />
							</Button>
							<Button
								variant="outline"
								class="size-8"
								size="icon"
								onclick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<span class="sr-only">Go to next page</span>
								<ChevronRightIcon />
							</Button>
							<Button
								variant="outline"
								class="hidden size-8 lg:flex"
								size="icon"
								onclick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<span class="sr-only">Go to last page</span>
								<ChevronsRightIcon />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
