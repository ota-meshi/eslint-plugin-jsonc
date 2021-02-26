---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/quote-props"
description: "require quotes around object literal property names"
since: "v0.1.0"
---
# jsonc/quote-props

> require quotes around object literal property names

- :gear: This rule is included in `"plugin:jsonc/recommended-with-json"` and `"plugin:jsonc/recommended-with-jsonc"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule requires quotes around object literal property names.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/quote-props: 'error' */
{
    /* ✓ GOOD */
    "GOOD": "foo",

    /* ✗ BAD */
    BAD: "bar"
}
```

</eslint-code-block>

## :wrench: Options

```json
{
    "jsonc/quote-props": ["error",
        "always",
        {}
    ]
}
```

Same as [quote-props] rule option. See [here](https://eslint.org/docs/rules/quote-props#options) for details.

This rule has two options, a string option and an object option.

String option:

- `"always"` (default) ... requires quotes around all object literal property names
- `"as-needed"` ... disallows quotes around object literal property names that are not strictly required
- `"consistent"` ... enforces a consistent quote style; in a given object, either all of the properties should be quoted, or none of the properties should be quoted
- `"consistent-as-needed"` ... requires quotes around all object literal property names if any name strictly requires quotes, otherwise disallows quotes around object property names

Object option:

See [here](https://eslint.org/docs/rules/quote-props#options) for details.

## :couple: Related rules

- [quote-props]

[quote-props]: https://eslint.org/docs/rules/quote-props

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/quote-props.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/quote-props.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/quote-props)</sup>
