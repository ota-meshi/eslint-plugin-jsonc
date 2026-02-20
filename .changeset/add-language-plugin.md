---
"eslint-plugin-jsonc": major
---

Add ESLint language plugin support. The plugin now exports a `languages` object that provides language implementations for `json`, `jsonc`, `json5`, and `x`. The shared configurations (`base`, `recommended-with-json`, etc.) now use the `jsonc`-based language implementation by default (via `language: "jsonc/x"` in ESLint flat config) and have been updated to use the new language plugin approach instead of the parser approach.
