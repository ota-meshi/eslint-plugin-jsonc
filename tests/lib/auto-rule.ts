import path from "path";
import fs from "fs";
import assert from "assert";
import { ESLint } from "../../tools/lib/eslint-compat";
import plugin from "../../lib/index";

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/integrations/eslint-plugin");
const FIXTURE_ROOT = path.join(TEST_CWD, "./test-auto-rule01/src");

describe("auto rule", () => {
  it("should auto rule enable", async () => {
    const fixtures: { [name: string]: string } = {};
    for (const filename of fs.readdirSync(FIXTURE_ROOT)) {
      const code = fs.readFileSync(path.join(FIXTURE_ROOT, filename), "utf8");
      fixtures[filename] = code;
      const invalidCode = code
        .split("\n")
        .map((line) => line.replace(/^[\t ]+/u, ""))
        .join("\n");
      fs.writeFileSync(path.join(FIXTURE_ROOT, filename), invalidCode, "utf8");
    }

    const engine = new ESLint({
      cwd: TEST_CWD,
      extensions: [".js", ".json"],
      plugins: {
        "eslint-plugin-jsonc": plugin as never,
      },
    });
    const fixEngine = new ESLint({
      cwd: TEST_CWD,
      extensions: [".js", ".json"],
      plugins: {
        "eslint-plugin-jsonc": plugin as never,
      },
      fix: true,
    });
    const resultFixBefore = await engine.lintFiles(["test-auto-rule01/src"]);
    assert.strictEqual(
      resultFixBefore.reduce((s, m) => s + m.errorCount, 0),
      2,
    );

    const resultFixAfter = await fixEngine.lintFiles(["test-auto-rule01/src"]);
    assert.strictEqual(
      resultFixAfter.reduce((s, m) => s + m.errorCount, 0),
      0,
    );
    await ESLint.outputFixes(resultFixAfter);

    for (const filename of Object.keys(fixtures)) {
      const code = fs.readFileSync(path.join(FIXTURE_ROOT, filename), "utf8");
      assert.strictEqual(code, fixtures[filename]);
    }
  });
});
