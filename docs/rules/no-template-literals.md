---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-template-literals"
description: "disallow template literals"
since: "v0.2.0"
---
# jsonc/no-template-literals

> disallow template literals

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports the use of template literals.

JSON, JSONC and JSON5 do not allow template literal.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-template-literals: 'error' */
{
    /* ✓ GOOD */
    "GOOD": "foo",

    /* ✗ BAD */
    "BAD": `bar`
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-template-literals.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-template-literals.ts)
