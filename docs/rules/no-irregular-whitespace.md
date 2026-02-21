---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-irregular-whitespace"
description: "disallow irregular whitespace"
since: "v2.5.0"
---

# jsonc/no-irregular-whitespace

> disallow irregular whitespace

- :gear: This rule is included in all of `configs["recommended-with-json"]`, `configs["recommended-with-json5"]` and `configs["recommended-with-jsonc"]`.

## :book: Rule Details

This rule is aimed at catching invalid whitespace that is not a normal tab and space.

<eslint-code-block>

<!-- eslint-skip -->

```json
/* eslint jsonc/no-irregular-whitespace: 'error' */
{
  /* ✓ GOOD */
  "GOOD": "",

  /* ✗ BAD */
  "BAD": "foo",
}
```

</eslint-code-block>

ESLint core [no-irregular-whitespace] rule don't work well in JSON. Turn off that rule in JSON files and use `jsonc/no-irregular-whitespace` rule.

## :wrench: Options

Nothing.

```json
{
  "overrides": [
    {
      "files": ["*.json", "*.json5"],
      "rules": {
        "no-irregular-whitespace": "off",
        "jsonc/no-irregular-whitespace": [
          "error",
          {
            "skipStrings": true,
            "skipComments": false,
            "skipRegExps": false,
            "skipTemplates": false
          }
        ]
      }
    }
  ]
}
```

Same as [no-irregular-whitespace] rule option. See [here](https://eslint.org/docs/rules/no-irregular-whitespace#options) for details.

## :couple: Related rules

- [no-irregular-whitespace]

[no-irregular-whitespace]: https://eslint.org/docs/rules/no-irregular-whitespace

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v2.5.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-irregular-whitespace.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-irregular-whitespace.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/no-irregular-whitespace)</sup>
