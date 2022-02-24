<h1 align="center">stapigen</h1>
<h3 align="center">Generate static APIs for any set of files</h3>
<p align="center">
	<a href="https://www.npmjs.com/package/stapigen" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/stapigen.svg">
  </a>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>
<p align="center">
  ·
  <a href="https://github.com/TimoBechtel/stapigen/issues">Report Bug / Request Feature</a>
  ·
</p>

## Table of Contents

- [About](#about)
- [Quickstart](#quickstart)
- [Commands](#commands)
- [Output JSON Structure](#output-json-structure)
- [Configuration](#configuration)
  - [Input](#input)
  - [Output](#output)
  - [Parser](#parser)
  - [Plugins](#plugins)
- [Development](#development)
- [Author](#author)
- [Contributing](#Contributing)

## About

Stapigen allows you to generate a static, file-based JSON API out of an existing set of files.
You can, for example, use it to generate an API for yaml or markdown files, like a JAMstack blog.

You can easily provide your own file parser, which allows you to generate an API for any filetype.

It's completely static, so you can host it with any static webserver or even Github Pages.

## Quickstart

1. Generate an example config file:

```sh
npx stapigen init
```

2. Change configuration file as needed (see [Configuration](#configuration))

3. Build api:

```sh
npx stapigen build
```

## Commands

Run `npx stapigen help [command]` for detailed and up-to-date documentation.

`init`:

```
Usage: stapigen init [options]

generates an example config file

Options:
  -f, --file-name <filename>  config file name (default: "stapigen.conf.js")
  -h, --help                  display help for command
```

`build`:

```
Usage: stapigen build [options]

builds a json api from input files

Options:
  -c, --config-file <file-path>  path to config file (default: "stapigen.conf.js")
  -h, --help                     display help for command
```

Stapigen will build `.json` files using a [parser](#parser) for every entpoint (see [output.schema](#output.schema))

## Output JSON Structure

- `index.json`: array containing all resources for a path
- `ID.json`: file containing data for a specific resource

> The id is the same as the filename, but always in lowercase.

Generated json for a single resource has following structure:

```json
{
	"id": "RESOURCE_ID",
	"tags": { "TAGNAME": "TAG_VALUE", "TAGNAME2": "TAG_VALUE2" },
	"data": { "PARSED_PROPERTY": "VALUE", "PARSED_PROPERTY2": "VALUE" }
}
```

`index.json` contains an array:

```json
[
	{
		"id": "RESOURCE_ID1",
		"tags": { "TAGNAME": "TAG_VALUE", "TAGNAME2": "TAG_VALUE2" },
		"data": { "PARSED_PROPERTY": "VALUE", "PARSED_PROPERTY2": "VALUE" }
	}
]
```

## Configuration

Stapigen is configured through a configuration file. It looks for `stapigen.conf.js` by default.
This can be changed through the `--config` flag.
(see `npx stapigen help build`)

The configuration is a file exporting a javascript object as NodeJS module.

example:

```js
module.exports = {
	input: {
		dir: 'input',
		schema: 'year/month/day',
	},
	output: {
		dir: 'output',
		schema: 'category/year',
	},
	parser: [
		{
			extensions: ['.txt'],
			parse: ({ name, content }) => ({ filename: name, content }),
		},
	],
	plugins: [],
};
```

### `input`

Defines how the source files are structured.

#### `input.dir`

Location of input files.

#### `input.schema` (optional)

Structure of input files. e.g. `year/month/day`
Stapigen generates tags out of the input directories (e.g. `year, month, day`). These are written in to the output json files and are used to generate output collections. (see [output.schema](#output.schema))

If omitted or empty (`''`), it just parses everything recursively in `input.dir`, ignoring the file structure.

### `output`

Defines how the api should be structured.

#### `output.dir`

Location of output files.

#### `output.schema` (optional)

Defines the folder structure for the generated json files. e.g. `category/year`

Stapigen generates collections for each folder name based on input folders (tags, see [input.schema](#input.schema)).
If it can't find a input folder with the same name, it filters the json data by properties with the output foldername.

For example:

When defining:
`input.schema: "year/month/day"`
and
`output.schema: "category/year"`
Stapigen will filter all input files by the property `category` and by the tag year (tag = input folder name).

With this example, the file `input/2020/12/13/myfile.md` with following content:

```md
---
category: magic
---

# my file
```

will result in a file `output/magic/2020/myfile.json`. (when providing a [parser](#parser) for `.md` files)

If omitted or empty (`''`), is just generates files directly in `output.dir` without creating folders.

### `parser`

Array containing parsers for input files.

> Stapigen does currently not include a parser, so you have to write your own!

A parser is a object with following properties:

- `extensions`: array containing supported file extensions, e.g.`['.md', '.txt']`
- `parse`: a parse function receiving a file object `{name, content}` and returning an object with the parsed data.

Typescript typedefinitions:

```ts
type GenericObjectData = {
	[key: string]: unknown;
};

type Parser = {
	extensions: string[];
	parse: ParserFunction;
};

type ParserFunction = (file: {
	name: string;
	content: string;
}) => GenericObjectData;
```

For example, this configuration:

```js
// [...]
  parser: [
		{
			extensions: ['.txt'],
			parse: ({ name, content }) => ({ filename: name, content }),
		},
	],
// [...]
```

will generate `.json` files from `.txt` files with following content:

```json
{
	// [...] (metadata)
	"data": {
		"filename": "FILE_NAME",
		"content": "FILE_CONTENT_AS_STRING"
	}
}
```

### `plugins`

Array containing plugins, you might want to use.

> stapigen allows you to add plugins, powered by [krog](https://github.com/TimoBechtel/krog)

```js
const myPlugin = require('./myPlugin');
//...
	plugins: [
		myPlugin,
	],
//...
```

For plugin authors: A plugin is just an object with the following properties:

- `name`: the name of the plugin
- `hooks`: an object with hooks (e.g. `{ 'before:write_collections' : () => {} }`)

A plugin can hook into specific hook points. The following hooks are available:

#### hooks

- `before:write_collections` Called before writing json files, receives the parsed collections as argument. You can also modify the collections or add new ones by returning a new array.

For example:

```ts
const plugin = {
	name: 'collections-logger',
	hooks: {
		'before:write_collections': ({ collections }) => {
			console.log('before:write_collections');
			console.log(collections);

			// modify collections by returning a new arguments object
			return {
				collections: [
					...collections,
					{
						id: 'my-new-collection',
						tags: {
							myTag: 'my-tag-value',
						},
						data: {
							myProperty: 'my-property-value',
						},
					},
				],
			};
		},
	},
};
```

## Development

### Run tests

```sh
yarn run test
```

## Author

👤 **Timo Bechtel**

- Twitter: [@TimoBechtel](https://twitter.com/TimoBechtel)
- GitHub: [@TimoBechtel](https://github.com/TimoBechtel)
- Website: <https://timobechtel.com>

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />

1. Check [issues](https://github.com/TimoBechtel/stapigen/issues)
1. Fork the Project
1. Create your Feature Branch (`git checkout -b feat/AmazingFeature`)
1. Test your changes `yarn run test`
1. Commit your Changes (`git commit -m 'feat: add amazingFeature'`)
1. Push to the Branch (`git push origin feat/AmazingFeature`)
1. Open a Pull Request

### Commit messages

This project uses semantic-release for automated release versions. So commits in this project follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/) guidelines. I recommend using [commitizen](https://github.com/commitizen/cz-cli) for automated commit messages.

## Show your support

Give a ⭐️ if this project helped you!

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
