import type { Linter } from "eslint"
import { getAutoConfig } from "../utils/get-auto-jsonc-rules-config"

const targetCache = new Map<string, { prefix: string; code: string }>()
export = {
    preprocess(code: string, filename: string): string[] {
        const config = getAutoConfig(filename)
        if (Object.keys(config).length) {
            const prefix = `/*eslint ${JSON.stringify(config)}*/\n\n\n`
            targetCache.set(filename, { prefix, code })
            return [`${prefix}${code}`]
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
