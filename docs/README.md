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

## :name_badge: Features

This ESLint plugin provides linting rules relate to better ways to help you avoid problems when using [JSON], [JSONC] and [JSON5].

- You can use ESLint to lint [JSON].
- You can apply rules similar to the rules you use for JavaScript to JSON using the [`"jsonc/auto"`](./rules/auto.md) rule provided by this plugin.
- You can choose the appropriate config provided by this plugin depending on whether you are using [JSON], [JSONC] or [JSON5].
- Supports [Vue SFC](https://vue-loader.vuejs.org/spec.html) custom blocks such as `<i18n>`.  
  Requirements `vue-eslint-parser` v7.3.0 and above.
- Supports ESLint directives. e.g. `// eslint-disable-next-line`
- You can check your code in real-time using the ESLint editor integrations.

You can check on the [Online DEMO](./playground/).

## :question: Why is it ESLint plugin?

ESLint is a great linter for JavaScript.  
Since [JSON] is a subset of JavaScript, the same parser and rules can be applied to [JSON].  
Also, [JSONC] and [JSON5], which are variants of [JSON], are more similar to JavaScript than [JSON]. Applying a JavaScript linter to [JSON] is more rational than creating a JSON-specific linter.

### How does `eslint-plugin-jsonc` work?

This plugin parses `.json` with its own parser, but this parser just converts AST parsed by `acorn` (It is used internally by the ESLint standard parser) into AST with another name. However, ASTs that do not exist in [JSON] and the superset of JSON syntaxes are reported as parsing errors. By converting the AST to another name, we prevent false positives from ESLint core rules.  
Moreover, You can do the same linting using the extended rules of the ESLint core rules provided by this plugin.

The parser package used by this plugin is [jsonc-eslint-parser].

## :question: How is it different from other JSON plugins?

### Plugins that do not use AST

e.g. [eslint-plugin-json](https://www.npmjs.com/package/eslint-plugin-json)

These plugins use the processor to parse and return the results independently, without providing the ESLint engine with AST and source code text.

Plugins don't provide AST, so you can't use directive comments (e.g. `/* eslint-disable */`).  
Plugins don't provide source code text, so you can't use it with plugins and rules that use text (e.g. [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier), [eol-last](https://eslint.org/docs/rules/eol-last)).  
Also, most plugins don't support JSON5.

**eslint-plugin-jsonc** works by providing AST and source code text to ESLint.

### Plugins that use the same AST as JavaScript

e.g. [eslint-plugin-json-files](https://www.npmjs.com/package/eslint-plugin-json-files), [eslint-plugin-json-es](https://www.npmjs.com/package/eslint-plugin-json-es)

These plugins use the same AST as JavaScript for linting.

Since the plugin uses the same AST as JavaScript, it may not report syntax that is not available in JSON (e.g. `1 + 1`, `(42)`). Also, ESLint core rules and other plugin rules can false positives (e.g. [quote-props](https://eslint.org/docs/rules/quote-props) rule reports quote on keys), which can complicate the your configuration.

The AST used by **eslint-plugin-jsonc** is similar to JavaScript AST, but with a different node name. This will prevent false positives. This means that it can be easily used in combination with other plugins.

## :book: Usage

See [User Guide](./user-guide/README.md).

## :white_check_mark: Rules

See [Available Rules](./rules/README.md).

## :rocket: To Do More Verification

### Verify using JSON Schema

You can verify using JSON Schema by checking and installing [eslint-plugin-json-schema-validator].

### Verify the [Vue I18n] message resource files

You can verify the message files by checking and installing [@intlify/eslint-plugin-vue-i18n].

## :couple: Related Packages

- [eslint-plugin-yml](https://github.com/ota-meshi/eslint-plugin-yml) ... ESLint plugin for YAML.
- [eslint-plugin-toml](https://github.com/ota-meshi/eslint-plugin-toml) ... ESLint plugin for TOML.
- [eslint-plugin-json-schema-validator](https://github.com/ota-meshi/eslint-plugin-json-schema-validator) ... ESLint plugin that validates data using JSON Schema Validator.
- [jsonc-eslint-parser](https://github.com/ota-meshi/jsonc-eslint-parser) ... JSON, JSONC and JSON5 parser for use with ESLint plugins.
- [yaml-eslint-parser](https://github.com/ota-meshi/yaml-eslint-parser) ... YAML parser for use with ESLint plugins.
- [toml-eslint-parser](https://github.com/ota-meshi/toml-eslint-parser) ... TOML parser for use with ESLint plugins.

## :lock: License

See the [LICENSE](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/LICENSE) file for license rights and limitations (MIT).

[json]: https://json.org/
[jsonc]: https://github.com/microsoft/node-jsonc-parser
[json5]: https://json5.org/
[jsonc-eslint-parser]: https://github.com/ota-meshi/jsonc-eslint-parser
[eslint-plugin-json-schema-validator]: https://github.com/ota-meshi/eslint-plugin-json-schema-validator
[@intlify/eslint-plugin-vue-i18n]: https://github.com/intlify/eslint-plugin-vue-i18n
[vue i18n]: https://github.com/intlify/vue-i18n-next
