import path from "path";
import fs from "fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get the all rules
 * @returns {Array} The all rules
 */
function readRules() {
  const rules = [];
  const rulesLibRoot = path.resolve(dirname, "../../lib/rules");
  for (const name of fs
    .readdirSync(rulesLibRoot)
    .filter((n) => n.endsWith(".ts"))) {
    const ruleName = name.replace(/\.ts$/u, "");
    const ruleId = `jsonc/${ruleName}`;

    const rule = require(path.join(rulesLibRoot, name)).default;

    rule.meta.docs.ruleName = ruleName;
    rule.meta.docs.ruleId = ruleId;

    rules.push(rule);
  }
  const vueCustomBlockRulesLibRoot = path.resolve(
    dirname,
    "../../lib/rules/vue-custom-block",
  );
  for (const name of fs.readdirSync(vueCustomBlockRulesLibRoot)) {
    const ruleName = `vue-custom-block/${name.replace(/\.ts$/u, "")}`;
    const ruleId = `jsonc/${ruleName}`;

    const rule = require(path.join(vueCustomBlockRulesLibRoot, name)).default;

    rule.meta.docs.ruleName = ruleName;
    rule.meta.docs.ruleId = ruleId;

    rules.push(rule);
  }
  return rules;
}

export const rules = readRules();
