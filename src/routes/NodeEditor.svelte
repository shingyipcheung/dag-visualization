<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { untrack } from 'svelte';
	import { type Node, NODE_TYPES } from './types';
	import Select from '$lib/Select.svelte';
	import Separator from '$lib/Separator.svelte';
	import { CircleMinus, CirclePlus } from 'lucide-svelte';

	let {
		open = $bindable(false),
		node = $bindable(null),
		onSuccess = () => {},
		onError = () => {}
	}: {
		open: boolean;
		node: Node | null;
		onSuccess?: Function;
		onError?: Function;
	} = $props();

	$effect(() => {
		if (!open) {
			untrack(() => {
				node = null;
			});
		}
	});

	let editedNode: Node | null = $state(null);
	let newTagKey = $state('');
	let newTagValue = $state('');

	$effect(() => {
		if (node) {
			editedNode = JSON.parse(JSON.stringify(node));
		} else {
			editedNode = null;
		}
	});

	function addTag() {
		if (editedNode && newTagKey && newTagValue) {
			if (editedNode.tags[newTagKey]) {
				alert('A tag with this key already exists!');
				return;
			}
			editedNode.tags[newTagKey] = newTagValue;
			newTagKey = '';
			newTagValue = '';
			editedNode = { ...editedNode }; // Trigger reactivity
		}
	}

	function removeTag(key: string) {
		if (editedNode) {
			delete editedNode.tags[key];
			editedNode = { ...editedNode }; // Trigger reactivity
		}
	}

	function saveChanges() {
		if (editedNode && node) {
			try {
				// Update the contents of the original node
				Object.assign(node, editedNode);
				onSuccess();
				open = false;
			} catch (error) {
				onError(error);
			}
		}
	}
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger asChild let:builder></Sheet.Trigger>
	<Sheet.Content side="right" class="w-full sm:max-w-md">
		<Sheet.Header>
			<Sheet.Title>Edit Node</Sheet.Title>
			<Sheet.Description>Make changes to nodes.</Sheet.Description>
		</Sheet.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="id" class="text-right">ID</Label>
				<Input id="id" value={editedNode?.id} class="col-span-3" disabled />
			</div>

			{#if editedNode && editedNode.type}
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="nodeType" class="text-right">Node Type</Label>
					<Select
						bind:value={editedNode.type}
						placeholder="Choose a type"
						items={NODE_TYPES}
						label="types"
						class="col-span-3"
					/>
				</div>
			{/if}
			<Separator></Separator>
			{#if editedNode && editedNode.tags}
				<h3>Tags</h3>
				{#each Object.entries(editedNode.tags) as [key, value]}
					<div class="grid grid-cols-5 items-center gap-4">
						<Label for={`tag-${key}`} class="col-span-2 text-right">{key}</Label>
						<Input id={`tag-${key}`} bind:value={editedNode.tags[key]} class="col-span-2" />
						<Button on:click={() => removeTag(key)} variant="ghost"
							><CircleMinus class="h-4 w-4"></CircleMinus></Button
						>
					</div>
				{/each}
				<div class="grid grid-cols-5 items-center gap-4">
					<Input placeholder="New tag key" bind:value={newTagKey} class="col-span-2" />
					<Input placeholder="New tag value" bind:value={newTagValue} class="col-span-2" />
					<Button on:click={addTag} variant="ghost"
						><CirclePlus class="h-4 w-4">></CirclePlus></Button
					>
				</div>
			{/if}
		</div>
		<Sheet.Footer>
			<Sheet.Close asChild let:builder>
				<Button builders={[builder]} type="submit" on:click={saveChanges}>Save changes</Button>
			</Sheet.Close>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
