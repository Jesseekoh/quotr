<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	// import { Button } from '$lib/components/ui/button/index.js';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { RouteId } from '$app/types';
	import type { Icon } from '@tabler/icons-svelte';
	let { items }: { items: { title: string; url: RouteId; icon?: Icon }[] } = $props();
</script>

<Sidebar.Group>
	<Sidebar.GroupContent class="flex flex-col gap-2">
		<!-- <Sidebar.Menu>
			<Sidebar.MenuItem class="flex items-center gap-2">
				<Sidebar.MenuButton
					class="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
					tooltipContent="Quick create"
				>
					<CirclePlusFilledIcon />
					<span>Quick Create</span>
				</Sidebar.MenuButton>
				
			</Sidebar.MenuItem>
		</Sidebar.Menu> -->
		<Sidebar.Menu>
			{#each items as item (item.title)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton
						class="h-10 p-3 data-[active=true]:bg-primary data-[active=true]:font-semibold data-[active=true]:text-primary-foreground data-[active=true]:hover:bg-primary/90"
						tooltipContent={item.title}
						isActive={page.url.pathname === item.url}
					>
						{#snippet child({ props })}
							<a href={resolve(item.url)} {...props}>
								{#if item.icon}
									<item.icon />
								{/if}
								<span>{item.title}</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
