import * as path from 'path';
import * as fs from 'fs';
import { compatibleWith, GenericObjectData, Parser } from './common/parserApi';
import { parseFile } from './fileParser';
import { UNCATEGORIZED_COLLECTION } from './collectionGenerator';

export type DataObject = {
	id: string;
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
		directory: string,
		subdirectory: string = ''
	): Promise<DataObject[]> {
		const dataList: DataObject[] = [];
		const curDirectory = path.join(directory, subdirectory);

		await Promise.all(
			fs
				.readdirSync(curDirectory, {
					withFileTypes: true,
				})
				.map(async (file) => {
					const currentFileOrDirPath = path.join(curDirectory, file.name);
					if (file.isDirectory()) {
						dataList.push(
							...(
								await traverseDirectory(
									directory,
									path.join(subdirectory, file.name)
								)
							).map((data) => {
								if (dataList.some(({ id }) => data.id === id)) {
									throw `Entry with id "${data.id}" already exists. Make sure that every file has a unique identifier.`;
								}
								return data;
							})
						);
					} else {
						const extension = path.extname(file.name);
						const parse = parser?.find(compatibleWith(extension))?.parse;
						if (!parse)
							return console.warn(
								`no parser found for file ${currentFileOrDirPath}`
							);

						const id = path.parse(file.name).name.toLowerCase();
						const tags = parseTags(subdirectory, parsedSchema);
						const data = await parseFile(currentFileOrDirPath, parse);

						dataList.push({ id, tags, data });
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
	parsedSchema.forEach((tagName, i) => {
		const currentFolder = folders[i];
		tags[tagName] = currentFolder || UNCATEGORIZED_COLLECTION;
	});
	return tags;
}
