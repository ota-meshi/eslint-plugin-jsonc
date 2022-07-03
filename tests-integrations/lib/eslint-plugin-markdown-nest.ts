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
        process.chdir(TEST_CWD)
        cp.execSync(`npm i -D ../../../eslint-plugin-jsonc-${version}.tgz`, {
            stdio: "inherit",
        })
    })
    after(() => {
        process.chdir(originalCwd)
    })

    for (const eslintVersion of [7, 8]) {
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
                        line: message.line,
                    })),
                    [
                        {
                            message: "Strings must use doublequote.",
                            ruleId: "jsonc/quotes",
                            line: 3,
                        },
                        {
                            message: "Strings must use doublequote.",
                            ruleId: "jsonc/quotes",
                            line: 10,
                        },
                    ],
                )
                return
            }
            assert.fail("Expect error")
        })
    }
})
