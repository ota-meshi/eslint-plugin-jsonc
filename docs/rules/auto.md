---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/auto"
description: "apply jsonc rules similar to your configured ESLint core rules"
---
# jsonc/auto

> apply jsonc rules similar to your configured ESLint core rules

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

Automatically apply jsonc rules similar to your configured ESLint core rules to JSON.

This rule checks the ESLint core rules you are already using in your configuration and internally turns ON the [Extension Rules](./README.md#extension-rules) provided by this plugin.

If you already have the `jsonc/*` rule turned ON, that rule will not apply. Instead, that rule will check your JSON.
The rules contained in the sharable configuration work as well. If you use the `"plugin:jsonc/recommended-with-json"` configuration, the `auto` rule will not turn ON the `jsonc/comma-dangle` rule even if you were using the `comma-dangle` rule.

## :wrench: Options

Nothing.

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/auto.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/auto.js)
