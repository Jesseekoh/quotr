<script lang="ts">
	import TrendingDownIcon from '@tabler/icons-svelte/icons/trending-down';
	import TrendingUpIcon from '@tabler/icons-svelte/icons/trending-up';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
</script>

<div
	class="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card"
>
	<Card.Root class="@container/card">
		<Card.Header>
			<Card.Description>Quoted Value This Month</Card.Description>
			<Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
				₦84,320
			</Card.Title>
			<Card.Action>
				<Badge variant="outline">
					<TrendingUpIcon />
					+18.2%
				</Badge>
			</Card.Action>
		</Card.Header>
		<Card.Footer class="flex-col items-start gap-1.5 text-sm">
			<div class="line-clamp-1 flex gap-2 font-medium">
				Trending up this month <TrendingUpIcon class="size-4" />
			</div>
			<div class="text-muted-foreground">Total value across all quotes sent</div>
		</Card.Footer>
	</Card.Root>
	<Card.Root class="@container/card">
		<Card.Header>
			<Card.Description>Conversion Rate</Card.Description>
			<Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
				32.4%
			</Card.Title>
			<Card.Action>
				<Badge variant="outline">
					<TrendingDownIcon />
					-4.1%
				</Badge>
			</Card.Action>
		</Card.Header>
		<Card.Footer class="flex-col items-start gap-1.5 text-sm">
			<div class="line-clamp-1 flex gap-2 font-medium">
				Down 4.1% this period <TrendingDownIcon class="size-4" />
			</div>
			<div class="text-muted-foreground">Sent quotes accepted by clients</div>
		</Card.Footer>
	</Card.Root>
	<Card.Root class="@container/card">
		<Card.Header>
			<Card.Description>Pending Quotes</Card.Description>
			<Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">27</Card.Title>
			<Card.Action>
				<Badge variant="outline">
					<TrendingUpIcon />
					+6
				</Badge>
			</Card.Action>
		</Card.Header>
		<Card.Footer class="flex-col items-start gap-1.5 text-sm">
			<div class="line-clamp-1 flex gap-2 font-medium">
				Awaiting client response <TrendingUpIcon class="size-4" />
			</div>
			<div class="text-muted-foreground">Sent but not yet accepted or rejected</div>
		</Card.Footer>
	</Card.Root>
	<Card.Root class="@container/card">
		<Card.Header>
			<Card.Description>Avg. Time to Quote</Card.Description>
			<Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
				1.8 days
			</Card.Title>
			<Card.Action>
				<Badge variant="outline">
					<TrendingDownIcon />
					-0.4d
				</Badge>
			</Card.Action>
		</Card.Header>
		<Card.Footer class="flex-col items-start gap-1.5 text-sm">
			<div class="line-clamp-1 flex gap-2 font-medium">
				Faster turnaround <TrendingDownIcon class="size-4" />
			</div>
			<div class="text-muted-foreground">From request to quote sent</div>
		</Card.Footer>
	</Card.Root>
</div>
