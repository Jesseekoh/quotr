<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { toast } from 'svelte-sonner';

	const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

	type Props = {
		onCreated: () => void;
	};
	let { onCreated }: Props = $props();

	let isLoading = $state(false);

	const CATEGORIES = [
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

	let selectedCategory = $state('');
	let categoryLabel = $derived(
		CATEGORIES.find((c) => c.value === selectedCategory)?.label ?? 'Select a category'
	);

	async function handleSubmit(e: Event & { currentTarget: HTMLFormElement }) {
		e.preventDefault();
		isLoading = true;
		const form = e.currentTarget;
		const fd = new FormData(form);

		const payload = {
			name: fd.get('name')?.toString() ?? '',
			brand: fd.get('brand')?.toString() ?? '',
			category: fd.get('category')?.toString() ?? '',
			specification: fd.get('specification')?.toString() ?? '',
			warranty: fd.get('Warranty')?.toString() ?? '',
			unit: fd.get('unit')?.toString() || undefined,
			costPrice: Number(fd.get('costPrice') ?? 0),
			enduserPrice: Number(fd.get('enduserPrice') ?? 0),
			discountPrice: Number(fd.get('discountPrice') ?? 0),
			resalePrice: Number(fd.get('resalePrice') ?? 0),
			specialPrice: Number(fd.get('specialPrice') ?? 0)
		};

		try {
			const res = await fetch(`${API_BASE}/products`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				toast.error(err?.message ?? 'Failed to create product');
				return;
			}
			toast.success('Product created');
			form.reset();
			selectedCategory = '';
			onCreated();
		} catch {
			toast.error('Failed to create product');
		} finally {
			isLoading = false;
		}
	}
</script>

<form class="space-y-4" onsubmit={handleSubmit}>
	<div class="grid grid-cols-2 gap-4">
		<div class="space-y-2">
			<Label for="cp-name">Name</Label>
			<Input id="cp-name" name="name" placeholder="e.g. HiS-FB54 550W" required />
		</div>
		<div class="space-y-2">
			<Label for="cp-brand">Brand</Label>
			<Input id="cp-brand" name="brand" placeholder="e.g. Canadian Solar" required />
		</div>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div class="space-y-2">
			<Label>Category</Label>
			<Select.Root type="single" name="category" bind:value={selectedCategory}>
				<Select.Trigger class="w-full">
					{categoryLabel}
				</Select.Trigger>
				<Select.Content>
					{#each CATEGORIES as cat (cat.value)}
						<Select.Item value={cat.value}>{cat.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div class="space-y-2">
			<Label for="cp-unit">Unit</Label>
			<Input id="cp-unit" name="unit" placeholder="e.g. pcs, metres (optional)" />
		</div>
	</div>

	<div class="space-y-2">
		<Label for="cp-specification">Specification</Label>
		<Textarea
			id="cp-specification"
			name="specification"
			placeholder="e.g. 550W Mono PERC, Vmp 38.4V, Imp 14.33A"
			rows={2}
			required
		/>
	</div>

	<div class="space-y-2">
		<Label for="cp-warranty">Warranty</Label>
		<Input id="cp-warranty" name="warranty" placeholder="e.g. 2 Years" />
	</div>
	<div class="space-y-2">
		<Label class="text-sm font-medium">Pricing (₦)</Label>
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
			<div class="space-y-1">
				<Label for="cp-cost" class="text-xs text-muted-foreground">Cost</Label>
				<Input
					id="cp-cost"
					name="costPrice"
					type="number"
					placeholder="0.00"
					step="0.01"
					min="0"
					required
				/>
			</div>
			<div class="space-y-1">
				<Label for="cp-enduser" class="text-xs text-muted-foreground">End User</Label>
				<Input
					id="cp-enduser"
					name="enduserPrice"
					type="number"
					placeholder="0.00"
					step="0.01"
					min="0"
					required
				/>
			</div>
			<div class="space-y-1">
				<Label for="cp-discount" class="text-xs text-muted-foreground">Discount</Label>
				<Input
					id="cp-discount"
					name="discountPrice"
					type="number"
					placeholder="0.00"
					step="0.01"
					min="0"
					required
				/>
			</div>
			<div class="space-y-1">
				<Label for="cp-resale" class="text-xs text-muted-foreground">Resale</Label>
				<Input
					id="cp-resale"
					name="resalePrice"
					type="number"
					placeholder="0.00"
					step="0.01"
					min="0"
					required
				/>
			</div>
			<div class="space-y-1">
				<Label for="cp-special" class="text-xs text-muted-foreground">Special</Label>
				<Input
					id="cp-special"
					name="specialPrice"
					type="number"
					placeholder="0.00"
					step="0.01"
					min="0"
					required
				/>
			</div>
		</div>
	</div>

	<Button type="submit" class="w-full" disabled={isLoading}>
		{isLoading ? 'Creating…' : 'Create Product'}
	</Button>
</form>
