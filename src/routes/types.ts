export const NODE_TYPES = ['TYPE_1', 'TYPE_2', 'TYPE_3', 'TYPE_4'];
export type NodeType = (typeof NODE_TYPES)[number];

export interface Node {
	id: string;
	data: Record<string, any>;
	children: string[];
}

export interface GraphData {
	nodes: { id: string; ref: Node }[];
	edges: { source: string; target: string }[];
}
