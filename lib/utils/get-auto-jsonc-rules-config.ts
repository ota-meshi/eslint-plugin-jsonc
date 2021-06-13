import type { Linter } from "eslint"
import { existsSync, statSync } from "fs"
import { dirname, resolve } from "path"
import type { RuleModule } from "../types"

let configResolver: (filePath: string) => Linter.Config, ruleNames: Set<string>

/**
 * Get config resolver
 */
function getConfigResolver(): (filePath: string) => Linter.Config {
    if (configResolver) {
        return configResolver
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- special
    const plugin = require("..")
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- special
        const eslintrc = require("@eslint/eslintrc")
        const configArrayFactory =
            new eslintrc.Legacy.CascadingConfigArrayFactory({
                additionalPluginPool: new Map([
                    ["eslint-plugin-jsonc", plugin],
                ]),
                eslintRecommendedPath: require.resolve(
                    "../../conf/eslint-recommended.js",
                ),
                eslintAllPath: require.resolve("../../conf/eslint-all.js"),
            })

        return (configResolver = (filePath: string) => {
            const absolutePath = resolve(process.cwd(), filePath)
            return configArrayFactory
                .getConfigArrayForFile(absolutePath)
                .extractConfig(absolutePath)
                .toCompatibleObjectAsConfigFileContent()
        })
    } catch {
        // ignore
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- special
        const eslint = require("eslint")
        const engine = new eslint.CLIEngine({})
        engine.addPlugin("eslint-plugin-jsonc", plugin)
        return (configResolver = (filePath) => {
            return engine.getConfigForFile(filePath)
        })
    } catch {
        // ignore
    }

    return () => ({})
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
    return getConfigResolver()(filename)
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
