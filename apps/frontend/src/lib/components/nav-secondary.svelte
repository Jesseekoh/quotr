<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/state';
	import type { WithoutChildren } from '$lib/utils.js';
	import type { Icon } from '@tabler/icons-svelte';
	import type { ComponentProps } from 'svelte';
	import { resolve } from '$app/paths';

	let {
		items,
		...restProps
	}: { items: { title: string; url: string; icon: Icon }[] } & WithoutChildren<
		ComponentProps<typeof Sidebar.Group>
	> = $props();
</script>

<Sidebar.Group {...restProps}>
	<Sidebar.GroupContent>
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
								<item.icon />
								<span>{item.title}</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
