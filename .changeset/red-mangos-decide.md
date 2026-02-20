---
"eslint-plugin-jsonc": minor
---

The JSONCSourceCode, JSONCToken, and JSONCComment types are now provided. Using these types, you can define a RuleContext type that is useful for creating JSON rules.

e.g.

```ts
import type * as core from "@eslint/core";
export type RuleContext<RuleOptions extends unknown[] = unknown[]> =
  core.RuleContext<{
    LangOptions: JSONCLanguageOptions;
    Code: JSONCSourceCode;
    RuleOptions: RuleOptions;
    Node: JSONCNodeOrToken;
    MessageIds: string;
  }>;
```
