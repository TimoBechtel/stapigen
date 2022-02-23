jest.mock('fs');

import * as fs from 'fs';
import { vol } from 'memfs';
import * as path from 'path';
import { createFileWriter } from '../src/fileWriter';

const testPath = 'testdir/subdir';

beforeEach(() => {
	vol.mkdirSync(testPath, { recursive: true });
});

afterEach(() => {
	vol.reset();
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
