import assert from "node:assert";
import plugin from "../../../lib/index.ts";
import { ESLint } from "eslint";
import { builtinRules } from "eslint/use-at-your-own-risk";

describe("Test to make sure that ESLint core rules don't crash with language: 'jsonc/jsonc'", () => {
  const code = `{"key": "value", "number": 42, "array": [1, 2, 3]}`;

  for (const [ruleId] of builtinRules) {
    it(`ESLint core rule '${ruleId}' should not crash`, async () => {
      const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
          {
            plugins: {
              jsonc: plugin,
            },
            files: ["**/*.json"],
            language: "jsonc/jsonc",
            rules: {
              [ruleId]: "error",
            },
          },
        ],
      });

      // Make sure linting can be performed without crashing
      const results = await eslint.lintText(code, { filePath: "test.json" });

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 1);
    });
  }
});
