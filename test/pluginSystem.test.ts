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

test('allows adding plugins that hooks into before:write_collections', async () => {
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
		plugins: [
			{
				name: 'test-plugin',
				hooks: {
					'before:write_collections': ({ collections }) => {
						expect(collections).toBeTruthy();
						expect(collections.length).toBeGreaterThan(0);
						expect(collections).toContainEqual({
							path: '04/10',
							data: [
								{
									id: 'lorem',
									tags: {
										year: '2020',
										month: '04',
										day: '10',
									},
									data: {
										text: '# lorem\n\nLorem ipsum dolor sit amet, consectetur adipisici elit,\n',
									},
								},
							],
							entrypoint: true,
						});

						// add a new collection
						return {
							collections: [
								...collections,
								{
									path: '01/02',
									data: [
										{
											id: 'a',
											tags: {},
											data: {
												text: 'b',
											},
										},
									],
									entrypoint: true,
								},
							],
						};
					},
				},
			},
		],
	};

	const expectedIndexFiles = [
		'01/02/index.json',
		'/04/13/index.json',
		'/04/10/index.json',
		'/_/_/index.json',
	];

	const expectedFiles = [
		'01/02/a.json',
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
