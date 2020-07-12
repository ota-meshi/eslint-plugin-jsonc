import path from "path"
import fs from "fs"

import { parseForESLint } from "../lib/parser/json-eslint-parser"

const FIXTURE_ROOT = path.resolve(__dirname, "../tests/fixtures/parser/ast")

/**
 * Remove `parent` proeprties from the given AST.
 */
function replacer(key: string, value: any) {
    if (key === "parent") {
        return undefined
    }
    return value
}

/**
 * Parse
 */
function parse(code: string) {
    return parseForESLint(code, {
        comment: true,
        ecmaVersion: 2019,
        eslintScopeManager: true,
        eslintVisitorKeys: true,
        filePath: "test.json",
        loc: true,
        range: true,
        raw: true,
        tokens: true,
    })
}

for (const filename of fs
    .readdirSync(FIXTURE_ROOT)
    .filter((f) => f.endsWith("input.json5"))) {
    const inputFileName = path.join(FIXTURE_ROOT, filename)
    const outputFileName = inputFileName.replace(
        /input\.json5$/u,
        "output.json",
    )

    const input = fs.readFileSync(inputFileName, "utf8")
    try {
        const ast = JSON.stringify(parse(input).ast, replacer, 2)
        fs.writeFileSync(outputFileName, ast, "utf8")
    } catch (e) {
        fs.writeFileSync(
            outputFileName,
            `${e.message}@line:${e.lineNumber},column:${e.column}`,
            "utf8",
        )
    }
}
