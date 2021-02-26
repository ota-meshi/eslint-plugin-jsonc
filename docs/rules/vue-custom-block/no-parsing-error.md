---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/vue-custom-block/no-parsing-error"
description: "disallow parsing errors in Vue custom blocks"
since: "v0.8.0"
---
# jsonc/vue-custom-block/no-parsing-error

> disallow parsing errors in Vue custom blocks

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.

## :book: Rule Details

This rule reports JSON parsing errors in Vue custom blocks.

<eslint-code-block parser="vue-eslint-parser" file-name="sample.vue" language="html">

<!-- eslint-skip -->

```vue
<i18n>
{ "foo": }
</i18n>

<my-block lang="json">
{ "foo": }
</my-block>

<script>
/* eslint jsonc/vue-custom-block/no-parsing-error: 'error' */
</script>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.8.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/vue-custom-block/no-parsing-error.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/vue-custom-block/no-parsing-error.ts)
