import type { RuleModule } from "../../../lib/types.ts";
import assert from "node:assert";
import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";

import { getRules } from "../../../lib/utils/rules.ts";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @returns {Array} Get the list of rules placed in the directory.
 */
function getDirRules() {
  const rules: { [key: string]: RuleModule } = {};

  const rulesRoot = path.resolve(dirname, "../../../lib/rules");
  for (const filename of fs
    .readdirSync(rulesRoot)
    .filter((n) => n.endsWith(".ts"))) {
    const ruleName = filename.replace(/\.ts$/u, "");
    const ruleId = `jsonc/${ruleName}`;

    const rule = require(path.join(rulesRoot, filename)).default;
    rules[ruleId] = rule;
  }

  const vueCustomBlockRulesLibRoot = path.resolve(
    dirname,
    "../../../lib/rules/vue-custom-block",
  );
  for (const filename of fs.readdirSync(vueCustomBlockRulesLibRoot)) {
    const ruleName = `vue-custom-block/${filename.replace(/\.ts$/u, "")}`;
    const ruleId = `jsonc/${ruleName}`;

    const rule = require(
      path.join(vueCustomBlockRulesLibRoot, filename),
    ).default;
    rules[ruleId] = rule;
  }
  return rules;
}

const dirRules = getDirRules();

describe("Check that all the rules have the correct names.", () => {
  for (const ruleId of Object.keys(dirRules)) {
    it(ruleId, () => {
      const rule = dirRules[ruleId];
      assert.strictEqual(rule.meta.docs.ruleId, ruleId);
    });
  }
});

describe("Check if the strict of all rules is correct", () => {
  it("rule count equals", () => {
    assert.ok(
      getRules().length === Object.keys(dirRules).length,
      `Did not equal the number of rules. expect:${
        Object.keys(dirRules).length
      } actual:${getRules().length}`,
    );
  });

  for (const rule of getRules()) {
    it(rule.meta.docs.ruleId, () => {
      assert.ok(Boolean(rule.meta.docs.ruleId), "Did not set `ruleId`");
      assert.ok(Boolean(rule.meta.docs.ruleName), "Did not set `ruleName`");
      assert.ok(Boolean(dirRules[rule.meta.docs.ruleId]), "Did not exist rule");
    });

    describe("Check if the messages are correct", () => {
      describe(rule.meta.docs.ruleId, () => {
        if (!rule.meta.messages) {
          return;
        }
        for (const messageId of Object.keys(rule.meta.messages)) {
          it(messageId, () => {
            const message = rule.meta.messages?.[messageId];
            assert.ok(
              message?.endsWith(".") || message?.endsWith("}}"),
              "Doesn't end with a dot.",
            );
          });
        }
      });
    });
  }
});
