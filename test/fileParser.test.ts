import { parseFile } from '../src/fileParser';
import * as fs from 'fs';
const testFile = 'testFile.txt';
const testContent = '123';

beforeAll(() => {
	fs.writeFileSync(testFile, testContent);
});

afterAll(() => {
	fs.unlinkSync(testFile);
});

test('reads and parses file using parser', async () => {
	const data = await parseFile(testFile, ({ name, content }) => {
		return { name, content };
	});
	expect(data.name).toBe(testFile);
	expect(data.content).toBe(testContent);
});

test('throws error if file does not exist', async () => {
	let err = false;
	try {
		await parseFile('nofile.txt', ({ name, content }) => {
			return { name, content };
		});
	} catch (e) {
		err = true;
	}
	expect(err).toBe(true);
});
