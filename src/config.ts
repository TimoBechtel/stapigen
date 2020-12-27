import * as fs from 'fs';
import * as path from 'path';
import { Parser } from './common/parserApi';

export type Config = {
	input: {
		dir: string;
		schema: string;
	};
	output: {
		dir: string;
		schema: string;
	};
	parser?: Parser[];
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

function validateConfig(config: Config) {
	// TODO: config validation
}

// :year/:category/:movie
export function parseSchema(schema: string): string[] {
	return schema
		.replace(/:/g, '')
		.replace(/^\/+|\/+$/g, '') // trim leading+trailing slashes
		.split('/');
}
