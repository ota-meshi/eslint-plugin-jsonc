---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/auto"
description: "apply jsonc rules similar to your configured ESLint core rules"
since: "v0.8.0"
---
# jsonc/auto

> apply jsonc rules similar to your configured ESLint core rules

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

Automatically apply jsonc rules similar to your configured ESLint core rules to JSON.

This rule checks the ESLint core rules you are already using in your configuration and automatically turns ON the equivalent [Extension Rules](./README.md#extension-rules) provided by this plugin.

If you have already configured a particular jsonc rule, either explicitly or via a shared configuration, then that will take precedence over `jsonc/auto`. For example, if you use the `"plugin:jsonc/recommended-with-json"` configuration, the `auto` rule will not turn ON the `jsonc/comma-dangle` rule even if the `comma-dangle` rule is enabled in your core ESLint config.

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.8.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/auto.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/auto.ts)
