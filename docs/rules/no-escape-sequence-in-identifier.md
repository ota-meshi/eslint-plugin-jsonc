---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-escape-sequence-in-identifier"
description: "disallow escape sequences in identifiers."
since: "v1.1.0"
---
# jsonc/no-escape-sequence-in-identifier

> disallow escape sequences in identifiers.

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports disallow escape sequences in identifiers.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-escape-sequence-in-identifier: 'error' */
{
    /* ✓ GOOD */
    GOOD: "GOOD",

    /* ✗ BAD */
    \u0042\u{41}\u{44}: "BAD"
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v1.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-escape-sequence-in-identifier.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-escape-sequence-in-identifier.ts)
