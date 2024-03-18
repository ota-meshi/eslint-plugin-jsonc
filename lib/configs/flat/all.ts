import { rules } from "../../utils/rules";
import base from "./base";
const all: Record<string, string> = {};
for (const rule of rules) {
  if (rule.meta.docs.ruleId === "jsonc/sort-array-values") continue;
  all[rule.meta.docs.ruleId] = "error";
}

export default [
  ...base,
  {
    rules: {
      ...all,
    },
  },
];
