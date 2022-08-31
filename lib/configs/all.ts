import { rules } from "../utils/rules";
import path from "path";
const base = require.resolve("./base");
const baseExtend =
  path.extname(`${base}`) === ".ts" ? "plugin:jsonc/base" : base;

const all: Record<string, string> = {};
for (const rule of rules) {
  if (rule.meta.docs.ruleId === "jsonc/sort-array-values") continue;
  all[rule.meta.docs.ruleId] = "error";
}

export = {
  extends: [baseExtend],
  rules: {
    ...all,
  },
};
