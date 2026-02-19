import { getRules } from "../../utils/rules";
import base from "./base";
import type { Linter } from "eslint";
const all: Linter.RulesRecord = {};
for (const rule of getRules()) {
  if (rule.meta.docs.ruleId === "jsonc/sort-array-values") continue;
  all[rule.meta.docs.ruleId] = "error";
}

const config: Linter.Config[] = [
  ...base,
  {
    rules: {
      ...all,
    },
  },
];
export default config;
