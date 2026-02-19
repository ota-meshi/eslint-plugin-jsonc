---
"eslint-plugin-jsonc": major
---

Convert to ESM-only package. The plugin now uses tsdown for bundling and is distributed as pure ESM. The package no longer supports CommonJS `require()` syntax. Users need to use `import` statements or dynamic `import()` to load the plugin.
