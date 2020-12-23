import * as path from 'path';
import * as fs from 'fs';
import * as mock from 'mock-fs';
import { Config } from '../src/config';
import { generateApi } from '../src/stapigen';

const testDir = 'test/_tmp';

beforeAll(() => {
	mock(
		{
			[testDir]: {},
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

test('generates files from config', async () => {
	global.console.warn = jest.fn();

	const config: Config = {
		input: {
			dir: 'test/example/input',
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
		'/index.json',
		'/04/index.json',
		'/04/13/index.json',
	];

	const expectedFiles = [
		'/lorem.json',
		'/thoughts.json',
		'/randomNotes.json',
		'/04/lorem.json',
		'/04/thoughts.json',
		'/04/randomNotes.json',
		'/04/13/thoughts.json',
		'/04/13/randomNotes.json',
	];

	await generateApi(config);

	expect(console.warn).toHaveBeenCalledTimes(1);
	[...expectedFiles, ...expectedIndexFiles].forEach((file) => {
		expect(fs.existsSync(path.join(testDir, file))).toBe(true);
	});
});
