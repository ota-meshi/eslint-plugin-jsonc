import assert from "assert"
import path from "path"
import fs from "fs"

import { parseForESLint } from "../../../lib/parser/json-eslint-parser"

const FIXTURE_ROOT = path.resolve(__dirname, "../../fixtures/parser/ast")

/**
 * Remove `parent` proeprties from the given AST.
 */
function replacer(key: string, value: any) {
    if (key === "parent") {
        return undefined
    }
    return value
}

function parse(code: string) {
    return parseForESLint(code, {
        comment: true,
        ecmaVersion: 2020,
        eslintScopeManager: true,
        eslintVisitorKeys: true,
        filePath: "test.json",
        loc: true,
        range: true,
        raw: true,
        tokens: true,
    })
}

describe("Check for AST.", () => {
    for (const filename of fs
        .readdirSync(FIXTURE_ROOT)
        .filter((f) => f.endsWith("input.json5"))) {
        it(filename, () => {
            const inputFileName = path.join(FIXTURE_ROOT, filename)
            const outputFileName = inputFileName.replace(
                /input\.json5$/u,
                "output.json",
            )

            const input = fs.readFileSync(inputFileName, "utf8")
            const ast = JSON.stringify(parse(input).ast, replacer, 2)
            const output = fs.readFileSync(outputFileName, "utf8")
            assert.strictEqual(ast, output)
        })
    }
})
