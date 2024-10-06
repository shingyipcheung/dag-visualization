<script lang="ts">
	import { tick } from 'svelte';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	type Option = string | { value: string; label: string };

	let {
		value = $bindable(),
		placeholder = 'Select an option...',
		options = [],
		searchPlaceholder = 'Search options...',
		otherClasses,
		emptyPlaceholder = 'No option found.'
	} = $props<{
		value: string;
		placeholder?: string;
		options: Option[];
		searchPlaceholder?: string;
		otherClasses?: string;
		emptyPlaceholder?: string;
	}>();

	let open = $state(false);
	let search = $state('');

	function isObjectOption(option: Option): option is { value: string; label: string } {
		return typeof option === 'object' && option !== null && 'value' in option && 'label' in option;
	}

	function getOptionLabel(option: Option): string {
		return isObjectOption(option) ? option.label : option;
	}

	function getOptionValue(option: Option): string {
		return isObjectOption(option) ? option.value : option;
	}

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={open}
			class={cn(
				'w-full justify-between px-3',
				otherClasses,
				open && 'outline-none ring-2 ring-ring ring-offset-2'
			)}
		>
			{value || placeholder}
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0" sideOffset={8}>
		<Command.Root>
			<Command.Input placeholder={searchPlaceholder} bind:value={search} />
			<Command.Empty>{emptyPlaceholder}</Command.Empty>
			{#key search}
				<Command.Group class="max-h-[200px] overflow-y-auto overscroll-contain">
					{#each options as option}
						<Command.Item
							value={getOptionValue(option)}
							onSelect={(currentValue) => {
								value = currentValue;
								closeAndFocusTrigger(ids.trigger);
							}}
						>
							<Check
								class={cn('mr-2 h-4 w-4', value !== getOptionValue(option) && 'text-transparent')}
							/>
							{getOptionLabel(option)}
						</Command.Item>
					{/each}
				</Command.Group>
			{/key}
		</Command.Root>
	</Popover.Content>
</Popover.Root>
