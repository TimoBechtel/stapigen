import * as path from 'path';
import { compatibleWith } from '../../src/common/parserApi';

test('finds compatible parser if there is one', () => {
	const testType = '.txt';
	const parser = [
		{
			extensions: ['.txt'],
			parse: () => ({}),
		},
		{
			extensions: ['.yml'],
			parse: () => ({}),
		},
	];

	const compatibleParser = parser.find(compatibleWith(testType));
	expect(compatibleParser).toBeTruthy();
});

test('does not find compatible parser if there is none', () => {
	const testType = '.txt';
	const parser = [
		{
			extensions: ['.md'],
			parse: () => ({}),
		},
		{
			extensions: ['.yml'],
			parse: () => ({}),
		},
	];

	const compatibleParser = parser.find(compatibleWith(testType));
	expect(compatibleParser).toBeFalsy();
});
