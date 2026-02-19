---
"eslint-plugin-jsonc": major
---

Add ESLint language plugin support. The plugin now exports a `languages` object with a `jsonc` language implementation that can be used with `language: "jsonc/jsonc"` in ESLint flat config. The shared configurations (`base`, `recommended-with-json`, etc.) have been updated to use the new language plugin approach instead of the parser approach.
