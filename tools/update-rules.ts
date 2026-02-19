import path from "node:path";
import fs from "node:fs";
import os from "node:os";
// import eslint from "eslint"
import { rules } from "./lib/load-rules.ts";
import { fileURLToPath } from "node:url";
const isWin = os.platform().startsWith("win");

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Convert text to camelCase
 */
function camelCase(str: string) {
  return str.replace(/[-/_](\w)/gu, (_, c) => (c ? c.toUpperCase() : ""));
}

let content = `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
import type { RuleModule } from "../types"
${rules
  .map(
    (rule) =>
      `import ${camelCase(rule.meta.docs.ruleName)} from "../rules/${
        rule.meta.docs.ruleName
      }"`,
  )
  .join("\n")}

let rules: RuleModule[] | null = null;
export function getRules(): RuleModule[] {
  if (rules) {
    return rules;
  }
  rules = [
    ${rules.map((rule) => camelCase(rule.meta.docs.ruleName)).join(",\n    ")}
  ] as RuleModule[]
  return rules;
}
`;

if (isWin) {
  content = content
    .replace(/\r?\n/gu, "\n")
    .replace(/\r/gu, "\n")
    .replace(/\n/gu, "\r\n");
}

// Update file.
fs.writeFileSync(path.resolve(dirname, "../lib/utils/rules.ts"), content);

let namesContent = `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
export const ruleNames = [
  ${rules.map((rule) => JSON.stringify(rule.meta.docs.ruleName)).join(",\n  ")}
] as const
`;

if (isWin) {
  namesContent = namesContent
    .replace(/\r?\n/gu, "\n")
    .replace(/\r/gu, "\n")
    .replace(/\n/gu, "\r\n");
}

// Update file.
fs.writeFileSync(
  path.resolve(dirname, "../lib/utils/rule-names.ts"),
  namesContent,
);
