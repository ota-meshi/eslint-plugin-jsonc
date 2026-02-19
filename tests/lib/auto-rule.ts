import path from "node:path";
import fs from "node:fs";
import assert from "node:assert";
import { ESLint } from "eslint";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------
describe("auto rule with flat config", () => {
  const TEST_CWD = path.join(
    dirname,
    "../fixtures/integrations/eslint-plugin/test-auto-rule01",
  );
  const FIXTURE_ROOT = path.join(TEST_CWD, "./src");
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
    });
    const fixEngine = new ESLint({
      cwd: TEST_CWD,
      fix: true,
    });
    const resultFixBefore = await engine.lintFiles(["src"]);
    assert.strictEqual(
      resultFixBefore.reduce((s, m) => s + m.errorCount, 0),
      2,
    );

    const resultFixAfter = await fixEngine.lintFiles(["src"]);
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
