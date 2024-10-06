export default {
	A: {
		id: 'A',
		data: {
			type: 'TYPE_1',
			tags: {}
		},
		children: ['B']
	},
	B: {
		id: 'B',
		data: {
			type: 'TYPE_1',
			tags: {}
		},
		children: ['E', 'F']
	},
	C: {
		id: 'C',
		data: {
			type: 'TYPE_1',
			tags: {}
		},
		children: ['B']
	},
	D: {
		id: 'D',
		data: {
			type: 'TYPE_1',
			tags: {}
		},
		children: ['E', 'F']
	},
	E: {
		id: 'E',
		data: {
			type: 'TYPE_1',
			tags: {}
		},
		children: ['H']
	},
	F: {
		id: 'F',
		data: {
			type: 'TYPE_1',
			tags: {}
		},
		children: []
	},
	G: {
		id: 'G',
		data: {
			type: 'TYPE_1',
			tags: {}
		},
		children: ['H']
	},
	H: {
		id: 'H',
		data: {
			type: 'TYPE_1',
			tags: {}
		},
		children: ['I']
	},
	I: {
		id: 'I',
		data: {
			type: 'TYPE_1',
			tags: {}
		},
		children: []
	}
};
