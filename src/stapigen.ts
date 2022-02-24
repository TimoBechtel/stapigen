import * as fs from 'fs';
import * as path from 'path';
import { Collection, generateCollections } from './collectionGenerator';
import { GenericObjectData } from './common/parserApi';
import { Config, parseSchema } from './config';
import { createDirectoryParser, DataObject } from './directoryParser';
import { createFileWriter } from './fileWriter';
import { initializePlugins } from './pluginSystem';

export async function generateApi(config: Config) {
	const hooks = initializePlugins(config.plugins || []);

	const traverseDirectory = createDirectoryParser({
		parsedSchema: parseSchema(config.input.schema || ''),
		parser: config.parser,
	});
	let dataObjects: DataObject[];
	dataObjects = await traverseDirectory(config.input.dir);

	const outPutSchema = parseSchema(config.output.schema || '');

	const generatedCollections = generateCollections(outPutSchema, dataObjects);

	const { collections } = await hooks.call('before:write_collections', {
		args: { collections: generatedCollections },
	});

	const writeFile = createFileWriter('json', JSON.stringify);

	await writeCollections(config.output.dir, collections, writeFile);
}

async function writeCollections(
	outputDir: string,
	collections: Collection[],
	writeFile: (
		directory: string,
		file: { name: string; data: GenericObjectData[] | GenericObjectData }
	) => Promise<void>
) {
	await Promise.all(
		collections.map(async ({ path: dir, data, entrypoint }) => {
			const directory = path.join(outputDir, dir);
			await new Promise<void>((resolve, reject) => {
				fs.mkdir(directory, { recursive: true }, async (error) => {
					if (error) return reject(error);
					if (entrypoint) {
						await writeFile(directory, { name: 'index', data });
						await Promise.all(
							data.map((data) => writeFile(directory, { name: data.id, data }))
						);
					}
					resolve();
				});
			});
		})
	);
}
