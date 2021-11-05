import type { RuleModule } from "./types"
import { rules as ruleList } from "./utils/rules"
import base from "./configs/base"
import autoConfig from "./configs/auto-config"
import recommendedWithJson from "./configs/recommended-with-json"
import recommendedWithJsonc from "./configs/recommended-with-jsonc"
import recommendedWithJson5 from "./configs/recommended-with-json5"
import prettier from "./configs/prettier"
import all from "./configs/all"

// backward compatibility
import {
    parseForESLint,
    parseJSON,
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
    prettier,
    all,
}

const rules = ruleList.reduce((obj, r) => {
    obj[r.meta.docs.ruleName] = r
    return obj
}, {} as { [key: string]: RuleModule })

export default {
    configs,
    rules,
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
    // as parser
    parseForESLint,
    // tools
    parseJSON,
    traverseNodes,
    getStaticJSONValue,
    // types
    AST,
}
