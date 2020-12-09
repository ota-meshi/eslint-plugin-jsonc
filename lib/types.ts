import type { JSONSchema4 } from "json-schema"
import type { Rule } from "eslint"
export interface RuleListener {
    [key: string]: ((node: never) => void) | undefined
}

export interface RuleModule {
    meta: RuleMetaData
    create(context: Rule.RuleContext): RuleListener
}

export interface RuleMetaData {
    docs: {
        description: string
        recommended: ("json" | "jsonc" | "json5")[] | null
        url: string
        ruleId: string
        ruleName: string
        replacedBy?: []
        default?: "error" | "warn"
        extensionRule: boolean
    }
    messages: { [messageId: string]: string }
    fixable?: "code" | "whitespace"
    schema: JSONSchema4 | JSONSchema4[]
    deprecated?: boolean
    type: "problem" | "suggestion" | "layout"
}

export interface PartialRuleModule {
    meta: PartialRuleMetaData
    create(context: Rule.RuleContext): RuleListener
}

export interface PartialRuleMetaData {
    docs: {
        description: string
        recommended: ("json" | "jsonc" | "json5")[] | null
        replacedBy?: []
        default?: "error" | "warn"
        extensionRule: boolean
    }
    messages: { [messageId: string]: string }
    fixable?: "code" | "whitespace"
    schema: JSONSchema4 | JSONSchema4[]
    deprecated?: boolean
    type: "problem" | "suggestion" | "layout"
}
