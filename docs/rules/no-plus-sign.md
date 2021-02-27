---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-plus-sign"
description: "disallow plus sign"
---
# jsonc/no-plus-sign

> disallow plus sign

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule disallow plus sign.

Cannot use plus sign when in JSON and JSONC.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-plus-sign: 'error' */
{
    /* ✓ GOOD */
    "GOOD": 42,

    /* ✗ BAD */
    "BAD": +42
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related rules

- [jsonc/valid-json-number]

[jsonc/valid-json-number]: ./valid-json-number.md

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-plus-sign.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-plus-sign.ts)
