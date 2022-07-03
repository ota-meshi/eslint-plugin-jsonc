import cp from "child_process"
import assert from "assert"
import path from "path"
import { version } from "../../package.json"

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/eslint-plugin-markdown")
const ESLINT = path.join(TEST_CWD, `./node_modules/.bin/eslint`)

describe("Integration with eslint-plugin-markdown", () => {
    let originalCwd: string

    before(() => {
        originalCwd = process.cwd()
        process.chdir(TEST_CWD)
        cp.execSync(`npm i -D ../../../eslint-plugin-jsonc-${version}.tgz`, {
            stdio: "inherit",
        })
        cp.execSync("npm i", { stdio: "inherit" })
    })
    after(() => {
        process.chdir(originalCwd)
    })

    it("should lint errors", () => {
        try {
            const res = cp.execSync(`${ESLINT} "./test.md" --format json`)
            console.log(`${res}`)
        } catch (e: any) {
            const results = JSON.parse(`${e.stdout}`)

            assert.strictEqual(results.length, 1)
            assert.strictEqual(results[0].messages.length, 1)
            assert.strictEqual(
                results[0].messages[0].message,
                "[jsonc/array-bracket-newline] There should be no linebreak before ']'.",
            )
            return
        }
        assert.fail("Expect error")
    })
})
