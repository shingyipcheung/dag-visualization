// Custom exceptions
export class NodeAlreadyExistsError extends Error {
	constructor(node: string) {
		super(`Node '${node}' already exists in the graph.`);
		this.name = 'NodeAlreadyExistsError';
	}
}

export class NodeNotFoundError extends Error {
	constructor(node: string) {
		super(`Node '${node}' not found in the graph.`);
		this.name = 'NodeNotFoundError';
	}
}

export class EdgeNotFoundError extends Error {
	constructor(node1: string, node2: string) {
		super(`Edge from '${node1}' to '${node2}' not found in the graph.`);
		this.name = 'EdgeNotFoundError';
	}
}

class EdgeAlreadyExistsError extends Error {
	constructor(node1: string, node2: string) {
		super(`Edge from ${node1} to ${node2} already exists`);
		this.name = 'EdgeAlreadyExistsError';
	}
}

export interface AdjacencyList {
	[key: string]: string[];
}

export class Graph {
	adjacencyList = $state<AdjacencyList>({});

	graphData = $derived({
		nodes: Object.keys(this.adjacencyList).map((node) => ({ id: node })),
		edges: Object.keys(this.adjacencyList).flatMap((node) =>
			this.adjacencyList[node].map((child) => ({ source: node, target: child }))
		)
	});

	nodes: string[] = $derived(Object.keys(this.adjacencyList));

	constructor(data: AdjacencyList) {
		this.adjacencyList = data;
	}

	addNode(node: string): void {
		if (this.adjacencyList[node]) {
			throw new NodeAlreadyExistsError(node);
		}
		this.adjacencyList[node] = [];
	}

	addEdge(node1: string, node2: string): void {
		if (!this.adjacencyList[node1]) {
			throw new NodeNotFoundError(node1);
		}
		if (!this.adjacencyList[node2]) {
			throw new NodeNotFoundError(node2);
		}
		if (this.adjacencyList[node1].includes(node2)) {
			throw new EdgeAlreadyExistsError(node1, node2);
		}
		this.adjacencyList[node1].push(node2);
	}

	removeEdge(node1: string, node2: string): void {
		if (!this.adjacencyList[node1]) {
			throw new NodeNotFoundError(node1);
		}
		if (!this.adjacencyList[node2]) {
			throw new NodeNotFoundError(node2);
		}
		const initialLength = this.adjacencyList[node1].length;
		this.adjacencyList[node1] = this.adjacencyList[node1].filter((v) => v !== node2);
		if (this.adjacencyList[node1].length === initialLength) {
			throw new EdgeNotFoundError(node1, node2);
		}
	}

	removeNode(node: string): void {
		if (!this.adjacencyList[node]) {
			throw new NodeNotFoundError(node);
		}
		while (this.adjacencyList[node].length) {
			const adjacentNode = this.adjacencyList[node].pop();
			if (adjacentNode) {
				this.removeEdge(adjacentNode, node);
			}
		}
		delete this.adjacencyList[node];
	}

	depthFirstSearchRecursive(start: string): string[] {
		if (!this.adjacencyList[start]) {
			throw new NodeNotFoundError(start);
		}
		const result: string[] = [];
		const visited: { [key: string]: boolean } = {};

		const dfs = (node: string): void => {
			if (!node) return;
			visited[node] = true;
			result.push(node);
			this.adjacencyList[node].forEach((neighbor) => {
				if (!visited[neighbor]) {
					dfs(neighbor);
				}
			});
		};

		dfs(start);
		return result;
	}

	depthFirstSearchIterative(start: string): string[] {
		if (!this.adjacencyList[start]) {
			throw new NodeNotFoundError(start);
		}
		const stack: string[] = [start];
		const result: string[] = [];
		const visited: { [key: string]: boolean } = { [start]: true };

		while (stack.length) {
			const currentNode = stack.pop();
			if (currentNode) {
				result.push(currentNode);

				this.adjacencyList[currentNode].forEach((neighbor) => {
					if (!visited[neighbor]) {
						visited[neighbor] = true;
						stack.push(neighbor);
					}
				});
			}
		}

		return result;
	}

	breadthFirstSearch(start: string): string[] {
		if (!this.adjacencyList[start]) {
			throw new NodeNotFoundError(start);
		}
		const queue: string[] = [start];
		const result: string[] = [];
		const visited: { [key: string]: boolean } = { [start]: true };

		while (queue.length) {
			const currentNode = queue.shift();
			if (currentNode) {
				result.push(currentNode);

				this.adjacencyList[currentNode].forEach((neighbor) => {
					if (!visited[neighbor]) {
						visited[neighbor] = true;
						queue.push(neighbor);
					}
				});
			}
		}

		return result;
	}

	clear(): void {
		this.adjacencyList = {};
	}

	hasCycle(start: string, end: string): boolean {
		const visited = new Set<string>();
		const stack = [end];

		while (stack.length > 0) {
			const current = stack.pop()!;
			if (current === start) return true;
			if (!visited.has(current)) {
				visited.add(current);
				stack.push(...(this.adjacencyList[current] || []));
			}
		}

		return false;
	}

	// hasCycle(): boolean {
	// 	const visited: { [key: string]: boolean } = {};
	// 	const recStack: { [key: string]: boolean } = {};
	//
	// 	const dfsHasCycle = (node: string): boolean => {
	// 		if (!visited[node]) {
	// 			visited[node] = true;
	// 			recStack[node] = true;
	//
	// 			for (const neighbor of this.adjacencyList[node]) {
	// 				if (!visited[neighbor] && dfsHasCycle(neighbor)) {
	// 					return true;
	// 				} else if (recStack[neighbor]) {
	// 					return true;
	// 				}
	// 			}
	// 		}
	//
	// 		recStack[node] = false;
	// 		return false;
	// 	};
	//
	// 	for (const node in this.adjacencyList) {
	// 		if (dfsHasCycle(node)) {
	// 			return true;
	// 		}
	// 	}
	//
	// 	return false;
	// }
}
