<script lang="ts">
	import { untrack, tick } from 'svelte';

	import dagre from 'dagre';
	import type { GraphLabel, Node, GraphEdge } from 'dagre';

	import * as d3 from 'd3';
	import { draw } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Fullscreen } from 'lucide-svelte';

	type Direction = 'TB' | 'BT' | 'LR' | 'RL';

	import type { GraphData } from './types';

	interface EdgeData extends GraphEdge {
		source: string;
		target: string;
		style?: Record<string, any>;
	}

	interface NodeData extends Node {
		id: string;
		style?: Record<string, any>;
	}

	let {
		graph = { nodes: [], edges: [] },
		direction = 'LR',
		nodeOnClick = (_) => {}
	}: {
		graph?: GraphData;
		direction?: Direction;
		nodeOnClick?: (id: string) => void;
	} = $props();

	let nodes: NodeData[] = $state([]);
	let edges: EdgeData[] = $state([]);
	let svgWidth = $state(0);
	let svgHeight = $state(0);

	let nodeDOMs: Record<string, SVGGElement> = $state({});
	let edgeDOMs: Record<string, SVGPathElement> = $state({});
	// canvas
	let svgElement: SVGSVGElement | null = $state(null);
	let zoomGroup: SVGGElement | null = $state(null);
	let zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;

	let parentsCache: Record<string, string[]> = {};

	$effect(() => {
		graph;
		direction;
		untrack(async () => {
			try {
				updateGraph(graph, direction);
				buildParentsCache();
				await tick();
				resetZoom();
			} catch (error) {
				console.error(error);
			}
		});
	});

	const isEmpty = $derived(graph.nodes.length === 0);

	function updateGraph(graph: GraphData, direction: Direction): void {
		if (graph.nodes && graph.nodes.length === 0) {
			return;
		}
		const g = new dagre.graphlib.Graph();
		g.setGraph({
			rankdir: direction,
			nodesep: 50,
			ranksep: 70,
			marginx: 50,
			marginy: 50
		});
		g.setDefaultEdgeLabel(() => ({}));

		// Add nodes
		graph.nodes.forEach((node) => {
			g.setNode(node.id, {
				label: node.id,
				width: 60,
				height: 40,
				style: {}
			});
		});

		// Add edges
		graph.edges.forEach((edge) => {
			g.setEdge(edge.source, edge.target, {});
		});

		dagre.layout(g);

		// Update nodes and edges arrays
		nodes = g.nodes().map((n) => {
			const node = g.node(n);
			return {
				...node,
				id: n,
				x: node.x,
				y: node.y
			};
		});

		edges = g.edges().map((e) => {
			const edge = g.edge(e);
			return {
				...edge,
				source: e.v,
				target: e.w,
				points: edge.points || []
			};
		});

		// Update SVG size
		const graphBounds: GraphLabel = g.graph();
		if (svgElement && svgElement.parentElement) {
			svgWidth = Math.max(svgElement.parentElement.clientWidth, graphBounds.width ?? 0);
			svgHeight = Math.max(svgElement.parentElement.clientHeight, graphBounds.height ?? 0);
		}
		initializeZoom();
	}

	function initializeZoom(): void {
		if (!svgElement) return;
		const svg = d3.select(svgElement);
		zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.5, 3])
			.on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
				if (zoomGroup) {
					d3.select(zoomGroup).attr('transform', event.transform.toString());
				}
			});

		svg.call(zoom);
	}

	function resetZoom(): void {
		if (!svgElement || !zoomGroup || nodes.length === 0) return;
		const svg = d3.select(svgElement);
		const bounds = zoomGroup.getBBox();
		const fullWidth = svgElement.parentElement?.clientWidth || 0;
		const fullHeight = svgElement.parentElement?.clientHeight || 0;
		const width = bounds.width;
		const height = bounds.height;
		const midX = bounds.x + width / 2;
		const midY = bounds.y + height / 2;

		if (width === 0 || height === 0) return;

		let scale = 0.95 / Math.max(width / fullWidth, height / fullHeight);
		scale = Math.min(1, scale);
		const translate: [number, number] = [
			fullWidth / 2 - scale * midX,
			fullHeight / 2 - scale * midY
		];

		svg
			.transition()
			.duration(750)
			.call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
	}

	const curveFunc = d3
		.line<{ x: number; y: number }>()
		.x((d) => d.x)
		.y((d) => d.y)
		.curve(d3.curveBasis);

	function buildParentsCache(): void {
		parentsCache = {};
		edges.forEach((edge) => {
			if (!parentsCache[edge.target]) {
				parentsCache[edge.target] = [];
			}
			parentsCache[edge.target].push(edge.source);
		});
	}

	function getUpstreamNodes(id: string): Set<string> {
		const upstreamNodes = new Set<string>([id]);
		const stack = [id];

		while (stack.length > 0) {
			const currentNode = stack.pop()!;
			const parents = parentsCache[currentNode] || [];
			for (const parent of parents) {
				if (!upstreamNodes.has(parent)) {
					upstreamNodes.add(parent);
					stack.push(parent);
				}
			}
		}

		return upstreamNodes;
	}

	function onHover(id: string) {
		const upstreamNodes = getUpstreamNodes(id);

		nodes.forEach((node) => {
			const element = nodeDOMs[node.id];
			if (element) {
				if (upstreamNodes.has(node.id)) {
					element.style.opacity = '1';
					element.children[0].classList.add('scale-[1.05]');
				} else {
					element.style.opacity = '0.3';
					element.children[0].classList.remove('scale-[1.05]');
				}
			}
		});

		edges.forEach((edge) => {
			const edgeId = `${edge.source}-${edge.target}`;
			const element = edgeDOMs[edgeId];
			if (element) {
				if (upstreamNodes.has(edge.source) && upstreamNodes.has(edge.target)) {
					element.style.opacity = '1';
					element.style.strokeWidth = '2px';
				} else {
					element.style.opacity = '0.3';
					element.style.strokeWidth = '1px';
				}
			}
		});
	}

	function onMouseOut(_: string) {
		nodes.forEach((node) => {
			const element = nodeDOMs[node.id];
			if (element) {
				element.style.opacity = '1';
				element.children[0].classList.remove('scale-[1.05]');
			}
		});

		edges.forEach((edge) => {
			const edgeId = `${edge.source}-${edge.target}`;
			const element = edgeDOMs[edgeId];
			if (element) {
				element.style.opacity = '1';
				element.style.strokeWidth = '1px';
			}
		});
	}
</script>

<div class="max-h-[600px] grow overflow-hidden rounded-lg border shadow-lg">
	{#if isEmpty}
		<div class="flex h-full items-center justify-center text-sm text-gray-400">
			<p>No graph data.</p>
		</div>
	{:else}
		<div class="relative h-full w-full overscroll-contain">
			<svg width={svgWidth} height={svgHeight} class="overflow-hidden" bind:this={svgElement}>
				<g bind:this={zoomGroup}>
					<defs>
						<marker
							id="arrowhead"
							viewBox="-0 -5 10 10"
							refX="8"
							refY="0"
							orient="auto"
							markerWidth="6"
							markerHeight="6"
							overflow="visible"
						>
							<path d="M 0,-5 L 10,0 L 0,5" fill="#999" stroke="none" />
						</marker>
					</defs>

					{#each edges as edge (edge.source + '-' + edge.target)}
						<path
							bind:this={edgeDOMs[edge.source + '-' + edge.target]}
							transition:draw={{ duration: 500, easing: quintOut }}
							class="edge"
							d={curveFunc(edge.points)}
							fill="none"
							stroke="#999"
							stroke-width="1"
							marker-end="url(#arrowhead)"
						/>
					{/each}

					{#each nodes as node (node.id)}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<!-- svelte-ignore a11y_mouse_events_have_key_events -->
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<g
							bind:this={nodeDOMs[node.id]}
							data-node-id={node.id}
							class="select-none transition duration-500 ease-in-out"
							transform="translate({node.x},{node.y})"
							onmouseover={() => onHover(node.id)}
							onmouseout={() => onMouseOut(node.id)}
							onclick={() => nodeOnClick(node.id)}
						>
							<rect
								width={node.width}
								height={node.height}
								x={-node.width / 2}
								y={-node.height / 2}
								fill="lightgray"
								stroke="black"
								stroke-width="1"
								rx="3"
								ry="3"
							/>
							<text text-anchor="middle" dominant-baseline="central" fill="black">
								{node.label || node.id}
							</text>
						</g>
					{/each}
				</g>
			</svg>
			<button
				class="absolute bottom-4 right-4 rounded-full bg-gray-200 p-2 text-gray-700 transition-colors duration-200 ease-in-out hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
				onclick={resetZoom}
				aria-label="Reset zoom"
			>
				<Fullscreen size={16} />
			</button>
		</div>
	{/if}
</div>
