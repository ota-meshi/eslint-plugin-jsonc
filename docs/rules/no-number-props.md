---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-number-props"
description: "disallow number property keys"
since: "v0.2.0"
---
# jsonc/no-number-props

> disallow number property keys

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports the use of number property keys.

JSON, JSONC and JSON5 do not allow number property keys.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-number-props: 'error' */
{
    /* ✓ GOOD */
    "GOOD": {
      "42": "foo"
    },

    /* ✗ BAD */
    "BAD": {
      42: "foo"
    }
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-number-props.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-number-props.ts)
