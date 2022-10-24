---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-irregular-whitespace"
description: "disallow irregular whitespace"
---

# jsonc/no-irregular-whitespace

> disallow irregular whitespace

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>

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

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-irregular-whitespace.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-irregular-whitespace.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/no-irregular-whitespace)</sup>
