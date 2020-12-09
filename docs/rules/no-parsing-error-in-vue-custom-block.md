---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-parsing-error-in-vue-custom-block"
description: "disallow parsing errors in vue custom blocks"
---
# jsonc/no-parsing-error-in-vue-custom-block

> disallow parsing errors in vue custom blocks

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.

## :book: Rule Details

This rule reports JSON parsing errors in Vue custom blocks.

<eslint-code-block parser="vue-eslint-parser" file-name="sample.vue" language="html">

```vue
<i18n>
{ "foo": }
</i18n>

<my-block lang="json">
{ "foo": }
</my-block>

<script>
/* eslint jsonc/no-parsing-error-in-vue-custom-block: 'error' */
</script>
```

</eslint-code-block>

## :wrench: Options

Nothing.

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-parsing-error-in-vue-custom-block.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-parsing-error-in-vue-custom-block.js)
