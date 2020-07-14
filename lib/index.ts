import type { RuleModule } from "./types"
import { rules as ruleList } from "./utils/rules"
import processors from "./processors"
import base from "./configs/base"
import autoConfig from "./configs/auto-config"
import recommendedWithJson from "./configs/recommended-with-json"
import recommendedWithJsonc from "./configs/recommended-with-jsonc"
import recommendedWithJson5 from "./configs/recommended-with-json5"
import { parseForESLint } from "./parser/json-eslint-parser"
import { traverseNodes } from "./parser/traverse"
import { getStaticJSONValue } from "./utils/ast"

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

export = {
    configs,
    rules,
    processors,

    // as parser
    parseForESLint,

    // tools
    traverseNodes,
    getStaticJSONValue,
}
