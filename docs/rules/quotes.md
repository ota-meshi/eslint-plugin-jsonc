---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/quotes"
description: "enforce use of double or single quotes"
since: "v0.1.0"
---
# jsonc/quotes

> enforce use of double or single quotes

- :gear: This rule is included in `"plugin:jsonc/recommended-with-json"` and `"plugin:jsonc/recommended-with-jsonc"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces the use of double or single quotes.

JSON5 allows you to define a string in one of two ways: double quotes or single quotes.  
However, JSON and JSONC can only use double quotes.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/quotes: 'error' */
{
    /* ✓ GOOD */
    "GOOD": "foo",

    /* ✗ BAD */
    'BAD': 'bar'
}
```

</eslint-code-block>

## :wrench: Options

```json
{
    "jsonc/quotes": ["error",
        "double",
        {"avoidEscape": false}
    ]
}
```

This rule has two options, a string option and an object option.

String option:

- `"double"` (default) ... requires the use of double quotes wherever possible
- `"single"` ... requires the use of single quotes wherever possible

Object option:

- `"avoidEscape"` ... if `true`, allows strings to use single-quotes or double-quotes so long as the string contains a quote that would have to be escaped otherwise. default `false`

See [here](https://eslint.org/docs/rules/quotes#options) for details.

## :couple: Related rules

- [quotes]

[quotes]: https://eslint.org/docs/rules/quotes

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/quotes.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/quotes.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/quotes)</sup>
