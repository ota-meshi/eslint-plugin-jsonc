import cp from "child_process"
import assert from "assert"
import path from "path"
import plugin from "../../lib/index"

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/vue-eslint-parser-option")

const ESLINT = path.join(TEST_CWD, `./node_modules/eslint`)

describe("Integration with vue-eslint-parser with option", () => {
    let originalCwd: string

    before(() => {
        originalCwd = process.cwd()
        process.chdir(TEST_CWD)
        cp.execSync("npm i", { stdio: "inherit" })
    })
    after(() => {
        process.chdir(originalCwd)
    })

    it("should lint errors", async () => {
        /* eslint-disable  @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports -- test */
        // @ts-ignore
        const eslint = require(ESLINT)
        if (!eslint.ESLint) {
            return
        }
        /* eslint-enable  @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports -- test */
        const engine = new eslint.ESLint({
            cwd: TEST_CWD,
            extensions: [".js", ".json", ".yaml"],
            plugins: {
                "eslint-plugin-jsonc": plugin,
            },
        })
        const results = await engine.lintFiles(["./test.json"])

        assert.strictEqual(results.length, 1)
        assert.strictEqual(results[0].messages.length, 1)
        assert.strictEqual(
            results[0].messages[0].message,
            "Expected indentation of 4 spaces but found 0.",
        )
    })
})
