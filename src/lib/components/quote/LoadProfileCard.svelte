<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	let {
		loadProfileTotal,
		loadProfileNotes,
		onSave,
		disabled = false
	}: {
		loadProfileTotal: string | null;
		loadProfileNotes: string | null;
		onSave: (payload: { loadProfileTotal: number | null; loadProfileNotes: string }) => void;
		disabled?: boolean;
	} = $props();

	let total = $state(loadProfileTotal !== null ? Number(loadProfileTotal) : null);
	let notes = $state(loadProfileNotes ?? '');
	let dirty = $state(false);

	function markDirty() {
		dirty = true;
	}

	function save(e: Event) {
		e.preventDefault();
		onSave({ loadProfileTotal: total, loadProfileNotes: notes });
		dirty = false;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Load profile</Card.Title>
		<Card.Description
			>Total value of all appliances/load the customer wants to power.</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<form class="flex flex-wrap items-end gap-4" onsubmit={save}>
			<Label class="flex flex-col gap-2">
				<span>Total load</span>
				<Input
					type="number"
					min="0"
					step="any"
					bind:value={total}
					oninput={markDirty}
					{disabled}
					placeholder="e.g. 5580"
				/>
			</Label>

			<Label class="flex min-w-64 flex-1 flex-col gap-2">
				<span>Notes</span>
				<Textarea
					bind:value={notes}
					oninput={markDirty}
					rows={2}
					{disabled}
					placeholder="e.g. Fridge, TVs, lights, sockets, pumping machine"
				></Textarea>
			</Label>

			{#if dirty}
				<Button type="submit" {disabled}>Save load profile</Button>
			{/if}
		</form>
	</Card.Content>
</Card.Root>
