import * as path from 'path';
import { DataObject } from './directoryParser';

export const UNCATEGORIZED_COLLECTION = '_';

export type Collection = {
	path: string;
	data: DataObject[];
	entrypoint: boolean;
};

export function generateCollections(
	parsedSchema: string[],
	dataList: DataObject[]
): Collection[] {
	return [
		{ data: dataList, path: '', entrypoint: parsedSchema.length === 0 },
		...recursiveGenerate(parsedSchema, dataList),
	];
}

function recursiveGenerate(
	parsedSchema: string[],
	dataList: DataObject[],
	currentPath: string = ''
): Collection[] {
	const collections: Collection[] = [];
	if (parsedSchema.length === 0) {
		return collections;
	}

	const tag = parsedSchema[0];
	dataList.forEach((entry) => {
		let collectionName =
			entry.tags[tag] || (entry.data[tag] ?? UNCATEGORIZED_COLLECTION);

		const collectionDir = path.join(currentPath, collectionName + '');
		const collection = collections.find((c) => c.path === collectionDir);
		if (collection) collection.data.push(entry);
		else {
			collections.push({
				path: collectionDir,
				data: [entry],
				entrypoint: parsedSchema.length === 1,
			});
		}
	});
	collections.forEach(({ path, data }) => {
		collections.push(...recursiveGenerate(parsedSchema.slice(1), data, path));
	});
	return collections;
}
