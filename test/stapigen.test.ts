import * as path from 'path';
import * as fs from 'fs';
import { Config } from '../src/config';
import { generateApi } from '../src/stapigen';

const testDir = path.resolve('./test/_tmp');
beforeAll(() => {
	fs.mkdirSync(testDir, { recursive: true });
});

afterAll(() => {
	fs.rmdirSync(testDir, { recursive: true });
});

test('generates files from config', async () => {
	const config: Config = {
		input: {
			dir: path.resolve('./test/example/input'),
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
	await generateApi(config);

	const expectedFiles = ['/index.json', '/04/index.json', '/04/13/index.json'];

	expectedFiles.forEach((file) => {
		expect(fs.existsSync(path.join(testDir, file))).toBe(true);
	});
});
