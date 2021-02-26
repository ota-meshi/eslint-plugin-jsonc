---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-comments"
description: "disallow comments"
since: "v0.1.0"
---
# jsonc/no-comments

> disallow comments

- :gear: This rule is included in `"plugin:jsonc/recommended-with-json"`.

## :book: Rule Details

This rule reports comments.

Cannot use comments when in JSON.

<eslint-code-block>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-comments: 'error' */
{
    /* ✗ BAD */
    // ✗ BAD
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-comments.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-comments.ts)
