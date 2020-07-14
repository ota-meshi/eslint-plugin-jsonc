# Introduction

[eslint-plugin-jsonc](https://www.npmjs.com/package/eslint-plugin-jsonc) is ESLint plugin for [JSON], [JSONC] and [JSON5] files.

[![NPM license](https://img.shields.io/npm/l/eslint-plugin-jsonc.svg)](https://www.npmjs.com/package/eslint-plugin-jsonc)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-jsonc.svg)](https://www.npmjs.com/package/eslint-plugin-jsonc)
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-plugin-jsonc&maxAge=3600)](http://www.npmtrends.com/eslint-plugin-jsonc)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-jsonc.svg)](http://www.npmtrends.com/eslint-plugin-jsonc)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-jsonc.svg)](http://www.npmtrends.com/eslint-plugin-jsonc)
[![NPM downloads](https://img.shields.io/npm/dy/eslint-plugin-jsonc.svg)](http://www.npmtrends.com/eslint-plugin-jsonc)
[![NPM downloads](https://img.shields.io/npm/dt/eslint-plugin-jsonc.svg)](http://www.npmtrends.com/eslint-plugin-jsonc)
[![Build Status](https://github.com/ota-meshi/eslint-plugin-jsonc/workflows/CI/badge.svg?branch=master)](https://github.com/ota-meshi/eslint-plugin-jsonc/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/ota-meshi/eslint-plugin-jsonc/badge.svg?branch=master)](https://coveralls.io/github/ota-meshi/eslint-plugin-jsonc?branch=master)

## Features

This ESLint plugin provides linting rules relate to better ways to help you avoid problems when using [JSON], [JSONC] and [JSON5].

- You can apply rules similar to the rules you use for JavaScript to JSON using the shareable config `"plugin:jsonc/auto-config"` provided by this plugin.
- You can choose the appropriate config provided by this plugin depending on whether you are using [JSON], [JSONC] or [JSON5].

You can check on the [Online DEMO](https://ota-meshi.github.io/eslint-plugin-jsonc/playground/).

## Why is it ESLint plugin?

ESLint is a great linter for JavaScript.  
Since [JSON] is a subset of JavaScript, the same parser and rules can be applied to [JSON].  
Also, [JSONC] and [JSON5], which are variants of [JSON], are more similar to JavaScript than [JSON]. Applying a JavaScript linter to [JSON] is more rational than creating a JSON-specific linter.  

### How does `eslint-plugin-jsonc` work?

This plugin parses `.json` with its own parser, but this parser just converts AST parsed by `espree` (ESLint standard parser) into AST with another name. However, ASTs that do not exist in [JSON] and JSON-superset syntaxes are reported as parsing errors. By converting the AST to another name, we prevent false positives from ESLint core rules.  
Moreover, You can do the same linting using the extended rules of the ESLint core rules provided by this plugin.

<!--DOCS_IGNORE_START-->

## Documentation

See [documents](https://ota-meshi.github.io/eslint-plugin-jsonc/).

## Installation

```bash
npm install --save-dev eslint eslint-plugin-jsonc
```

> **Requirements**
> 
> - ESLint v6.0.0 and above
> - Node.js v8.10.0 and above

<!--DOCS_IGNORE_END-->

## Usage

<!--USAGE_SECTION_START-->
<!--USAGE_GUIDE_START-->

### Configuration

Use `.eslintrc.*` file to configure rules. See also: [https://eslint.org/docs/user-guide/configuring](https://eslint.org/docs/user-guide/configuring).

Example **.eslintrc.js**:

```js
module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    'plugin:jsonc/recommended-with-jsonc'
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'jsonc/rule-name': 'error'
  }
}
```

This plugin provides configs:

- `plugin:jsonc/base` ... Configuration to enable correct JSON parsing.
- `plugin:jsonc/recommended-with-json` ... Recommended configuration for JSON.
- `plugin:jsonc/recommended-with-jsonc` ... Recommended configuration for JSONC.
- `plugin:jsonc/recommended-with-json5` ... Recommended configuration for JSON5.
- `plugin:jsonc/auto-config` ... Automatically apply jsonc rules similar to your configured ESLint core rules to JSON.

See [the rule list](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/) to get the `rules` that this plugin provides.

### Running ESLint from the command line

If you want to run `eslint` from the command line, make sure you include the `.json` extension using [the `--ext` option](https://eslint.org/docs/user-guide/configuring#specifying-file-extensions-to-lint) or a glob pattern, because ESLint targets only `.js` files by default.

Examples:

```bash
eslint --ext .js,.json src
eslint "src/**/*.{js,json}"
```

## Editor Integrations

### Visual Studio Code

Use the [dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension that Microsoft provides officially.

You have to configure the `eslint.validate` option of the extension to check `.json` files, because the extension targets only `*.js` or `*.jsx` files by default.

Example **.vscode/settings.json**:

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "json",
    "jsonc",
    "json5"
  ]
}
```

<!--USAGE_GUIDE_END-->
<!--USAGE_SECTION_END-->

## Rules

<!--RULES_SECTION_START-->

The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) automatically fixes problems reported by rules which have a wrench :wrench: below.  
The rules with the following star :star: are included in the config.

<!--RULES_TABLE_START-->

## JSONC Rules

| Rule ID | Description | Fixable | JSON | JSONC | JSON5 |
|:--------|:------------|:-------:|:----:|:-----:|:-----:|
| [jsonc/no-comments](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-comments.html) | disallow comments |  | :star: |  |  |
| [jsonc/no-number-props](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-number-props.html) | disallow number property keys | :wrench: | :star: | :star: | :star: |
| [jsonc/no-regexp-literals](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-regexp-literals.html) | disallow RegExp literals |  | :star: | :star: | :star: |
| [jsonc/no-template-literals](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-template-literals.html) | disallow template literals | :wrench: | :star: | :star: | :star: |
| [jsonc/no-undefined-value](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-undefined-value.html) | disallow `undefined` |  | :star: | :star: | :star: |
| [jsonc/valid-json-number](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/valid-json-number.html) | disallow invalid number for JSON | :wrench: | :star: | :star: |  |

## Extension Rules

| Rule ID | Description | Fixable | JSON | JSONC | JSON5 |
|:--------|:------------|:-------:|:----:|:-----:|:-----:|
| [jsonc/array-bracket-newline](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/array-bracket-newline.html) | enforce line breaks after opening and before closing array brackets | :wrench: |  |  |  |
| [jsonc/array-bracket-spacing](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/array-bracket-spacing.html) | disallow or enforce spaces inside of brackets | :wrench: |  |  |  |
| [jsonc/array-element-newline](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/array-element-newline.html) | enforce line breaks between array elements | :wrench: |  |  |  |
| [jsonc/comma-dangle](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/comma-dangle.html) | require or disallow trailing commas | :wrench: | :star: |  |  |
| [jsonc/comma-style](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/comma-style.html) | enforce consistent comma style | :wrench: |  |  |  |
| [jsonc/indent](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/indent.html) | enforce consistent indentation | :wrench: |  |  |  |
| [jsonc/key-spacing](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/key-spacing.html) | enforce consistent spacing between keys and values in object literal properties | :wrench: |  |  |  |
| [jsonc/no-dupe-keys](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-dupe-keys.html) | disallow duplicate keys in object literals |  | :star: | :star: | :star: |
| [jsonc/no-multi-str](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-multi-str.html) | disallow multiline strings |  | :star: | :star: |  |
| [jsonc/no-octal-escape](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-octal-escape.html) | disallow octal escape sequences in string literals |  |  |  |  |
| [jsonc/no-sparse-arrays](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-sparse-arrays.html) | disallow sparse arrays |  | :star: | :star: | :star: |
| [jsonc/no-useless-escape](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/no-useless-escape.html) | disallow unnecessary escape usage |  | :star: | :star: | :star: |
| [jsonc/object-curly-newline](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/object-curly-newline.html) | enforce consistent line breaks inside braces | :wrench: |  |  |  |
| [jsonc/object-curly-spacing](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/object-curly-spacing.html) | enforce consistent spacing inside braces | :wrench: |  |  |  |
| [jsonc/object-property-newline](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/object-property-newline.html) | enforce placing object properties on separate lines | :wrench: |  |  |  |
| [jsonc/quote-props](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/quote-props.html) | require quotes around object literal property names | :wrench: | :star: | :star: |  |
| [jsonc/quotes](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/quotes.html) | enforce use of double or single quotes | :wrench: | :star: | :star: |  |
| [jsonc/sort-keys](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/sort-keys.html) | require object keys to be sorted |  |  |  |  |
| [jsonc/space-unary-ops](https://ota-meshi.github.io/eslint-plugin-jsonc/rules/space-unary-ops.html) | disallow spaces after unary operators | :wrench: | :star: | :star: | :star: |

<!--RULES_TABLE_END-->
<!--RULES_SECTION_END-->

<!--DOCS_IGNORE_START-->

## Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` runs tests and measures coverage.  
- `npm run update` runs in order to update readme and recommended configuration.  

<!--DOCS_IGNORE_END-->

## License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).


[JSON]: https://json.org/
[JSONC]: https://github.com/microsoft/node-jsonc-parser
[JSON5]: https://json5.org/
