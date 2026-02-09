import path from "path";
import assert from "assert";
import plugin from "../../lib/index";
import { getLegacyESLint } from "eslint-compat-utils/eslint";
import * as eslint from "eslint";
import semver from "semver";
const ESLint = getLegacyESLint();

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/integrations/eslint-plugin");

describe("Integration with eslint-plugin-jsonc", () => {
  it("should lint without errors", async () => {
    if (semver.satisfies(eslint.Linter.version, ">=10.0.0")) {
      // ESLint 10+ cannot use Legacy Config
      return;
    }
    const engine = new ESLint({
      cwd: TEST_CWD,
      extensions: [".js", ".json"],
      plugins: {
        "eslint-plugin-jsonc": plugin as never,
      },
    });

    const results: readonly eslint.ESLint.LintResult[] = await engine.lintFiles(
      ["test01/src"],
    );
    assert.strictEqual(results.length, 2);
    assert.strictEqual(
      results.reduce((s, m) => s + m.errorCount, 0),
      0,
    );
  });
});
