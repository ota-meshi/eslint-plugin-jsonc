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
 * Checks whether the given filename is directory.
 */
function isDirectory(filename: string) {
    return statSync(filename).isDirectory()
}

/**
 * Get config for the given filename
 * @param filename
 */
function getConfig(filename: string) {
    let filePath = filename
    let dir = dirname(filePath)
    while (dir && (!existsSync(dir) || !isDirectory(dir))) {
        const nextDir = dirname(dir)
        if (nextDir === dir) {
            return {}
        }
        filePath = dir
        dir = nextDir
    }
    return getCLIEngine().getConfigForFile(filePath)
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
