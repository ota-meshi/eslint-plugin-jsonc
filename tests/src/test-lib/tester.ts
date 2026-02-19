import * as eslint from "eslint";
import * as jsonParser from "jsonc-eslint-parser";
import semver from "semver";
import type { RuleModule } from "../../../src/types";

let jsonPlugin: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- ignore
  jsonPlugin = require("@eslint/json").default;
} catch {
  // ignore
}

export type ValidTestCase = eslint.RuleTester.ValidTestCase & {
  ignoreMomoa?: boolean;
};
export type InvalidTestCase = eslint.RuleTester.InvalidTestCase & {
  ignoreMomoa?: boolean;
};
export type Options = eslint.Linter.Config & {
  ignoreMomoa?: boolean;
};

class JSONRuleTester {
  private readonly _testerOptions: Options | undefined;

  private readonly testerForBase: eslint.RuleTester;

  private readonly testerForMomoa: eslint.RuleTester | null;

  public constructor(options?: Options) {
    this._testerOptions = options;
    const { ignoreMomoa, ...rest } = options || {};
    this.testerForBase = new eslint.RuleTester(rest);
    this.testerForMomoa =
      !ignoreMomoa && semver.satisfies(eslint.ESLint.version, ">=9.6.0")
        ? new eslint.RuleTester({
            ...rest,
            plugins: {
              json: jsonPlugin,
            },
            language: "json/json5",
            languageOptions: {
              ...rest?.languageOptions,
              parser: undefined,
            },
          })
        : null;
  }

  public run<RuleOptions>(
    name: string,
    rule: RuleModule<RuleOptions>,
    tests: {
      valid: (string | ValidTestCase)[];
      invalid: InvalidTestCase[];
    },
  ): void {
    this.testerForBase.run(name, rule as unknown as eslint.Rule.RuleModule, {
      ...tests,
      valid: tests.valid.map((test) => {
        if (typeof test === "string") {
          return test;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- ignore properties
        const { ignoreMomoa, ...rest } = test;
        return rest;
      }),
      invalid: tests.invalid.map((test) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- ignore properties
        const { ignoreMomoa, ...rest } = test;
        return rest;
      }),
    });

    const valid = tests.valid.filter((test) => {
      if (typeof test !== "string" && test.ignoreMomoa) {
        return false;
      }
      return isUseJsoncESLintParser(test, this._testerOptions);
    });
    const invalid = tests.invalid.filter((test) => {
      if (test.ignoreMomoa) {
        return false;
      }
      return isUseJsoncESLintParser(test, this._testerOptions);
    });

    if (valid.length === 0 && invalid.length === 0) {
      return;
    }
    const testerForMomoa = this.testerForMomoa;
    if (!testerForMomoa) return;
    describe(`${name} with momoa`, () => {
      testerForMomoa.run(name, rule as unknown as eslint.Rule.RuleModule, {
        valid: valid.map((test) => {
          if (typeof test === "string") {
            return test;
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars -- ignore properties
          const { ignoreMomoa, ...rest } = test;
          return {
            ...rest,
            plugins: {
              json: jsonPlugin,
            },
            language: "json/json5",
            languageOptions: {
              ...rest.languageOptions,
              parser: undefined,
            },
          };
        }),
        invalid: invalid.map((test) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars -- ignore properties
          const { ignoreMomoa, ...rest } = test;
          return {
            ...rest,
            plugins: {
              json: jsonPlugin,
            },
            language: "json/json5",
            languageOptions: {
              ...rest.languageOptions,
              parser: undefined,
            },
          };
        }),
      });
    });
  }
}

export { JSONRuleTester as RuleTester };

function isUseJsoncESLintParser(
  test: string | ValidTestCase | InvalidTestCase,
  testerOptions: eslint.Linter.Config | undefined,
): boolean {
  const testParser =
    typeof test === "string" ? undefined : test.languageOptions?.parser;
  const parser = (testParser ?? testerOptions?.languageOptions?.parser) as
    | { meta?: unknown }
    | undefined;
  return parser?.meta === jsonParser.meta;
}
