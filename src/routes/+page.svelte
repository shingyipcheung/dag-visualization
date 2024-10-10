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
	import GraphSVG from './GraphSVG.svelte';
	import type { NodeType, Node } from './types';
	import Separator from '$lib/Separator.svelte';
	import NodeEditor from './NodeEditor.svelte';
	import { Graph } from './graph.svelte.js';
	import { NODE_TYPES } from './types.js';

	let graph = $state(new Graph({}));

	let nodeData: Record<string, any> = $state({});

	let selectedNode = $state<Node | null>(null);
	let newNodeId = $state<string>('');
	let newNodeType = $state<NodeType>(NODE_TYPES[0]);
	let newEdge = $state({ source: '', target: '' });

	function addNode(): void {
		try {
			if (newNodeId) {
				graph.addNode(newNodeId);
				nodeData[newNodeId] = { id: newNodeId, type: newNodeType, tags: {} };
				toast.success(`Node ${newNodeId} added successfully.`);
			} else {
				toast.error('Failed to add node: Node ID cannot be empty.');
			}
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			}
		}
	}

	function addEdge(): void {
		try {
			if (newEdge.source && newEdge.target && newEdge.source !== newEdge.target) {
				if (graph.hasCycle(newEdge.source, newEdge.target)) {
					toast.error('Adding this edge would create a cycle, which is not allowed.');
				} else {
					graph.addEdge(newEdge.source, newEdge.target);
					newEdge = { source: '', target: '' };
					toast.success('Edge added successfully.');
				}
			} else {
				toast.error("Please select different nodes for 'from' and 'to'.");
			}
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message);
			}
		}
	}

	function loadSampleData() {
		graph = new Graph(data.graph);
		nodeData = data.nodeData;
	}

	function clear() {
		graph.clear();
		nodeData = {};
	}

	let editOpen = $state(false);
</script>

<NodeEditor
	bind:node={selectedNode}
	bind:open={editOpen}
	onSuccess={() => toast.success(`Node ${selectedNode?.id} has been updated.`)}
></NodeEditor>

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
					<PlusCircle class="mr-2 h-4 w-4" />
					Add Node
				</Button>
			</div>
			<div class="mt-4">
				<h3 class="mb-2 text-lg font-semibold">Edges</h3>
				<div class="mb-2 flex w-full flex-row items-center space-x-2">
					<Combobox
						bind:value={newEdge.source}
						options={graph.nodes}
						placeholder="source"
						searchPlaceholder="Search nodes..."
					/>
					<ArrowRight class="h-12 w-12"></ArrowRight>
					<Combobox
						bind:value={newEdge.target}
						options={graph.nodes}
						placeholder="target"
						searchPlaceholder="Search nodes..."
					/>
				</div>
				<Button on:click={addEdge} class="w-full">
					<Link class="mr-2 h-4 w-4" />
					Add Edge
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

	<GraphSVG
		graph={graph.graphData}
		nodeOnClick={(id) => {
			editOpen = true;
			selectedNode = nodeData[id];
		}}
	></GraphSVG>
</div>
