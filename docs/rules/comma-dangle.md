---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/comma-dangle"
description: "require or disallow trailing commas"
since: "v0.1.0"
---
# jsonc/comma-dangle

> require or disallow trailing commas

- :gear: This rule is included in `"plugin:jsonc/recommended-with-json"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces consistent use of trailing commas in object and array literals.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/comma-dangle: 'error' */
{
    /* ✓ GOOD */
    "GOOD": {
        "foo": "bar"
    },

    /* ✗ BAD */
    "BAD": {
        "foo": "bar",
    },
}
```

</eslint-code-block>

## :wrench: Options

<!-- eslint-skip -->

```json
{
    "jsonc/comma-dangle": ["error",
        "never"
    ],
    // or
    "jsonc/comma-dangle": ["error",
        {
            "arrays": "never",
            "objects": "never"
        }
    ]
}
```

Same as [comma-dangle] rule option. See [here](https://eslint.org/docs/rules/comma-dangle#options) for details.

- `"never"` (default) ... disallows trailing commas
- `"always"` ... requires trailing commas
- `"always-multiline"` ... requires trailing commas when the last element or property is in a *different* line than the closing `]` or `}` and disallows trailing commas when the last element or property is on the *same* line as the closing `]` or `}`
- `"only-multiline"` ... allows (but does not require) trailing commas when the last element or property is in a *different* line than the closing `]` or `}` and disallows trailing commas when the last element or property is on the *same* line as the closing `]` or `}`

You can also use an object option to configure this rule for each type of syntax.

## :couple: Related rules

- [comma-dangle]

[comma-dangle]: https://eslint.org/docs/rules/comma-dangle

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/comma-dangle.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/comma-dangle.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/comma-dangle)</sup>
