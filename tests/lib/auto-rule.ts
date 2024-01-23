import path from "path";
import fs from "fs";
import assert from "assert";
import plugin from "../../lib/index";
import { getLegacyESLint, getESLint } from "eslint-compat-utils/eslint";
import semver from "semver";
// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("auto rule", () => {
  const ESLint = getLegacyESLint();
  const TEST_CWD = path.join(
    __dirname,
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

describe("auto rule with flat config", () => {
  const ESLint = getESLint();
  if (semver.satisfies(ESLint.version, "<7.0.0")) return;
  const TEST_CWD = path.join(
    __dirname,
    "../fixtures/integrations/eslint-plugin/test-auto-rule-with-flat-config01",
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
