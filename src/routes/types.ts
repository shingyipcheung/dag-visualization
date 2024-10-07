export const NODE_TYPES = ['TYPE_1', 'TYPE_2', 'TYPE_3', 'TYPE_4'];
export type NodeType = (typeof NODE_TYPES)[number];

export type Node = Record<string, any>;

export interface GraphData {
	nodes: { id: string }[];
	edges: { source: string; target: string }[];
}
