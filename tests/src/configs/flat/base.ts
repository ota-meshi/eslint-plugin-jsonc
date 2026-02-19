import assert from "assert";
import plugin from "../../../../src/index";
import { ESLint } from "eslint";

const code = `{ foo: 42 }`;
describe("`flat/base` config", () => {
  it("`base` config should work. ", async () => {
    const linter = new ESLint({
      overrideConfigFile: true as never,
      overrideConfig: plugin.configs.base as never,
    });
    const result = await linter.lintText(code, { filePath: "test.json" });
    const messages = result[0].messages;

    assert.deepStrictEqual(
      messages.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [],
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
  it("`flat/base` config should work for backward compatibility. ", async () => {
    const linter = new ESLint({
      overrideConfigFile: true as never,
      overrideConfig: plugin.configs["flat/base"] as never,
    });
    const result = await linter.lintText(code, { filePath: "test.json" });
    const messages = result[0].messages;

    assert.deepStrictEqual(
      messages.map((m) => ({
        ruleId: m.ruleId,
        line: m.line,
        message: m.message,
      })),
      [],
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
