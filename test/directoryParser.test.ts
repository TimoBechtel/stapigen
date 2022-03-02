jest.mock('fs');

import { vol } from 'memfs';
import { parseSchema } from '../src/config';
import { createDirectoryParser } from '../src/directoryParser';

beforeEach(() => {
	vol.fromJSON(
		{
			'2020/Imafileinsomeotherdir.md': 'nothing',
			'2020/04/10/lorem.md': `# lorem

Lorem ipsum dolor sit amet, consectetur adipisici elit,
`,
			'2020/04/13/test/somefile.md': '',
			'2020/04/13/incompatible.file': '',
			'2020/05/01/randomNotes.md': `# these are my random notes

- apples
- oranges
- bread
`,
			'2020/05/02/thoughts.md': `# random thoughts

Do we live in a simulation? Yes.
`,
		},
		'test/example/input'
	);
});

afterEach(() => {
	vol.reset();
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
		id: 'imafileinsomeotherdir',
		tags: {
			year: '2020',
			month: '_',
			day: '_',
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
		id: 'randomnotes',
		tags: {
			year: '2020',
			month: '05',
			day: '01',
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
			month: '05',
			day: '02',
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

test('only parses files, that are included', async () => {
	const schema = ':year/:month/:day';
	const exampleDir = 'test/example/input/';

	const traverseDirectory = createDirectoryParser({
		parser: [
			{
				extensions: ['.md'],
				parse: ({ name, content }) => ({ name, content }),
			},
		],
		parsedSchema: parseSchema(schema),
		include: '2020/05/+(01|02)/*.md',
	});
	const data = await traverseDirectory(exampleDir);

	expect(data).toHaveLength(2);
});
