import path from "path";
import fs from "fs";

/**
 * Get the all rules
 * @returns {Array} The all rules
 */
function readRules() {
  const rules = [];
  const rulesLibRoot = path.resolve(__dirname, "../../lib/rules");
  for (const name of fs
    .readdirSync(rulesLibRoot)
    .filter((n) => n.endsWith(".ts"))) {
    const ruleName = name.replace(/\.ts$/u, "");
    const ruleId = `jsonc/${ruleName}`;
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- tool
    const rule = require(path.join(rulesLibRoot, name)).default;

    rule.meta.docs.ruleName = ruleName;
    rule.meta.docs.ruleId = ruleId;

    rules.push(rule);
  }
  const vueCustomBlockRulesLibRoot = path.resolve(
    __dirname,
    "../../lib/rules/vue-custom-block"
  );
  for (const name of fs.readdirSync(vueCustomBlockRulesLibRoot)) {
    const ruleName = `vue-custom-block/${name.replace(/\.ts$/u, "")}`;
    const ruleId = `jsonc/${ruleName}`;
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- tool
    const rule = require(path.join(vueCustomBlockRulesLibRoot, name)).default;

    rule.meta.docs.ruleName = ruleName;
    rule.meta.docs.ruleId = ruleId;

    rules.push(rule);
  }
  return rules;
}

export const rules = readRules();
