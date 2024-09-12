import assert from "assert";
import plugin from "../../../lib/index";
import { LegacyESLint, ESLint } from "../test-lib/eslint-compat";

const code = `{ foo: 42 }`;
describe("`recommended-with-json` config", () => {
  it("legacy `recommended-with-json` config should work. ", async () => {
    const linter = new LegacyESLint({
      plugins: {
        svelte: plugin as never,
      },
      baseConfig: {
        // @ts-expect-error -- old ESLint
        parserOptions: {
          ecmaVersion: 2020,
        },
        extends: ["plugin:jsonc/recommended-with-json"],
      },
      useEslintrc: false,
    });
    const result = await linter.lintText(code, { filePath: "test.json" });
    const messages = result[0].messages;

    assert.deepStrictEqual(
      messages.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [
        {
          message: "Unquoted property 'foo' found.",
          ruleId: "jsonc/quote-props",
          line: 1,
        },
      ],
    );
  });
  it("`flat/recommended-with-json` config should work. ", async () => {
    const linter = new ESLint({
      overrideConfigFile: true as never,
      overrideConfig: plugin.configs["flat/recommended-with-json"] as never,
    });
    const result = await linter.lintText(code, { filePath: "test.json" });
    const messages = result[0].messages;

    assert.deepStrictEqual(
      messages.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [
        {
          message: "Unquoted property 'foo' found.",
          ruleId: "jsonc/quote-props",
          line: 1,
        },
      ],
    );

    const resultWithJs = await linter.lintText(";", { filePath: "test.js" });
    const messagesWithJs = resultWithJs[0].messages;

    assert.deepStrictEqual(
      messagesWithJs.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [],
    );
  });
});
