import * as fs from 'fs';
import * as minimatch from 'minimatch';
import * as path from 'path';
import { UNCATEGORIZED_COLLECTION } from './collectionGenerator';
import { compatibleWith, GenericObjectData, Parser } from './common/parserApi';
import { Config } from './config';
import { parseFile } from './fileParser';

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
	include,
}: {
	parser: Parser[];
	parsedSchema: string[];
	include?: Config['input']['include'];
}) {
	let glob: string;
	return async function traverseDirectory(
		directory: string,
		subdirectory: string = ''
	): Promise<DataObject[]> {
		if (!glob && include) {
			// prepend pattern, to allow patterns relative to the input.dir (e.g. 'dir/**/*.yaml')
			glob = prependGlobPattern(include, directory);
		}
		const dataList: DataObject[] = [];
		const curDirectory = path.join(directory, subdirectory);

		await Promise.all(
			fs
				.readdirSync(curDirectory, {
					withFileTypes: true,
				})
				.map(async (file) => {
					const currentFileOrDirPath = path.join(curDirectory, file.name);

					// ignore paths that are not in the include pattern list
					if (
						glob &&
						!minimatch(currentFileOrDirPath, glob, {
							partial: true,
							matchBase: true,
						} as minimatch.IOptions) // @types/minimatch has missing type definition for partial option
					) {
						return;
					}

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
						// ignore files that are not in the include pattern list
						if (
							glob &&
							!minimatch(currentFileOrDirPath, glob, { matchBase: true })
						) {
							return;
						}

						const extension = path.extname(file.name);
						const parse = parser?.find(compatibleWith(extension))?.parse;
						if (!parse)
							return console.warn(
								`No parser found for file ${currentFileOrDirPath}. Skipped.`
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

function prependGlobPattern(globPattern: string, basePath: string): string {
	return `${basePath.replace(/\/$/, '')}/${globPattern.replace(/^\//, '')}`;
}
