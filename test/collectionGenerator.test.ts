import { Collection, generateCollections } from '../src/collectionGenerator';
import { DataObject } from '../src/directoryParser';

test('generates collections', () => {
	const testData: DataObject[] = [
		{
			name: 'test1',
			data: { n: 1 },
			tags: {
				year: '2020',
				month: '04',
				day: '13',
			},
		},
		{
			name: 'test2',
			data: { n: 2 },
			tags: {
				year: '2020',
				month: '03',
				day: '02',
			},
		},
		{
			name: 'test1',
			data: { n: 3 },
			tags: {
				year: '2019',
				month: '12',
				day: '24',
			},
		},
	];
	const expectedCollections: Collection[] = [
		{
			path: '',
			data: testData,
		},
		{
			path: '2020',
			data: [testData[0], testData[1]],
		},
		{
			path: '2020/04',
			data: [testData[0]],
		},
		{
			path: '2020/04/13',
			data: [testData[0]],
		},
		{
			path: '2020/03',
			data: [testData[1]],
		},
		{
			path: '2020/03/02',
			data: [testData[1]],
		},
		{
			path: '2019',
			data: [testData[2]],
		},
		{
			path: '2019/12',
			data: [testData[2]],
		},
		{
			path: '2019/12/24',
			data: [testData[2]],
		},
	];
	const testSchema = ['year', 'month', 'day'];
	const collections = generateCollections(testSchema, testData);

	expect(collections).toHaveLength(expectedCollections.length);
	expect(collections).toEqual(expect.arrayContaining(expectedCollections));
});
