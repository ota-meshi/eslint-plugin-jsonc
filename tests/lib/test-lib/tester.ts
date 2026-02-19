import * as eslint from "eslint";
import * as jsonParser from "jsonc-eslint-parser";
import semver from "semver";
import { createRequire } from "node:module";
import type { RuleModule } from "../../../lib/types.ts";
import plugin from "../../../lib/index.ts";

const require = createRequire(import.meta.url);

let jsonPlugin: any;
try {
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

  private readonly testerForVue: eslint.RuleTester | null;

  private readonly testerForMomoa: eslint.RuleTester | null;

  public constructor(options?: Options) {
    this._testerOptions = options;
    const { ignoreMomoa, ...rest } = options || {};
    if (isUseJsoncESLintParser(undefined, options)) {
      // Use the new language plugin for non-Vue tests
      this.testerForBase = new eslint.RuleTester({
        ...rest,
        plugins: {
          ...((rest as any).plugins || {}),
          jsonc: plugin,
        },
        language: "jsonc/jsonc",
        languageOptions: {
          ...rest?.languageOptions,
          parser: undefined,
        },
      });
      // Keep a parser-based tester for Vue file tests
      this.testerForVue = new eslint.RuleTester(rest);
    } else {
      this.testerForBase = new eslint.RuleTester(rest);
      this.testerForVue = null;
    }
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
    const nonVueValid = tests.valid.filter(
      (test) => !isUseVueParser(test),
    );
    const nonVueInvalid = tests.invalid.filter(
      (test) => !isUseVueParser(test),
    );
    const vueValid = tests.valid.filter((test) => isUseVueParser(test));
    const vueInvalid = tests.invalid.filter((test) => isUseVueParser(test));

    this.testerForBase.run(name, rule as unknown as eslint.Rule.RuleModule, {
      valid: nonVueValid.map((test) => {
        if (typeof test === "string") {
          return test;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- ignore properties
        const { ignoreMomoa, ...rest } = test;
        return rest;
      }),
      invalid: nonVueInvalid.map((test) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- ignore properties
        const { ignoreMomoa, ...rest } = test;
        return rest;
      }),
    });

    if (this.testerForVue && (vueValid.length > 0 || vueInvalid.length > 0)) {
      this.testerForVue.run(name, rule as unknown as eslint.Rule.RuleModule, {
        valid: vueValid.map((test) => {
          if (typeof test === "string") {
            return test;
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars -- ignore properties
          const { ignoreMomoa, ...rest } = test;
          return rest;
        }),
        invalid: vueInvalid.map((test) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars -- ignore properties
          const { ignoreMomoa, ...rest } = test;
          return rest;
        }),
      });
    }

    const momoaValid = nonVueValid.filter((test) => {
      if (typeof test !== "string" && test.ignoreMomoa) {
        return false;
      }
      return isUseJsoncESLintParser(test, this._testerOptions);
    });
    const momoaInvalid = nonVueInvalid.filter((test) => {
      if (test.ignoreMomoa) {
        return false;
      }
      return isUseJsoncESLintParser(test, this._testerOptions);
    });

    if (momoaValid.length === 0 && momoaInvalid.length === 0) {
      return;
    }
    const testerForMomoa = this.testerForMomoa;
    if (!testerForMomoa) return;
    describe(`${name} with momoa`, () => {
      testerForMomoa.run(name, rule as unknown as eslint.Rule.RuleModule, {
        valid: momoaValid.map((test) => {
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
        invalid: momoaInvalid.map((test) => {
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
  test: string | ValidTestCase | InvalidTestCase | undefined,
  testerOptions: eslint.Linter.Config | undefined,
): boolean {
  const testParser =
    test == null || typeof test === "string"
      ? undefined
      : test.languageOptions?.parser;
  const parser = (testParser ?? testerOptions?.languageOptions?.parser) as
    | { meta?: unknown }
    | undefined;
  return parser?.meta === jsonParser.meta;
}

function isUseVueParser(
  test: string | ValidTestCase | InvalidTestCase,
): boolean {
  if (typeof test === "string") return false;
  const parser = test.languageOptions?.parser as
    | { meta?: { name?: string } }
    | undefined;
  return parser?.meta?.name === "vue-eslint-parser";
}

