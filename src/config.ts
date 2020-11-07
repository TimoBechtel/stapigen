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

type Schema = {
	tags: string[];
};

export async function parseConfigFile(file: string): Promise<Config> {
	// TODO: error handling
	const config = await loadConfigFile(file);
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
