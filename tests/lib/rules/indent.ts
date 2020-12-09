import fs from "fs"
import path from "path"
import { RuleTester } from "eslint"
import rule from "../../../lib/rules/indent"

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

const FIXTURE_ROOT = path.resolve(__dirname, "../../fixtures/indent/")

/**
 * Load test patterns from fixtures.
 *
 * - Valid tests:   All codes in FIXTURE_ROOT are valid code.
 * - Invalid tests: There is an invalid test for every valid test. It removes
 *                  all indentations from the valid test and checks whether
 *                  `html-indent` rule restores the removed indentations exactly.
 *
 * If a test has some ignored line, we can't use the mechanism.
 * So `additionalValid` and `additionalInvalid` exist for asymmetry test cases.
 *
 */
function loadPatterns(
    additionalValid: RuleTester.ValidTestCase[],
    additionalInvalid: RuleTester.InvalidTestCase[],
) {
    const valid = fs.readdirSync(FIXTURE_ROOT).map((filename) => {
        const code0 = fs.readFileSync(path.join(FIXTURE_ROOT, filename), "utf8")
        const code = code0
            .replace(/^\/\*(.+?)\*\//u, `/*${filename}*/`)
            .replace(/^<!--(.+?)-->/u, `<!--${filename}-->`)
        const baseObj = JSON.parse(
            /^(?:\/\*|<!--)(.+?)(?:\*\/|-->)/u.exec(code0)![1],
        )
        if ("parser" in baseObj) {
            baseObj.parser = require.resolve(baseObj.parser)
        }
        if ("parserOptions" in baseObj && "parser" in baseObj.parserOptions) {
            baseObj.parserOptions.parser = require.resolve(
                baseObj.parserOptions.parser,
            )
        }
        return Object.assign(baseObj, { code, filename })
    })
    const invalid = valid
        .map((pattern) => {
            const kind =
                (pattern.options && pattern.options[0]) === "tab"
                    ? "tab"
                    : "space"
            const output = pattern.code
            const lines: {
                text: string
                number: number
                indentSize: number
            }[] = output.split("\n").map((text: string, number: number) => ({
                number,
                text,
                indentSize: (/^[ \t]+/u.exec(text) || [""])[0].length,
            }))
            const code = lines
                .map((line) => line.text.replace(/^[ \t]+/u, ""))
                .join("\n")
            const errors = lines
                .map((line) =>
                    line.indentSize === 0
                        ? null
                        : {
                              message: `Expected indentation of ${
                                  line.indentSize
                              } ${kind}${
                                  line.indentSize === 1 ? "" : "s"
                              } but found 0.`,
                              line: line.number + 1,
                          },
                )
                .filter(Boolean)

            return Object.assign({}, pattern, { code, output, errors })
        })
        .filter((test) => test.errors.length > 0) // Empty errors cannot be verified with eslint 7.3.
        .filter(Boolean)

    return {
        valid: valid.concat(additionalValid),
        invalid: invalid.concat(additionalInvalid),
    }
}

/**
 * Prevents leading spaces in a multiline template literal from appearing in the resulting string
 * @param {string[]} strings The strings in the template literal
 * @returns {string} The template literal, with spaces removed from all lines
 */
function unIndent(strings: TemplateStringsArray) {
    const templateValue = strings[0]
    const lines = templateValue
        .replace(/^\n/u, "")
        .replace(/\n\s*$/u, "")
        .split("\n")
    const lineIndents = lines
        .filter((line) => line.trim())
        .map((line) => / */u.exec(line)![0].length)
    const minLineIndent = Math.min.apply(null, lineIndents)

    return lines.map((line) => line.slice(minLineIndent)).join("\n")
}

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run(
    "indent",
    rule as any,
    loadPatterns(
        [
            {
                code: unIndent`
                {
                    /* ✓ GOOD */
                    "GOOD": {
                        "GOOD": "foo"
                    },
                }
                `,
            },
        ],
        [],
    ),
)
