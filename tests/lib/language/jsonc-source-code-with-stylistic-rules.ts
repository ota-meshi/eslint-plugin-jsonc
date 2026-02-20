import assert from "node:assert";
import plugin from "../../../lib/index.ts";
import { ESLint } from "eslint";
import stylistic from "@stylistic/eslint-plugin";

describe("Test to make sure that ESLint Stylistic rules don't crash with language: 'jsonc/x'", () => {
  const code = `{"key": "value", "number": 42, "array": [1, 2, 3]}`;

  for (const [ruleId, rule] of Object.entries(stylistic.rules)) {
    if (rule.meta?.deprecated) continue;
    it(`ESLint Stylistic rule '${ruleId}' should not crash`, async () => {
      const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
          {
            plugins: {
              jsonc: plugin,
              "@stylistic": stylistic,
            },
            files: ["**/*.json"],
            language: "jsonc/x",
            rules: {
              [`@stylistic/${ruleId}`]: "error",
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
