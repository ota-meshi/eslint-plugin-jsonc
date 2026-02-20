# User Guide

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-jsonc
```

::: tip Requirements

- ESLint v9.38.0 and above
- Node.js v20.x (>=20.19.0), v22.x (>=22.13.0), v24.x and above
:::

## :book: Usage

<!--USAGE_GUIDE_START-->

### Configuration

#### Configuration (`eslint.config.js`)

Use `eslint.config.js` file to configure rules. See also: <https://eslint.org/docs/latest/use/configure/configuration-files-new>.

Example **eslint.config.js**:

```js
import eslintPluginJsonc from 'eslint-plugin-jsonc';
export default [
  // add more generic rule sets here, such as:
  // js.configs.recommended,
  ...eslintPluginJsonc.configs['recommended-with-jsonc'],
  {
    rules: {
      // override/add rules settings here, such as:
    // 'jsonc/rule-name': 'error'
    }
  }
];
```

This plugin provides configs:

- `*.configs.base` ... Configuration to enable correct JSON parsing.
- `*.configs['recommended-with-json']` ... Recommended configuration for JSON.
- `*.configs['recommended-with-jsonc']` ... Recommended configuration for JSONC.
- `*.configs['recommended-with-json5']` ... Recommended configuration for JSON5.
- `*.configs.prettier` ... Turn off rules that may conflict with [Prettier](https://prettier.io/).
- `*.configs.all` ... Enables all rules. It's meant for testing, not for production use because it changes with every minor and major version of the plugin. Use it at your own risk.

For backward compatibility, the `flat/*` prefix is still supported:

- `*.configs['flat/base']`, `*.configs['flat/recommended-with-json']`, etc.

This plugin will parse `.json`, `.jsonc` and `.json5` by default using the configuration provided by the plugin (unless you already have a parser configured - see below).

See [the rule list](../rules/index.md) to get the `rules` that this plugin provides.

#### Languages

This plugin provides the following language identifiers for use in ESLint configurations:

- `jsonc/json` ... JSON files
- `jsonc/jsonc` ... JSONC files
- `jsonc/json5` ... JSON5 files
- `jsonc/x` ... Extended JSON files that accepts any syntax that represents static values ​​parseable by [jsonc-eslint-parser].

For example, to apply settings specifically to JSON files, you can use the `language` field in your ESLint configuration:

```js
import eslintPluginJsonc from 'eslint-plugin-jsonc';
export default [
  {
    files: ["*.json", "**/*.json"],
    plugins: {
      jsonc: eslintPluginJsonc,
    },
    language: "jsonc/x",
  }
]
```

The configuration above is included in the shareable configs provided by this plugin, so using `configs` is generally recommended.

See also <https://eslint.org/docs/latest/use/configure/plugins#specify-a-language>

#### **Experimental** support for `@eslint/json`

We've launched experimental support for [`@eslint/json`].

Configure it as follows:

```js
import json from "@eslint/json";
import jsonc from 'eslint-plugin-jsonc';

export default [
  {
    plugins: {
      json,
      jsonc
    },
  },
  {
    files: ["**/*.json"],
    language: "json/json",
    rules: {
      // 'json/rule-name': 'error',
      // 'jsonc/rule-name': 'error'
    },
  },
  {
    files: ["**/*.jsonc", ".vscode/*.json"],
    language: "json/jsonc",
    rules: {
      // 'json/rule-name': 'error',
      // 'jsonc/rule-name': 'error'
    },
  },
  {
    files: ["**/*.json5"],
    language: "json/json5",
    rules: {
      // 'json/rule-name': 'error',
      // 'jsonc/rule-name': 'error'
    },
  },
];
```

However, we're not yet sure how best to make this work.
Please note that we may change behavior without notice.

[`@eslint/json`]: https://github.com/eslint/json

## :computer: Editor Integrations

### Visual Studio Code

Use the [dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension that Microsoft provides officially.

You have to configure the `eslint.validate` option of the extension to check `.json` files, because the extension targets only `*.js` or `*.jsx` files by default.

Example **.vscode/settings.json**:

```json
{
  "eslint.validate": ["javascript", "javascriptreact", "json", "jsonc", "json5"]
}
```

<!--USAGE_GUIDE_END-->

## :question: FAQ

### How to parse files other than `.json`, `.jsonc` and `.json5`?

This plugin will parse `.json`, `.jsonc` and `.json5` using the configuration provided by the plugin.
To parse other extensions, you need to add a setting to your configuration.

Example **.eslintrc.js**:

```js
module.exports = {
  // ...
  // Add the following settings.
  overrides: [
    {
      files: ["*.json6"], // If you want to parse `.json6`
      parser: "jsonc-eslint-parser", // Set jsonc-eslint-parser.
    },
  ],
}
```

### How to verify JSON using JSON Schema?

You can verify using JSON Schema by checking and installing [eslint-plugin-json-schema-validator]. I believe it will help you.

[eslint-plugin-json-schema-validator]: https://github.com/ota-meshi/eslint-plugin-json-schema-validator
