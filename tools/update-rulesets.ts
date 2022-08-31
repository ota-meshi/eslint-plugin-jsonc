import path from "path";
import fs from "fs";
import os from "os";
// import eslint from "eslint"
import { rules } from "./lib/load-rules";
import type { RuleModule } from "../lib/types";
const isWin = os.platform().startsWith("win");

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
  let content = `
import path from "path"
const base = require.resolve("./base")
const baseExtend =
    path.extname(\`\${base}\`) === ".ts" ? "plugin:jsonc/base" : base
export = {
    extends: [baseExtend],
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
`;

  const filePath = path.resolve(
    __dirname,
    `../lib/configs/${CONFIGS[rec].config}.ts`
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
