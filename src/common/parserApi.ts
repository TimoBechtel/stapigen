export type GenericObjectData = {
	[key: string]: unknown;
};

export type Parser = {
	extensions: string[];
	parse: ParserFunction;
};

export type ParserFunction = (file: {
	name: string;
	content: string;
}) => GenericObjectData;

export function compatibleWith(extension: string): (parser: Parser) => boolean {
	return (parser: Parser) => parser.extensions.includes(extension);
}
