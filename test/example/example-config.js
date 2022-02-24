module.exports = {
	input: {
		dir: 'input',
		schema: ':year/:category',
	},
	output: {
		dir: 'output',
		schema: ':category',
	},
	parser: [
		{
			extensions: ['.txt'],
			parse: ({ name, content }) => ({ name, content }),
		},
	],
	plugins: [],
};
