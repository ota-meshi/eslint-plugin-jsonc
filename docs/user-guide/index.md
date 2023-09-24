# User Guide

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-jsonc
```

::: tip Requirements

- ESLint v6.0.0 and above
- Node.js v12.22.x, v14.17.x, v16.x and above
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
    "plugin:jsonc/recommended-with-jsonc",
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'jsonc/rule-name': 'error'
  },
};
```

This plugin provides configs:

- `plugin:jsonc/base` ... Configuration to enable correct JSON parsing.
- `plugin:jsonc/recommended-with-json` ... Recommended configuration for JSON.
- `plugin:jsonc/recommended-with-jsonc` ... Recommended configuration for JSONC.
- `plugin:jsonc/recommended-with-json5` ... Recommended configuration for JSON5.
- `plugin:jsonc/prettier` ... Turn off rules that may conflict with [Prettier](https://prettier.io/).
- `plugin:jsonc/all` ... Enables all rules. It's meant for testing, not for production use because it changes with every minor and major version of the plugin. Use it at your own risk.

This plugin will parse `.json`, `.jsonc` and `.json5` by default using the configuration provided by the plugin (unless you already have a parser configured - see below).

See [the rule list](../rules/index.md) to get the `rules` that this plugin provides.

#### Parser Configuration

If you have already specified a parser in your `.eslintrc`, you will also need to manually configure the parser for JSON files (your parser config takes priority over that defined by `extends` shared configs).

For example, if you are using the `"@babel/eslint-parser"`, configure it as follows:

```js
module.exports = {
  // ...
  extends: ["plugin:jsonc/recommended-with-jsonc"],
  // ...
  parser: "@babel/eslint-parser",
  // Add an `overrides` section to add a parser configuration for json.
  overrides: [
    {
      files: ["*.json", "*.json5", "*.jsonc"],
      parser: "jsonc-eslint-parser",
    },
  ],
  // ...
};
```

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
