# User Guide

## Installation

```bash
npm install --save-dev eslint eslint-plugin-jsonc
```

::: tip Requirements
- ESLint v6.0.0 and above
- Node.js v8.10.0 and above
:::

## Usage

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
