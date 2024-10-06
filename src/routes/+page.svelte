<script lang="ts">
	import { PlusCircle, Link, ArrowRight, Eraser } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input';
	import Select from '$lib/Select.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import data from './data';
	import { toast } from 'svelte-sonner';
	import Combobox from '$lib/Combobox.svelte';
	import GraphChart from './GraphSVG.svelte';
	import type { NodeType, Node } from './types';
	import Separator from '$lib/Separator.svelte';
	import NodeEditor from './NodeEditor.svelte';
	import { NODE_TYPES } from './types.js';

	let nodes = $state<Record<string, Node>>({});
	let nodeOptions = $derived<string[]>(Object.keys(nodes));

	let selectedNode = $state<Node | null>(null);
	let newNodeId = $state<string>('');
	let newNodeType = $state<NodeType>(NODE_TYPES[0]);
	let newEdge = $state({ from: '', to: '' });

	function addNode(): void {
		if (newNodeId && !nodes.hasOwnProperty(newNodeId)) {
			nodes[newNodeId] = { id: newNodeId, data: { type: newNodeType, tags: {} }, children: [] };
			newNodeId = '';
			toast.success('Node added successfully.');
		} else if (!newNodeId) {
			toast.error('Failed to add node: Node ID cannot be empty.');
		} else {
			toast.error(`Failed to add node: A node with ID "${newNodeId}" already exists.`);
		}
	}

	function hasCycle(start: string, end: string): boolean {
		const visited = new Set<string>();
		const stack = [end];

		while (stack.length > 0) {
			const current = stack.pop()!;
			if (current === start) return true;
			if (!visited.has(current)) {
				visited.add(current);
				stack.push(...(nodes[current]?.children || []));
			}
		}

		return false;
	}

	function addEdge(): void {
		if (newEdge.from && newEdge.to && newEdge.from !== newEdge.to) {
			const fromNode = nodes[newEdge.from];
			const toNode = nodes[newEdge.to];
			if (fromNode && toNode && !fromNode.children.includes(toNode.id)) {
				if (hasCycle(newEdge.from, newEdge.to)) {
					toast.error('Adding this edge would create a cycle, which is not allowed.');
				} else {
					fromNode.children.push(toNode.id);
					newEdge = { from: '', to: '' };
					toast.success('Edge added successfully.');
				}
			} else {
				toast.error("This edge already exists or nodes don't exist!");
			}
		} else {
			toast.error("Please select different nodes for 'from' and 'to'.");
		}
	}

	// function removeNode(nodeId: string): void {
	// 	const nodeToRemove = nodes[nodeId];
	// 	if (nodeToRemove) {
	// 		delete nodes[nodeId];
	// 		// Remove edges pointing to this node
	// 		for (let node of Object.values(nodes)) {
	// 			node.children = node.children.filter((child) => child !== nodeToRemove.id);
	// 		}
	// 	}
	// }
	//
	// function removeEdge(from: string, to: string): void {
	// 	const fromNode = nodes[from];
	// 	if (fromNode) {
	// 		fromNode.children = fromNode.children.filter((child) => child !== to);
	// 	}
	// }
	//
	// function getParentNodes(nodeId: string): string[] {
	// 	return Object.values(nodes)
	// 		.filter((node) => node.children.includes(nodeId))
	// 		.map((node) => node.id);
	// }
	//
	// function getChildNodes(nodeId: string): string[] {
	// 	const node = nodes[nodeId];
	// 	return node ? [...node.children] : [];
	// }

	let graphData = $derived({
		nodes: Object.values(nodes).map((node) => ({ id: node.id, ref: node })),
		edges: Object.values(nodes).flatMap((node) =>
			node.children.map((child) => ({ source: node.id, target: child }))
		)
	});

	function loadSampleData() {
		nodes = data;
	}

	function clear() {
		nodes = {};
	}

	let editOpen = $state(false);
</script>

<NodeEditor bind:node={selectedNode} bind:open={editOpen} onSuccess={() => toast.success(`Node ${selectedNode?.id} has been updated.`)}></NodeEditor>
<div class="flex space-x-4">
	<Card.Root class="w-[300px] shadow-lg">
		<Card.Header>
			<Card.Title>Edit Graph Structure</Card.Title>
			<Card.Description>Create and manage nodes and edges for your graph.</Card.Description>
			<Button variant="outline" onclick={loadSampleData}>Load Sample Graph</Button>
		</Card.Header>
		<Separator />
		<Card.Content class="pt-0">
			<h3 class="mb-2 text-lg font-semibold">Nodes</h3>
			<div class="grid w-full items-center gap-4">
				<div class="flex flex-col space-y-1.5">
					<Label for="nodeID">Node ID</Label>
					<Input placeholder="A, B, C, D" bind:value={newNodeId} />
				</div>
				<div class="flex flex-col space-y-1.5">
					<Label for="nodeType">Node Type</Label>
					<Select
						bind:value={newNodeType}
						placeholder="Choose a type"
						items={NODE_TYPES}
						label="types"
					/>
				</div>
				<Button on:click={addNode} class="w-full">
					<PlusCircle class="mr-2 h-4 w-4" /> Add Node
				</Button>
			</div>
			<div class="mt-4">
				<h3 class="mb-2 text-lg font-semibold">Edges</h3>
				<div class="mb-2 flex w-full flex-row items-center space-x-2">
					<Combobox
						bind:value={newEdge.from}
						options={nodeOptions}
						placeholder="source"
						searchPlaceholder="Search nodes..."
					/>
					<ArrowRight class="h-12 w-12"></ArrowRight>
					<Combobox
						bind:value={newEdge.to}
						options={nodeOptions}
						placeholder="target"
						searchPlaceholder="Search nodes..."
					/>
				</div>
				<Button on:click={addEdge} class="w-full">
					<Link class="mr-2 h-4 w-4" /> Add Edge
				</Button>
			</div>
		</Card.Content>
		<Card.Footer>
			<Button variant="outline" class="w-full" onclick={clear}>
				<Eraser class="mr-2 h-4 w-4"></Eraser>
				Clear
			</Button>
		</Card.Footer>
	</Card.Root>

	<div class="max-h-[600px] grow overflow-hidden rounded-lg border shadow-lg">
		<GraphChart
			graph={graphData}
			nodeOnClick={(id) => {
				editOpen = true;
				selectedNode = nodes[id];
			}}
		></GraphChart>
	</div>
</div>
