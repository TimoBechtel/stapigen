import * as path from 'path';
import * as fs from 'fs';
import { compatibleWith, GenericObjectData, Parser } from './common/parserApi';
import { parseFile } from './fileParser';
import { reverse } from './common/utils';

export type DataObject = {
	name: string;
	tags: {
		[key: string]: string;
	};
	data: GenericObjectData;
};

export function createDirectoryParser({
	parser,
	parsedSchema,
}: {
	parser: Parser[];
	parsedSchema: string[];
}) {
	return async function traverseDirectory(
		directory: string
	): Promise<DataObject[]> {
		const dataList: DataObject[] = [];

		await Promise.all(
			fs.readdirSync(directory, { withFileTypes: true }).map(async (file) => {
				const currentFileOrDirPath = path.join(directory, file.name);
				if (file.isDirectory()) {
					dataList.push(...(await traverseDirectory(currentFileOrDirPath)));
				} else {
					const extension = path.extname(file.name);
					const parse = parser?.find(compatibleWith(extension))?.parse;
					if (!parse)
						return console.warn(
							`no parser found for file ${currentFileOrDirPath}`
						);

					const name = path.parse(file.name).name;
					const tags = parseTags(directory, parsedSchema);
					const data = await parseFile(currentFileOrDirPath, parse);
					dataList.push({ name, tags, data });
				}
			})
		);

		return dataList;
	};
}

function parseTags(
	dir: string,
	parsedSchema: string[]
): { [key: string]: string } {
	const folders = dir.split('/');
	const tags = {};
	// there are probably more folders than tagNames, so we start reverse
	reverse(parsedSchema).forEach((tagName, i) => {
		tags[tagName] = folders[folders.length - 1 - i];
	});
	return tags;
}
