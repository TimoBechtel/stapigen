import { parseSchema } from '../src/config';
import { createDirectoryParser, DataObject } from '../src/directoryParser';
import * as mock from 'mock-fs';

beforeAll(() => {
	mock(
		{
			'test/example/input': {
				'2020': {
					'Imafileinsomeotherdir.md': 'nothing',
					'04': {
						'10': {
							'lorem.md': `# lorem

Lorem ipsum dolor sit amet, consectetur adipisici elit,
`,
						},
						'13': {
							test: {
								'somefile.md': '',
							},
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
	expect(data).toHaveLength(5);
	expect(data).toContainEqual({
		data: {
			name: 'Imafileinsomeotherdir.md',
			content: 'nothing',
		},
		id: 'Imafileinsomeotherdir',
		tags: {
			year: '2020',
		},
	});
	expect(data).toContainEqual({
		data: {
			content: `# these are my random notes

- apples
- oranges
- bread
`,
			name: 'randomNotes.md',
		},
		id: 'randomNotes',
		tags: {
			year: '2020',
			month: '04',
			day: '13',
		},
	});
	expect(data).toContainEqual({
		data: {
			content: `# random thoughts

Do we live in a simulation? Yes.
`,
			name: 'thoughts.md',
		},
		id: 'thoughts',
		tags: {
			year: '2020',
			month: '04',
			day: '13',
		},
	});
	expect(data).toContainEqual({
		data: {
			content: `# lorem

Lorem ipsum dolor sit amet, consectetur adipisici elit,
`,
			name: 'lorem.md',
		},
		id: 'lorem',
		tags: {
			year: '2020',
			month: '04',
			day: '10',
		},
	});
	expect(data).toContainEqual({
		data: {
			content: '',
			name: 'somefile.md',
		},
		id: 'somefile',
		tags: {
			year: '2020',
			month: '04',
			day: '13',
		},
	});
	expect(console.warn).toHaveBeenCalledTimes(1);
});
