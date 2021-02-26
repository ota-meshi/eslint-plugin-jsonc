---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/object-property-newline"
description: "enforce placing object properties on separate lines"
since: "v0.1.0"
---
# jsonc/object-property-newline

> enforce placing object properties on separate lines

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule permits you to restrict the locations of property specifications in object literals. You may prohibit any part of any property specification from appearing on the same line as any part of any other property specification. You may make this prohibition absolute, or, by invoking an object option, you may allow an exception, permitting an object literal to have all parts of all of its property specifications on a single line.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/object-property-newline: 'error' */
{
    /* ✓ GOOD */
    "GOOD": {
        "foo": "foo",
        "bar": "bar",
        "baz": "baz"
    },

    /* ✗ BAD */
    "BAD": {
        "foo": "foo", "bar": "bar", "baz": "baz"
    }
}
```

</eslint-code-block>

## :wrench: Options

Same as [object-property-newline] rule option. See [here](https://eslint.org/docs/rules/object-property-newline#optional-exception) for details. 

## :couple: Related rules

- [object-property-newline]

[object-property-newline]: https://eslint.org/docs/rules/object-property-newline

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/object-property-newline.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/object-property-newline.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/object-property-newline)</sup>
