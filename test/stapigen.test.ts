jest.mock('fs');

import { fs, vol } from 'memfs';
import * as path from 'path';
import { Config } from '../src/config';
import { generateApi } from '../src/stapigen';

const testDir = 'test/_tmp';

beforeEach(() => {
	vol.mkdirSync(testDir, { recursive: true });
	vol.fromJSON(
		{
			'2020/file.md': 'file without a month + day',
			'2020/04/10/lorem.md': `# lorem

Lorem ipsum dolor sit amet, consectetur adipisici elit,
`,
			'2020/04/13/incompatible.file': '',
			'2020/04/13/randomNotes.md': `# these are my random notes
		
		- apples
		- oranges
		- bread
		`,
			'2020/04/13/thoughts.md': `# random thoughts

Do we live in a simulation? Yes.
`,
		},
		'test/example/input'
	);
});

afterEach(() => {
	vol.reset();
});

test('generates files from config', async () => {
	global.console.warn = jest.fn();

	const config: Config = {
		input: {
			dir: 'test/example/input',
			include: '**/*.+(md|file)',
			schema: ':year/:month/:day',
		},
		output: {
			dir: testDir,
			schema: ':month/:day/',
		},
		parser: [
			{
				extensions: ['.md'],
				parse: ({ content }) => ({ text: content }),
			},
		],
	};

	const expectedIndexFiles = [
		'/04/13/index.json',
		'/04/10/index.json',
		'/_/_/index.json',
	];

	const expectedFiles = [
		'/04/13/thoughts.json',
		'/04/13/randomnotes.json',
		'/04/10/lorem.json',
		'/_/_/file.json',
	];

	await generateApi(config);

	expect(console.warn).toHaveBeenCalledTimes(1);
	[...expectedFiles, ...expectedIndexFiles].forEach((file) => {
		expect(fs.existsSync(path.join(testDir, file))).toBe(true);
	});
});

test('generates all files in root output directory if output.schema has empty value', async () => {
	global.console.warn = jest.fn();

	const config: Config = {
		input: {
			dir: 'test/example/input',
			schema: ':year/:month/:day',
		},
		output: {
			dir: testDir,
			schema: '',
		},
		parser: [
			{
				extensions: ['.md'],
				parse: ({ content }) => ({ text: content }),
			},
		],
	};

	const expectedIndexFiles = ['/index.json'];

	const expectedFiles = [
		'/thoughts.json',
		'/randomnotes.json',
		'/lorem.json',
		'/file.json',
	];

	await generateApi(config);

	expect(console.warn).toHaveBeenCalledTimes(1);
	[...expectedFiles, ...expectedIndexFiles].forEach((file) => {
		expect(fs.existsSync(path.join(testDir, file))).toBe(true);
	});
});

test('errors out when config is invalid', async () => {
	global.console.warn = jest.fn();

	const config: any = {
		input: {
			dir: 'test/example/input',
			schema: ':year/:month/:day',
		},
		output: {},
		parser: [
			{
				extensions: ['.md'],
				parse: ({ content }) => ({ text: content }),
			},
		],
	};

	let error = null;
	try {
		await generateApi(config);
	} catch (e) {
		error = e;
	}
	expect(console.warn).toHaveBeenCalledTimes(1);
	expect(error).not.toBeNull();
});
