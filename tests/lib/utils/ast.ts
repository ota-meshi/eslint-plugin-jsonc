import assert from "assert"
import { getStaticJSONValue, isExpression } from "../../../lib/utils/ast"
import { parseForESLint } from "../../../lib/parser/json-eslint-parser"
import espree from "espree"
import { JSONProgram, JSONObjectExpression } from "../../../lib/parser/ast"
import { traverseNodes } from "../../../lib/parser/traverse"

function parse(code: string) {
    const result = parseForESLint(code, {
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
    traverseNodes(result.ast, {
        enterNode(node, parent) {
            ;(node as any).parent = parent
        },
        leaveNode() {
            /* nop */
        },
    })
    return result
}

/**
 * safe replacer
 */
function stringify(value: any): string {
    return JSON.stringify(
        value,
        (_k: string, val: any) => {
            if (typeof val === "number") {
                if (isNaN(val)) {
                    return "__NaN__"
                }
                if (val === Infinity) {
                    return "__Infinity__"
                }
                if (val === -Infinity) {
                    return "__-Infinity__"
                }
            }
            if (typeof val === "bigint") {
                return `${val}n`
            }
            if (typeof val === "undefined") {
                return "__undefined__"
            }

            return val
        },
        2,
    )
}

describe("isExpression", () => {
    for (const code of [
        '{"foo": "bar"}',
        "[]",
        "123",
        "-42",
        "null",
        "false",
        '"str"',
        "`template`",
    ]) {
        it(code, () => {
            const ast: JSONProgram = parse(code).ast as never
            assert.ok(isExpression(ast.body[0].expression))
        })
    }
    it("property is not expression", () => {
        const ast: JSONProgram = parse("{a: 1}").ast as never
        assert.ok(
            !isExpression(
                (ast.body[0].expression as JSONObjectExpression).properties[0],
            ),
        )
    })
    it("property literal key is not expression", () => {
        const ast: JSONProgram = parse('{"a": 1}').ast as never
        assert.ok(
            !isExpression(
                (ast.body[0].expression as JSONObjectExpression).properties[0]
                    .key,
            ),
        )
    })
    it("property key is not expression", () => {
        const ast: JSONProgram = parse("{a: 1}").ast as never
        assert.ok(
            !isExpression(
                (ast.body[0].expression as JSONObjectExpression).properties[0]
                    .key,
            ),
        )
    })
})

describe("getStaticJSONValue", () => {
    for (const code of [
        '{"foo": "bar"}',
        "[123, -42]",
        "[null, true, false]",
    ]) {
        it(code, () => {
            const ast = parse(code).ast
            assert.deepStrictEqual(
                getStaticJSONValue(ast as any),
                JSON.parse(code),
            )
        })
    }
    for (const code of [
        "{foo: `bar`}",
        "[Infinity, NaN, undefined]",
        "[`abc`, + 42]",
        "[1,,,,,5]",
        ...(typeof BigInt === "undefined" ? [] : ["[42n, /reg/]"]),
    ]) {
        it(code, () => {
            const ast = parse(code).ast
            assert.strictEqual(
                stringify(getStaticJSONValue(ast as any)),
                // eslint-disable-next-line no-eval
                stringify(eval(`(${code})`)),
            )
        })
    }

    it("Error on unknown Program", () => {
        const ast = espree.parse("a + b;", {
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
        try {
            getStaticJSONValue(ast as any)
            assert.fail("Expected error")
        } catch {
            // ignore
        }
    })

    it("Error on unknown node", () => {
        const ast = espree.parse("a + b;", {
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
        try {
            getStaticJSONValue(ast.body[0] as any)
            assert.fail("Expected error")
        } catch {
            // ignore
        }
    })
    it("Error on property key", () => {
        const ast: JSONProgram = parse("{a: 1}").ast as never
        try {
            getStaticJSONValue(
                (ast.body[0].expression as JSONObjectExpression).properties[0]
                    .key as any,
            )
            assert.fail("Expected error")
        } catch {
            // ignore
        }
    })
})
