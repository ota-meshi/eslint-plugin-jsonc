import type * as eslint from "eslint";
import { getRuleTester } from "eslint-compat-utils/rule-tester";
import * as jsonParser from "jsonc-eslint-parser";
import jsonPlugin from "@eslint/json";
const RuleTester = getRuleTester();

export type ValidTestCase = eslint.RuleTester.ValidTestCase & {
  ignoreMomoa?: boolean;
};
export type InvalidTestCase = eslint.RuleTester.InvalidTestCase & {
  ignoreMomoa?: boolean;
};

class JSONRuleTester {
  private readonly _testerOptions: eslint.Linter.Config | undefined;

  private readonly testerForBase: eslint.RuleTester;

  private readonly testerForMomoa: eslint.RuleTester;

  public constructor(options?: eslint.Linter.Config) {
    this._testerOptions = options;
    this.testerForBase = new RuleTester(options);
    this.testerForMomoa = new RuleTester({
      ...options,
      plugins: {
        json: jsonPlugin as any,
      },
      language: "json/json5",
      languageOptions: {
        ...options?.languageOptions,
        parser: undefined,
      },
    });
  }

  public run(
    name: string,
    rule: any,
    tests: {
      valid: (string | ValidTestCase)[];
      invalid: InvalidTestCase[];
    },
  ): void {
    this.testerForBase.run(name, rule, tests);

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
    describe(`${name} with momoa`, () => {
      this.testerForMomoa.run(name, rule, {
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
  const parser = testParser ?? testerOptions?.languageOptions?.parser;
  return parser?.meta === jsonParser.meta;
}
