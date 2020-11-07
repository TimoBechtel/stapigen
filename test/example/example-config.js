module.exports = {
	input: {
		dir: 'input',
		schema: ':year/:category/:movie',
	},
	output: {
		dir: 'output',
		schema: ':category/:movie',
	},
	parser: [
		{
			extensions: ['.txt'],
			parse: ({ name, content }) => ({ name, content }),
		},
	],
};
