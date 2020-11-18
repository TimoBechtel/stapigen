#!/usr/bin/env node
import { parseConfigFile } from './config';
import { generateApi } from './stapigen';

(async () => {
	try {
		const config = await parseConfigFile('stapigen.conf.js');
		await generateApi(config);
	} catch (e) {
		console.error(e);
		return;
	}
})();
