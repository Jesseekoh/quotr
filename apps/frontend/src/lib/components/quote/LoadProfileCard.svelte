<script lang="ts">
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

<section class="card">
	<div class="card-header">
		<h2>Load profile</h2>
		<p class="hint">Total value of all appliances/load the customer wants to power.</p>
	</div>

	<form class="row" onsubmit={save}>
		<label class="field">
			<span>Total load</span>
			<input
				type="number"
				min="0"
				step="any"
				bind:value={total}
				oninput={markDirty}
				{disabled}
				placeholder="e.g. 5580"
			/>
		</label>

		<label class="field grow">
			<span>Notes</span>
			<textarea
				bind:value={notes}
				oninput={markDirty}
				rows="2"
				{disabled}
				placeholder="e.g. Fridge, TVs, lights, sockets, pumping machine"
			></textarea>
		</label>

		{#if dirty}
			<button type="submit" class="btn-primary" {disabled}>Save load profile</button>
		{/if}
	</form>
</section>

<style>
	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
	}

	.card-header h2 {
		font-size: var(--text-base);
		font-weight: 600;
		margin: 0;
	}

	.hint {
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		margin: var(--space-1) 0 var(--space-3);
	}

	.row {
		display: flex;
		align-items: flex-end;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: var(--text-sm);
	}

	.field.grow {
		flex: 1;
		min-width: 16rem;
	}

	input,
	textarea {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-family: inherit;
	}

	input {
		width: 10rem;
	}

	textarea {
		resize: vertical;
	}
</style>
