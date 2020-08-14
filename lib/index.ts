import type { RuleModule } from "./types"
import { rules as ruleList } from "./utils/rules"
import processors from "./processors"
import base from "./configs/base"
import autoConfig from "./configs/auto-config"
import recommendedWithJson from "./configs/recommended-with-json"
import recommendedWithJsonc from "./configs/recommended-with-jsonc"
import recommendedWithJson5 from "./configs/recommended-with-json5"
// backward compatibility
import {
    parseForESLint,
    traverseNodes,
    AST,
    getStaticJSONValue,
} from "jsonc-eslint-parser"

const configs = {
    base,
    "auto-config": autoConfig,
    "recommended-with-json": recommendedWithJson,
    "recommended-with-jsonc": recommendedWithJsonc,
    "recommended-with-json5": recommendedWithJson5,
}

const rules = ruleList.reduce((obj, r) => {
    obj[r.meta.docs.ruleName] = r
    return obj
}, {} as { [key: string]: RuleModule })

export default {
    configs,
    rules,
    processors,
    // as parser
    parseForESLint,
    // tools
    parseJSON,
    traverseNodes,
    getStaticJSONValue,
}
export {
    configs,
    rules,
    processors,
    // as parser
    parseForESLint,
    // tools
    parseJSON,
    traverseNodes,
    getStaticJSONValue,
    // types
    AST,
}

/**
 * Parse JSON source code
 */
function parseJSON(code: string, options?: any): AST.JSONProgram {
    const parserOptions = Object.assign(
        { filePath: "<input>", ecmaVersion: 2019 },
        options || {},
        {
            loc: true,
            range: true,
            raw: true,
            tokens: true,
            comment: true,
            eslintVisitorKeys: true,
            eslintScopeManager: true,
        },
    )

    return parseForESLint(code, parserOptions).ast as never
}
