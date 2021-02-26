import type { AST } from "jsonc-eslint-parser"
import { createRule } from "../utils"
import { PatternMatcher } from "eslint-utils"

export default createRule("no-escape-sequence-in-identifier", {
    meta: {
        docs: {
            description: "disallow escape sequences in identifiers.",
            // TODO major version recommended: ["json","jsonc","json5"],
            recommended: null,
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        messages: {
            disallow: "Escape sequence in identifiers should not be used.",
        },
        schema: [],
        type: "problem",
    },
    create(context) {
        const sourceCode = context.getSourceCode()
        return {
            JSONIdentifier(node: AST.JSONIdentifier) {
                verify(node)
            },
        }

        /**
         * verify
         */
        function verify(node: AST.JSONNode) {
            const escapeMatcher = new PatternMatcher(
                /\\u\{[\da-fA-F]+\}|\\u\d{4}/gu,
            )
            const text = sourceCode.text.slice(...node.range)
            for (const match of escapeMatcher.execAll(text)) {
                const start = match.index
                const end = start + match[0].length
                const range: [number, number] = [
                    start + node.range[0],
                    end + node.range[0],
                ]
                context.report({
                    loc: {
                        start: sourceCode.getLocFromIndex(range[0]),
                        end: sourceCode.getLocFromIndex(range[1]),
                    },
                    messageId: "disallow",
                    fix(fixer) {
                        const codePointStr =
                            match[0][2] === "{"
                                ? text.slice(start + 3, end - 1)
                                : text.slice(start + 2, end)
                        const codePoint = Number(`0x${codePointStr}`)
                        return fixer.replaceTextRange(
                            range,
                            String.fromCodePoint(codePoint),
                        )
                    },
                })
            }
        }
    },
})
