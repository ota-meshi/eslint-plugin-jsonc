# User Guide

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-jsonc
```

::: tip Requirements
- ESLint v6.0.0 and above
- Node.js v8.10.0 and above
:::

## :book: Usage

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

See [the rule list](../rules/README.md) to get the `rules` that this plugin provides.

### Running ESLint from the command line

If you want to run `eslint` from the command line, make sure you include the `.json` extension using [the `--ext` option](https://eslint.org/docs/user-guide/configuring#specifying-file-extensions-to-lint) or a glob pattern, because ESLint targets only `.js` files by default.

Examples:

```bash
eslint --ext .js,.json src
eslint "src/**/*.{js,json}"
```

## :computer: Editor Integrations

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

## :question: FAQ

### How to parse files other than `.json` and `.json5`?

This plugin will parse `.json` and `.json5` using the configuration provided by the plugin.
To parse other extensions, you need to add a setting to your configuration.

Example **.eslintrc.js**:

```js
module.exports = {
  // ...
  // Add the following settings.
  overrides: [
    {
      files: ["*.json6"], // If you want to parse `.json6`
      parser: "eslint-plugin-jsonc", // Set this plugin as a parser.
    },
  ],
}
```

If you want to apply `plugin:jsonc/auto-config` to files with this extension, add the following settings.

```diff
module.exports = {
  // ...
  overrides: [
    {
      files: ["*.json6"],
      parser: "eslint-plugin-jsonc",
+     processor: "jsonc/auto-config",
    },
  ],
}
```
