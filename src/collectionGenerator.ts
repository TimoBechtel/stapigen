import * as path from 'path';
import { DataObject } from './directoryParser';

export type Collection = {
	path: string;
	data: DataObject[];
};

export function generateCollections(
	parsedSchema: string[],
	dataList: DataObject[]
): Collection[] {
	return [
		{ data: dataList, path: '' },
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
		if (!entry.tags[tag]) return;
		const collectionDir = path.join(currentPath, entry.tags[tag]);
		const collection = collections.find((c) => c.path === collectionDir);
		if (collection) collection.data.push(entry);
		else {
			collections.push({ path: collectionDir, data: [entry] });
		}
	});
	collections.forEach(({ path, data }) => {
		collections.push(...recursiveGenerate(parsedSchema.slice(1), data, path));
	});
	return collections;
}
