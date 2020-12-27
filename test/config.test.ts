import {
	Config,
	parseConfigFile,
	parseSchema,
	validateConfig,
} from '../src/config';
import * as path from 'path';

test('parses example config file', async () => {
	const testConfigFile = path.resolve('./test/example/example-config.js');
	const config = await parseConfigFile(testConfigFile);
	expect(config.input.dir).toEqual('input');
	expect(config.parser[0].extensions[0]).toEqual('.txt');
});

test('throws on invalid config file', async () => {
	global.console.warn = jest.fn();

	const config: Config = {
		input: {
			dir: '',
		},
		output: {
			dir: '',
		},
	};
	expect(() => {
		validateConfig(config);
	}).toThrow();

	const emptyConfig: any = {};
	expect(() => {
		validateConfig(emptyConfig);
	}).toThrow();

	const invalidConfig: any = {
		input: {
			dir: '',
		},
		output: '',
	};
	expect(() => {
		validateConfig(invalidConfig);
	}).toThrow();

	const validConfig = {
		input: {
			dir: 'a',
		},
		output: {
			dir: 'b',
		},
	};
	expect(() => {
		validateConfig(validConfig);
	}).not.toThrow();
});

test('parses schema', () => {
	const testSchema = ':year/:month/:day/:hour';
	const expected = ['year', 'month', 'day', 'hour'];
	expect(parseSchema(testSchema)).toEqual(expected);
});

test('parses schema, ignoring leading and trailing slashes', () => {
	const testSchema = '/:year/:month/:day/:hour/';
	const expected = ['year', 'month', 'day', 'hour'];
	expect(parseSchema(testSchema)).toEqual(expected);
});

test('parseSchema returns empty array on empty schema', () => {
	const testSchema = '';
	const expected = [];
	expect(parseSchema(testSchema)).toEqual(expected);
});
