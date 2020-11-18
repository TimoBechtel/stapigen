import * as path from 'path';
import { parseSchema } from '../src/config';
import { createDirectoryParser, DataObject } from '../src/directoryParser';
import * as mock from 'mock-fs';

beforeAll(() => {
	mock(
		{
			'test/example/input': {
				'2020': {
					'04': {
						'10': {
							'lorem.md': `# lorem

Lorem ipsum dolor sit amet, consectetur adipisici elit,
`,
						},
						'13': {
							'incompatible.file': '',
							'randomNotes.md': `# these are my random notes

- apples
- oranges
- bread
`,
							'thoughts.md': `# random thoughts

Do we live in a simulation? Yes.
`,
						},
					},
				},
			},
		},
		{ createCwd: true, createTmp: true }
	);
});

afterAll(() => {
	mock.restore();
});

test('parses complete directory', async () => {
	global.console.warn = jest.fn();

	const schema = ':year/:month/:day';
	const exampleDir = 'test/example/input';

	const expected: DataObject[] = [
		{
			data: {
				content: `# these are my random notes

- apples
- oranges
- bread
`,
				name: 'randomNotes.md',
			},
			name: 'randomNotes',
			tags: {
				year: '2020',
				month: '04',
				day: '13',
			},
		},
		{
			data: {
				content: `# random thoughts

Do we live in a simulation? Yes.
`,
				name: 'thoughts.md',
			},
			name: 'thoughts',
			tags: {
				year: '2020',
				month: '04',
				day: '13',
			},
		},
		{
			data: {
				content: `# lorem

Lorem ipsum dolor sit amet, consectetur adipisici elit,
`,
				name: 'lorem.md',
			},
			name: 'lorem',
			tags: {
				year: '2020',
				month: '04',
				day: '10',
			},
		},
	];

	const traverseDirectory = createDirectoryParser({
		parser: [
			{
				extensions: ['.md'],
				parse: ({ name, content }) => ({ name, content }),
			},
		],
		parsedSchema: parseSchema(schema),
	});
	const data = await traverseDirectory(exampleDir);

	// data might not be in the same order
	expect(data).toHaveLength(3);
	expect(data).toContainEqual(expected[0]);
	expect(data).toContainEqual(expected[1]);
	expect(console.warn).toHaveBeenCalledTimes(1);
});
