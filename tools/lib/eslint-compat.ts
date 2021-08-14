// @ts-check
import * as eslint from "eslint"

// eslint-disable-next-line @typescript-eslint/no-namespace -- ignore
export namespace ESLint {
    export type LintResult = eslint.ESLint.LintResult
}
// eslint-disable-next-line @typescript-eslint/naming-convention -- ignore
export const ESLint = eslint.ESLint || getESLintClassForV6()
// export const ESLint = getESLintClassForV6()

/** Build the ESLint class that ESLint v6 compatible. */
function getESLintClassForV6(): typeof eslint.ESLint {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- ignore
    const CLIEngine = eslint.CLIEngine
    class ESLintForV6 {
        private readonly engine: eslint.CLIEngine

        public static get version() {
            return CLIEngine.version
        }

        public constructor(options?: eslint.ESLint.Options) {
            const {
                overrideConfig: {
                    plugins,
                    globals,
                    rules,
                    ...overrideConfig
                } = {
                    plugins: [],
                    globals: {},
                    rules: {},
                },
                fix,
                reportUnusedDisableDirectives,
                plugins: pluginsMap,
                ...otherOptions
            } = options || {}
            const newOptions: eslint.CLIEngine.Options = {
                fix: Boolean(fix),
                reportUnusedDisableDirectives: reportUnusedDisableDirectives
                    ? reportUnusedDisableDirectives !== "off"
                    : undefined,
                ...otherOptions,

                globals: globals
                    ? Object.keys(globals).filter((n) => globals[n])
                    : undefined,
                plugins: plugins || [],
                rules: rules
                    ? Object.entries(rules).reduce((o, [ruleId, opt]) => {
                          if (opt) {
                              o[ruleId] = opt
                          }
                          return o
                      }, {} as NonNullable<eslint.CLIEngine.Options["rules"]>)
                    : undefined,
                ...overrideConfig,
            }
            this.engine = new CLIEngine(newOptions)

            for (const [name, plugin] of Object.entries(pluginsMap || {})) {
                this.engine.addPlugin(name, plugin)
            }
        }

        // eslint-disable-next-line @typescript-eslint/require-await -- ignore
        public async lintText(
            ...params: Parameters<eslint.ESLint["lintText"]>
        ): ReturnType<eslint.ESLint["lintText"]> {
            const result = this.engine.executeOnText(
                params[0],
                params[1]?.filePath,
            )
            return result.results
        }

        // eslint-disable-next-line @typescript-eslint/require-await -- ignore
        public async lintFiles(
            ...params: Parameters<eslint.ESLint["lintFiles"]>
        ): ReturnType<eslint.ESLint["lintFiles"]> {
            const result = this.engine.executeOnFiles(
                Array.isArray(params[0]) ? params[0] : [params[0]],
            )
            return result.results
        }

        // eslint-disable-next-line @typescript-eslint/require-await -- ignore
        public static async outputFixes(
            ...params: Parameters<typeof eslint.ESLint["outputFixes"]>
        ): ReturnType<typeof eslint.ESLint["outputFixes"]> {
            return CLIEngine.outputFixes({
                results: params[0],
            } as any)
        }
    }

    const eslintClass = ESLintForV6 as never
    return eslintClass
}
