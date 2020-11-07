import * as fs from 'fs';
import * as path from 'path';
import { createFileWriter } from '../src/fileWriter';

const testRoot = 'testdir';
const testPath = 'testdir/subdir';
beforeAll(() => {
	fs.mkdirSync(testPath, { recursive: true });
});

afterAll(() => {
	fs.rmdirSync(testRoot, { recursive: true });
});

test('writes file using stringifier', async () => {
	const dataName = 'testfile';
	const dataType = 'txt';
	const expectedContent = 'test';
	const expectedFile = path.join(testPath, `${dataName}.${dataType}`);
	const stringifier = () => expectedContent;

	const writeText = createFileWriter(dataType, stringifier);
	await writeText(testPath, { name: dataName, data: [] });

	expect(fs.existsSync(expectedFile)).toBe(true);

	const fileContent = fs.readFileSync(expectedFile, 'utf-8');
	expect(fileContent).toBe(expectedContent);
});
