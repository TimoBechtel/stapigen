import * as path from 'path';
import * as fs from 'fs';
import { GenericObjectData, ParserFunction } from './common/parserApi';

export async function parseFile(
	filepath: string,
	parse: ParserFunction
): Promise<GenericObjectData> {
	return new Promise((resolve, reject) => {
		fs.readFile(filepath, 'utf8', (error, content) => {
			if (error) return reject(error);
			const data = parse({ name: path.basename(filepath), content });
			resolve(data);
		});
	});
}
