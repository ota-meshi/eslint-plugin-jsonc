---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/indent"
description: "enforce consistent indentation"
---
# jsonc/indent

> enforce consistent indentation

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces a consistent indentation style. The default style is `4 spaces`.

<eslint-code-block fix>

```json5
/* eslint jsonc/indent: 'error' */
{
    /* ✓ GOOD */
    "GOOD": {
        "GOOD": "foo"
    },

    /* ✗ BAD */
  "BAD": {
          "BAD": "bar"
     }
}
```

</eslint-code-block>

## :wrench: Options

```json
{
  "jsonc/indent": ["error", 4, {}]
}
```

Same as [indent] rule option. See [here](https://eslint.org/docs/rules/indent#options) for details.

- First option ... Sets the indentation style. default `4`  
  Set to `2` if you prefer 2 spaces indentation.  
  Set to `"tab"` if you prefer tab indentation.
- Second option ... You can set the object to customize it further.

## :couple: Related rules

- [indent]

[indent]: https://eslint.org/docs/rules/indent

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/indent.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/indent.js)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/indent)</sup>
