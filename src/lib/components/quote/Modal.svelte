<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		onClose,
		wide = false,
		children
	}: {
		title: string;
		onClose: () => void;
		wide?: boolean;
		children: Snippet;
	} = $props();

	function handleBackdropKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={handleBackdropKeydown} />

<div class="backdrop" onclick={onClose} role="presentation">
	<div
		class="modal"
		class:wide
		onclick={(e) => e.stopPropagation()}
		role="dialog"
		aria-modal="true"
		aria-label={title}
	>
		<div class="modal-head">
			<h2>{title}</h2>
			<button type="button" class="close" onclick={onClose} aria-label="Close">×</button>
		</div>
		{@render children()}
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(32, 31, 28, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-4);
		z-index: 50;
	}

	.modal {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		padding: var(--space-5);
		width: 100%;
		max-width: 28rem;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal.wide {
		max-width: 40rem;
	}

	.modal-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-4);
	}

	.modal-head h2 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0;
	}

	.close {
		background: none;
		border: none;
		font-size: var(--text-lg);
		line-height: 1;
		cursor: pointer;
		color: var(--color-text-muted);
		padding: var(--space-1);
	}
</style>
