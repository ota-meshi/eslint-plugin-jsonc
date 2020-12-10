import type { Linter, CLIEngine } from "eslint"
import { rules } from "../utils/rules"

let engine: CLIEngine, ruleNames: Set<string>

/**
 * Get CLIEngine instance
 */
function getCLIEngine() {
    if (engine) {
        return engine
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- special
    engine = new (require("eslint").CLIEngine)({})
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- special
    engine.addPlugin("eslint-plugin-jsonc", require(".."))
    return engine
}

/**
 * Get config for the given filename
 * @param filename
 */
function getConfig(filename: string) {
    return getCLIEngine().getConfigForFile(filename)
}

/**
 * Get jsonc rule from the given base rule name
 * @param filename
 */
function getJsoncRule(rule: string) {
    ruleNames = ruleNames || new Set(rules.map((r) => r.meta.docs.ruleName))

    return ruleNames.has(rule) ? `jsonc/${rule}` : null
}

/**
 * Get additional jsonc rules config from fileName
 * @param filename
 */
export function getAutoConfig(
    filename: string,
): { [name: string]: Linter.RuleEntry } {
    const autoConfig: { [name: string]: Linter.RuleEntry } = {}

    const config = getConfig(filename)
    if (config.rules) {
        for (const ruleName of Object.keys(config.rules)) {
            const jsoncName = getJsoncRule(ruleName)
            if (jsoncName && !config.rules[jsoncName]) {
                const entry = config.rules[ruleName]
                if (entry && entry !== "off") {
                    autoConfig[jsoncName] = entry
                }
            }
        }
    }
    return autoConfig
}
