import type { Linter, CLIEngine } from "eslint"
import { rules } from "../utils/rules"

let engine: CLIEngine
let ruleNames: Set<string>

/**
 * Get CLIEngine instance
 */
function getCLIEngine() {
    if (engine) {
        return engine
    }
    // eslint-disable-next-line @mysticatea/ts/no-require-imports
    engine = new (require("eslint/lib/cli-engine").CLIEngine)({})
    // eslint-disable-next-line @mysticatea/ts/no-require-imports, @mysticatea/ts/no-var-requires
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

const targetCache = new Map<string, { prefix: string; code: string }>()
export = {
    preprocess(code: string, filename: string) {
        const config = getConfig(filename)
        if (config.rules) {
            const autoConfig: { [name: string]: Linter.RuleEntry } = {}
            for (const ruleName of Object.keys(config.rules)) {
                const jsoncName = getJsoncRule(ruleName)
                if (jsoncName && !config.rules[jsoncName]) {
                    const entry = config.rules[ruleName]
                    if (entry && entry !== "off") {
                        autoConfig[jsoncName] = entry
                    }
                }
            }
            if (Object.keys(autoConfig).length) {
                const prefix = `/*eslint ${JSON.stringify(autoConfig)}*/\n\n\n`
                targetCache.set(filename, { prefix, code })
                return [`${prefix}${code}`]
            }
        }
        return [code]
    },

    postprocess(
        messages: Linter.LintMessage[][],
        filename: string,
    ): Linter.LintMessage[] {
        const info = targetCache.get(filename)
        if (info) {
            const offset = info.prefix.length
            targetCache.delete(filename)
            return messages[0]
                .map<Linter.LintMessage | null>((message) => {
                    if (message.line <= 3) {
                        return null
                    }

                    return {
                        ...message,
                        line: message.line - 3,
                        ...(message.endLine != null
                            ? { endLine: message.endLine - 3 }
                            : {}),
                        ...(message.fix != null
                            ? {
                                  fix: {
                                      ...message.fix,
                                      range: [
                                          message.fix.range[0] - offset,
                                          message.fix.range[1] - offset,
                                      ],
                                  },
                              }
                            : {}),
                        ...(message.suggestions != null
                            ? {
                                  suggestions: message.suggestions.map((s) => ({
                                      ...s,
                                      fix: {
                                          ...s.fix,
                                          range: [
                                              s.fix.range[0] - offset,
                                              s.fix.range[1] - offset,
                                          ],
                                      },
                                  })),
                              }
                            : {}),
                    }
                })
                .filter((m): m is Linter.LintMessage => m != null)
        }
        return messages[0]
    },

    supportsAutofix: true,
}
