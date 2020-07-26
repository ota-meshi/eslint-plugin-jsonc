import assert from "assert"
import path from "path"
import fs from "fs"

import { parseJSON } from "../../../lib/index"

const FIXTURE_ROOT = path.resolve(__dirname, "../../fixtures/parser/ast")

/**
 * Remove `parent` proeprties from the given AST.
 */
function replacer(key: string, value: any) {
    if (key === "parent") {
        return undefined
    }
    if (value instanceof RegExp) {
        return String(value)
    }
    if (typeof value === "bigint") {
        return null // Make it null so it can be checked on node8.
        // return `${String(value)}n`
    }
    return value
}

function parse(code: string) {
    return parseJSON(code, { ecmaVersion: 2020 })
}

describe("Check for AST.", () => {
    for (const filename of fs
        .readdirSync(FIXTURE_ROOT)
        .filter(
            (f) =>
                f.endsWith("input.json5") ||
                f.endsWith("input.json6") ||
                f.endsWith("input.jsonx"),
        )) {
        it(filename, () => {
            const inputFileName = path.join(FIXTURE_ROOT, filename)
            const outputFileName = inputFileName.replace(
                /input\.json[56x]$/u,
                "output.json",
            )

            const input = fs.readFileSync(inputFileName, "utf8")
            const ast = parse(input)
            const astJson = JSON.stringify(ast, replacer, 2)
            const output = fs.readFileSync(outputFileName, "utf8")
            assert.strictEqual(astJson, output)

            assert.strictEqual(ast.range[1] - ast.range[0], input.length)
        })
    }
})
