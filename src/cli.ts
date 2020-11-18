#!/usr/bin/env node
import { program } from 'commander';
import { parseConfigFile } from './config';
import { generateApi } from './stapigen';
const pkg = require('../package.json');

program.version(pkg.version);
program.option(
	'-c, --config-file <file-path>',
	'path to config file',
	'stapigen.conf.js'
);

program.parse(process.argv);

(async () => {
	try {
		const config = await parseConfigFile(program.configFile);
		await generateApi(config);
	} catch (e) {
		console.error(e);
		return;
	}
})();
