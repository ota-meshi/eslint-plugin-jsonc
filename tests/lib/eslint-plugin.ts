import path from "path";
import assert from "assert";
import { ESLint } from "../../tools/lib/eslint-compat";
import plugin from "../../lib/index";

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/integrations/eslint-plugin");

describe("Integration with eslint-plugin-jsonc", () => {
  it("should lint without errors", async () => {
    const engine = new ESLint({
      cwd: TEST_CWD,
      extensions: [".js", ".json"],
      plugins: {
        "eslint-plugin-jsonc": plugin as never,
      },
    });
    const results = await engine.lintFiles(["test01/src"]);
    assert.strictEqual(results.length, 2);
    assert.strictEqual(
      results.reduce((s, m) => s + m.errorCount, 0),
      0,
    );
  });
});
