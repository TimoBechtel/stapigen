import * as fs from 'fs';
import * as path from 'path';
import { GenericObjectData } from './common/parserApi';

export function createFileWriter(
	extension: string,
	stringifier: (input: GenericObjectData[]) => string
) {
	return async (
		dir: string,
		{ data, name }: { name: string; data: GenericObjectData[] }
	) => {
		await writeFile(path.join(dir, `${name}.${extension}`), stringifier(data));
	};
}

async function writeFile(filepath: string, data: string) {
	return new Promise((resolve, reject) => {
		fs.writeFile(filepath, data, (error) => {
			if (error) {
				reject(error);
				return;
			}
			resolve();
		});
	});
}
