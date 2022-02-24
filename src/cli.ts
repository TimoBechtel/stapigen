#!/usr/bin/env node
import { program } from 'commander';
import * as fs from 'fs';
import { parseConfigFile } from './config';
import { generateApi } from './stapigen';
const pkg = require('../package.json');

program.version(pkg.version);
program
	.command('build')
	.description('builds a json api from input files')
	.option(
		'-c, --config-file <file-path>',
		'path to config file',
		'stapigen.conf.js'
	)
	.action(build);

program
	.command('init')
	.description('generates an example config file')
	.option('-f, --file-name <filename>', 'config file name', 'stapigen.conf.js')
	.action(generateConfigFile);

if (process.argv.length === 2) {
	// use build command as default
	process.argv.push('build');
}

program.parseAsync(process.argv);

async function build({ configFile }: { configFile: string }) {
	try {
		const config = await parseConfigFile(configFile);
		await generateApi(config);
	} catch (e) {
		console.error(e);
		return;
	}
}

function generateConfigFile({ fileName }: { fileName: string }) {
	if (fs.existsSync(fileName))
		throw `A file with that name already exists. (${fileName})`;
	const EXAMPLE_CONFIG_STRING = `module.exports = {
	input: {
		dir: 'INPUT_DIRECTORY',
		// define how the source data is structured
		// it will generate tags from folders which can be used in the output.schema
		schema: 'MY/DIRECTORY/STRUCTURE',
	},
	output: {
		dir: 'OUTPUT_DIRECTORY',
		// output schema: this defines how the api is structured
		// it creates categories based on the input schema
		// and if it does not find a folder, it tries to find a property 
		// with a matching name from the parsed input files
		schema: 'MY/API/STRUCTURE',
	},
	// add parser for file types you need
	parser: [
		{
			extensions: ['.txt'],
			parse: ({ name, content }) => ({ filename: name, content }),
		},
	],
	plugins: []
};
`;
	fs.writeFile(fileName, EXAMPLE_CONFIG_STRING, (error) => {
		if (error) throw error;
	});
}
