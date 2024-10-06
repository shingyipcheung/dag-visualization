<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';

	interface Item {
		value: string;
		label: string;
	}

	let {
		items,
		placeholder = 'Select an item',
		label = 'Items',
		value = $bindable(''),
		class: className = 'w-full'
	} : {
		items: (string | Item)[];
		placeholder?: string;
		label?: string;
		value?: string;
		class?: string;
	} = $props();

	let selected = $derived(typeof value === 'string' ? { value: value, label: value } : value);

	const normalizedItems: Item[] = $derived(
		items.map((item) => (typeof item === 'string' ? { value: item, label: item } : item))
	);
</script>

<Select.Root
	{selected}
	onSelectedChange={(v) => {
		v && (value = v.value);
	}}
>
	<Select.Trigger class={className}>
		<Select.Value {placeholder} />
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			<Select.Label>{label}</Select.Label>
			{#each normalizedItems as item}
				<Select.Item value={item.value}>
					{item.label}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
	<!--	<input hidden bind:value />-->
</Select.Root>
