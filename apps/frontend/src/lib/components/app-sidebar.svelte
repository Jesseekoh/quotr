<script lang="ts">
	import ChartBarIcon from '@tabler/icons-svelte/icons/chart-bar';
	import DashboardIcon from '@tabler/icons-svelte/icons/dashboard';
	import DatabaseIcon from '@tabler/icons-svelte/icons/database';
	import FileDescriptionIcon from '@tabler/icons-svelte/icons/file-description';
	import FolderIcon from '@tabler/icons-svelte/icons/folder';
	import HelpIcon from '@tabler/icons-svelte/icons/help';
	import InnerShadowTopIcon from '@tabler/icons-svelte/icons/inner-shadow-top';
	import ReportIcon from '@tabler/icons-svelte/icons/report';
	import SearchIcon from '@tabler/icons-svelte/icons/search';
	import SettingsIcon from '@tabler/icons-svelte/icons/settings';
	import UsersIcon from '@tabler/icons-svelte/icons/users';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import NavDocuments from './nav-documents.svelte';
	import NavMain from './nav-main.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import NavUser from './nav-user.svelte';
	import type { ComponentProps } from 'svelte';
	import { authClient } from '$lib/auth-client';

	let session = authClient.useSession();
	const data = {
		navMain: [
			{
				title: 'Dashboard',
				url: '/dashboard',
				icon: DashboardIcon
			},
			{
				title: 'Quotes',
				url: '/quotes',
				icon: FileDescriptionIcon
			},
			{
				title: 'Simulations',
				url: '/simulations',
				icon: ChartBarIcon
			},
			{
				title: 'Products',
				url: '/products',
				icon: DatabaseIcon
			},
			{
				title: 'Clients',
				url: '/clients',
				icon: UsersIcon
			}
		],
		navClouds: [
			{
				title: 'Quotes',
				icon: FileDescriptionIcon,
				isActive: true,
				url: '/quotes',
				items: [
					{
						title: 'Draft Quotes',
						url: '/quotes/draft'
					},
					{
						title: 'Sent Quotes',
						url: '/quotes/sent'
					},
					{
						title: 'Archived',
						url: '/quotes/archived'
					}
				]
			},
			{
				title: 'Products',
				icon: FolderIcon,
				url: '/products',
				items: [
					{
						title: 'Item Categories',
						url: '/products/categories'
					},
					{
						title: 'Custom Schemas',
						url: '/products/schemas'
					}
				]
			},
			{
				title: 'Simulations',
				icon: ChartBarIcon,
				url: '/simulations',
				items: [
					{
						title: 'Active Runs',
						url: '/simulations/active'
					},
					{
						title: 'Saved Results',
						url: '/simulations/saved'
					}
				]
			}
		],
		navSecondary: [
			{
				title: 'Settings',
				url: '/settings',
				icon: SettingsIcon
			},
			{
				title: 'Get Help',
				url: '/help',
				icon: HelpIcon
			},
			{
				title: 'Search',
				url: '/search',
				icon: SearchIcon
			}
		],
		documents: [
			{
				name: 'Quote PDFs',
				url: '/documents/quote-pdfs',
				icon: FileDescriptionIcon
			},
			{
				name: 'Reports',
				url: '/documents/reports',
				icon: ReportIcon
			},
			{
				name: 'Tenant Config',
				url: '/documents/tenant-config',
				icon: DatabaseIcon
			}
		]
	};

	let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
					{#snippet child({ props })}
						<a href="##" {...props}>
							<InnerShadowTopIcon class="!size-5" />
							<span class="text-base font-semibold">Quotr.</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavDocuments items={data.documents} />
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		{#if $session.isPending}
			<div class="flex items-center gap-2 px-2 py-1.5">
				<div class="size-8 animate-pulse rounded-full bg-muted"></div>
				<div class="flex flex-col gap-1">
					<div class="h-3 w-24 animate-pulse rounded bg-muted"></div>
					<div class="h-2.5 w-32 animate-pulse rounded bg-muted"></div>
				</div>
			</div>
		{:else if $session.data?.user}
			<NavUser
				user={{
					name: $session.data.user.name,
					email: $session.data.user.email,
					avatar: $session.data.user.image || ''
				}}
			/>
		{/if}
	</Sidebar.Footer>
</Sidebar.Root>
