import * as fs from 'fs';
import * as path from 'path';
import { Parser } from './common/parserApi';
import { Plugin } from './pluginSystem';

export type Config = {
	input: {
		dir: string;
		include?: string;
		schema?: string;
	};
	output: {
		dir: string;
		schema?: string;
	};
	parser?: Parser[];
	plugins?: Plugin[];
};

export async function parseConfigFile(file: string): Promise<Config> {
	if (!fs.existsSync(file)) throw `Config file does not exist. (${file})`;
	const config = await loadConfigFile(path.resolve(file));
	validateConfig(config);
	return config;
}

async function loadConfigFile(file: string): Promise<Config> {
	return await import(file);
}

export function validateConfig(config: Config) {
	if (!config.input.dir) throw 'You need to define an input directory';
	if (!config.output.dir) throw 'You need to define an output directory';
}

// :year/:category/:movie
export function parseSchema(schema: string): string[] {
	return schema
		.replace(/:/g, '')
		.replace(/^\/+|\/+$/g, '') // trim leading+trailing slashes
		.split('/')
		.filter((s) => !!s); // skip empty strings
}
