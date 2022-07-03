import cp from "child_process"
import assert from "assert"
import path from "path"
import { version } from "../../package.json"
import type { ESLint } from "eslint"

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/eslint-plugin-markdown-nest")
const ESLINT = path.join(TEST_CWD, `./node_modules/.bin/eslint`)

describe("Integration with eslint-plugin-markdown with nesting config", () => {
    let originalCwd: string

    before(() => {
        originalCwd = process.cwd()
        // To test ESLint v6, remove `@eslint/eslintrc` module in the root.
        cp.execSync(`npx rimraf node_modules/@eslint/eslintrc`, {
            stdio: "inherit",
        })

        process.chdir(TEST_CWD)
        cp.execSync(`npm i -D ../../../eslint-plugin-jsonc-${version}.tgz`, {
            stdio: "inherit",
        })
    })
    after(() => {
        process.chdir(originalCwd)

        // `npm install` to get the removed module back.
        cp.execSync(`npm i`, {
            stdio: "inherit",
        })
    })

    for (const eslintVersion of [6, 7, 8]) {
        it(`should lint errors with ESLint v${eslintVersion}`, () => {
            cp.execSync(`npm i -D eslint@${eslintVersion}`, {
                stdio: "inherit",
            })
            cp.execSync("npm i", { stdio: "inherit" })

            try {
                const res = cp.execSync(
                    `${ESLINT} "./test.md" --format json --ext .md,.json`,
                )
                console.log(`${res}`)
            } catch (e: any) {
                const results: ESLint.LintResult[] = JSON.parse(`${e.stdout}`)
                assert.deepStrictEqual(
                    results[0].messages.map((message) => ({
                        message: message.message,
                        ruleId: message.ruleId,
                    })),
                    [
                        {
                            message: "Strings must use doublequote.",
                            ruleId: "jsonc/quotes",
                        },
                    ],
                )
                return
            }
            assert.fail("Expect error")
        })
    }
})
