import path from "node:path";
import fs from "node:fs";
import os from "node:os";
// import eslint from "eslint"
import { rules } from "./lib/load-rules.ts";
import type { RuleModule } from "../lib/types.ts";
import { fileURLToPath } from "node:url";
const isWin = os.platform().startsWith("win");

const dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIGS = {
  json: {
    filter(rule: RuleModule) {
      return (
        rule.meta.docs.recommended &&
        !rule.meta.deprecated &&
        rule.meta.docs.recommended.includes("json")
      );
    },
    option(rule: RuleModule) {
      return rule.meta.docs.default || "error";
    },
    config: "recommended-with-json",
  },
  jsonc: {
    filter(rule: RuleModule) {
      return (
        rule.meta.docs.recommended &&
        !rule.meta.deprecated &&
        rule.meta.docs.recommended.includes("jsonc")
      );
    },
    option(rule: RuleModule) {
      return rule.meta.docs.default || "error";
    },
    config: "recommended-with-jsonc",
  },
  json5: {
    filter(rule: RuleModule) {
      return (
        rule.meta.docs.recommended &&
        !rule.meta.deprecated &&
        rule.meta.docs.recommended.includes("json5")
      );
    },
    option(rule: RuleModule) {
      return rule.meta.docs.default || "error";
    },
    config: "recommended-with-json5",
  },
  prettier: {
    filter(rule: RuleModule) {
      return rule.meta.docs.layout;
    },
    option(_rule: RuleModule) {
      return "off";
    },
    config: "prettier",
  },
};

for (const rec of ["json", "jsonc", "json5", "prettier"] as const) {
  let content = `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
import type { Linter } from "eslint";
import base from './base';
export default [
  ...base,
  {
    rules: {
        // eslint-plugin-jsonc rules
        ${rules
          .filter(CONFIGS[rec].filter)
          .map((rule) => {
            return `"${rule.meta.docs.ruleId}": "${CONFIGS[rec].option(rule)}"`;
          })
          .join(",\n")}
    },
  }
] satisfies Linter.FlatConfig[]
`;

  const filePath = path.resolve(
    dirname,
    `../lib/configs/flat/${CONFIGS[rec].config}.ts`,
  );

  if (isWin) {
    content = content
      .replace(/\r?\n/gu, "\n")
      .replace(/\r/gu, "\n")
      .replace(/\n/gu, "\r\n");
  }

  // Update file.
  fs.writeFileSync(filePath, content);
}
