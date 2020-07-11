import path from "path"
import fs from "fs"
import assert from "assert"
import { CLIEngine } from "eslint"
import plugin from "../../lib/index"

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/integrations/eslint-plugin")
const FIXTURE_ROOT = path.join(TEST_CWD, "./test-auto-config01/src")

describe("auto-config", () => {
    it("should auto-config enable", () => {
        const fixtures: { [name: string]: string } = {}
        for (const filename of fs.readdirSync(FIXTURE_ROOT)) {
            const code = fs.readFileSync(
                path.join(FIXTURE_ROOT, filename),
                "utf8",
            )
            fixtures[filename] = code
            const invalidCode = code
                .split("\n")
                .map((line) => line.replace(/^[ \t]+/u, ""))
                .join("\n")
            fs.writeFileSync(
                path.join(FIXTURE_ROOT, filename),
                invalidCode,
                "utf8",
            )
        }

        const engine = new CLIEngine({
            cwd: TEST_CWD,
            extensions: [".js", ".json"],
        })
        const fixEngine = new CLIEngine({
            cwd: TEST_CWD,
            extensions: [".js", ".json"],
            fix: true,
        })
        engine.addPlugin("eslint-plugin-jsonc", plugin)
        fixEngine.addPlugin("eslint-plugin-jsonc", plugin)
        const resultFixBefore = engine.executeOnFiles([
            "test-auto-config01/src",
        ])
        assert.strictEqual(resultFixBefore.errorCount, 2)

        const resultFixAfter = fixEngine.executeOnFiles([
            "test-auto-config01/src",
        ])
        assert.strictEqual(resultFixAfter.errorCount, 0)
        CLIEngine.outputFixes(resultFixAfter)

        for (const filename of Object.keys(fixtures)) {
            const code = fs.readFileSync(
                path.join(FIXTURE_ROOT, filename),
                "utf8",
            )
            assert.strictEqual(code, fixtures[filename])
        }
    })
})
