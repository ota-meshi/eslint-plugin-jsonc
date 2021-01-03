import cp from "child_process"
import assert from "assert"
import path from "path"
import plugin from "../../lib/index"

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/eslint-plugin-markdown")

const ESLINT = path.join(TEST_CWD, `./node_modules/eslint`)

describe("Integration with eslint-plugin-markdown", () => {
    let originalCwd: string

    before(() => {
        originalCwd = process.cwd()
        process.chdir(TEST_CWD)
        cp.execSync("npm i", { stdio: "inherit" })
    })
    after(() => {
        process.chdir(originalCwd)
    })

    it("should lint without errors", () => {
        /* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports -- test */
        // @ts-ignore
        const eslint = require(ESLINT)
        /* eslint-enable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports -- test */
        const engine = new eslint.CLIEngine({
            cwd: TEST_CWD,
            extensions: [".js", ".json", ".yaml"],
        })
        engine.addPlugin("eslint-plugin-jsonc", plugin)
        const r = engine.executeOnFiles(["./test.md"])

        assert.strictEqual(r.results.length, 1)
        assert.strictEqual(r.results[0].messages.length, 1)
        assert.strictEqual(
            r.results[0].messages[0].message,
            "[jsonc/array-bracket-newline] There should be no linebreak before ']'.",
        )
    })
})
