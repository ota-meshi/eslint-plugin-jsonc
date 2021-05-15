import type { Linter, CLIEngine } from "eslint"
import { existsSync, statSync } from "fs"
import { dirname } from "path"
import type { RuleModule } from "../types"

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
 * Checks if the given file name can get the configuration.
 */
function isValidFilename(filename: string) {
    const dir = dirname(filename)
    if (existsSync(dir) && statSync(dir).isDirectory()) {
        if (existsSync(filename) && statSync(filename).isDirectory()) {
            return false
        }
        return true
    }

    return false
}

/**
 * Get config for the given filename
 * @param filename
 */
function getConfig(filename: string): Linter.Config {
    while (!isValidFilename(filename)) {
        const dir = dirname(filename)
        if (dir === filename) {
            return {}
        }
        // eslint-disable-next-line no-param-reassign -- ignore
        filename = dir
    }
    return getCLIEngine().getConfigForFile(filename)
}

/**
 * Get jsonc rule from the given base rule name
 * @param filename
 */
function getJsoncRule(rule: string) {
    ruleNames =
        ruleNames ||
        new Set(
            // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- special
            (require("./rules").rules as RuleModule[]).map(
                (r) => r.meta.docs.ruleName,
            ),
        )

    return ruleNames.has(rule) ? `jsonc/${rule}` : null
}

/**
 * Get additional jsonc rules config from fileName
 * @param filename
 */
export function getAutoConfig(filename: string): {
    [name: string]: Linter.RuleEntry
} {
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
