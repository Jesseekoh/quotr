<script lang="ts">
	import Button from '../ui/button/button.svelte';
	import Label from '../ui/label/label.svelte';
	import Textarea from '../ui/textarea/textarea.svelte';
	import Modal from './Modal.svelte';

	let {
		onClose,
		onSubmit
	}: {
		onClose: () => void;
		onSubmit: (payload: { name: string; description?: string }) => void;
	} = $props();

	let name = $state('');
	let description = $state('');

	function submit(e: Event) {
		e.preventDefault();
		if (!name.trim()) return;
		onSubmit({ name: name.trim(), description: description.trim() || undefined });
	}
</script>

<Modal title="Add option" {onClose}>
	<form onsubmit={submit}>
		<Label class="field">
			<span>Name</span>
			<input bind:value={name} placeholder="e.g. Battery Option E" required />
		</Label>

		<Label class="field">
			<span>Description (optional)</span>
			<Textarea bind:value={description} rows={2} placeholder="e.g. 32.14KWh - 48VDC"></Textarea>
		</Label>

		<div class="actions">
			<Button type="button" class="btn-secondary" onclick={onClose}>Cancel</Button>
			<button type="submit" class="btn-primary">Add option</button>
		</div>
	</form>
</Modal>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: var(--text-sm);
	}

	input,
	textarea {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-family: inherit;
	}

	textarea {
		resize: vertical;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}
</style>
