import assert from "node:assert";
import path from "node:path";
import { createRequire } from "node:module";
import rule from "../../../lib/rules/auto.ts";
import * as eslint from "eslint";
import * as jsonParser from "jsonc-eslint-parser";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT_DIR = path.join(dirname, "../../fixtures/auto");

type LinterFunction = (
  code: string,
  filePath: string,
  parser: string | undefined,
) => Promise<{
  messages: eslint.Linter.LintMessage[];
  output: string | undefined;
}>;

function buildLinter(): LinterFunction {
  const plugin = { rules: { auto: rule } };
  const config: eslint.Linter.Config = {
    files: ["*.js", "**/*.js", "*.json", "**/*.json", "*.vue", "**/*.vue"],
    plugins: {
      jsonc: plugin,
    },
    rules: {
      "jsonc/auto": "error",
    } as const,
  };

  return async function lint(
    code: string,
    filePath: string,
    parser: string | undefined,
  ): Promise<{
    messages: eslint.Linter.LintMessage[];
    output: string | undefined;
  }> {
    const parserConfig = {
      files: config.files,
      languageOptions: {
        parser: parser ? require(parser) : jsonParser,
      },
    };
    const engine = new eslint.ESLint({
      cwd: path.dirname(filePath),
      overrideConfig: [config, parserConfig],
    });
    const fixEngine = new eslint.ESLint({
      cwd: path.dirname(filePath),
      fix: true,
      overrideConfig: [config, parserConfig],
    });

    const resultFixBefore = await engine.lintText(code, { filePath });
    assert.strictEqual(resultFixBefore.length, 1);

    const resultFixAfter = await fixEngine.lintText(code, { filePath });
    assert.strictEqual(resultFixAfter.length, 1);
    return {
      messages: resultFixBefore[0].messages,
      output: resultFixAfter[0].output,
    };
  };
}

function run(tests: {
  valid: {
    code: string;
    filename: string;
    languageOptions?: { parser: string };
    only?: boolean;
  }[];
  invalid: {
    code: string;
    filename: string;
    errors: string[];
    output: string;
    languageOptions: { parser: string };
    only?: boolean;
  }[];
}) {
  const lint = buildLinter();

  describe("auto", () => {
    describe("valid", () => {
      for (const test of tests.valid) {
        (test.only ? it.only : it)(`should pass ${test.filename}`, async () => {
          const { messages, output } = await lint(
            test.code,
            test.filename,
            test.languageOptions?.parser,
          );
          assert.deepStrictEqual(messages, []);
          assert.strictEqual(output || "", "");
        });
      }
    });
    describe("invalid", () => {
      for (const test of tests.invalid) {
        (test.only ? it.only : it)(`should fail ${test.filename}`, async () => {
          const { messages, output } = await lint(
            test.code,
            test.filename,
            test.languageOptions?.parser,
          );
          assert.deepStrictEqual(
            messages.map((m) => m.message),
            test.errors,
          );
          assert.strictEqual(output, test.output);
        });
      }
    });
  });
}

run({
  valid: [
    {
      filename: path.join(ROOT_DIR, "test01", "sfc.vue"),
      code: `
<i18n>
{
    "foo": "bar"
}
</i18n>`,
      languageOptions: {
        parser: "vue-eslint-parser",
      },
    },
    {
      filename: path.join(ROOT_DIR, "test03", "test.json"),
      code: `{
                "foo": "bar"
            }
`,
    },
  ],
  invalid: [
    {
      filename: path.join(ROOT_DIR, "test01", "sfc.vue"),
      code: `
<i18n>
{
"foo": "bar"
    }
</i18n>
<block lang="json">
[1,[
    1,
    2 ],2]
</block>
<block lang="json">
{"a":1
    ,"b":2,}
</block>
<block lang="json">
{ "foo": 1,"bar": 2,"foo": 3 }
</block>`,
      output: `
<i18n>
{
    "foo": "bar"
}
</i18n>
<block lang="json">
[
    1,
    [
        1,
        2
    ],
    2
]
</block>
<block lang="json">
{"a": 1,
    "b": 2}
</block>
<block lang="json">
{"bar": 2,
    "foo": 1,
    "foo": 3}
</block>`,
      errors: [
        "[jsonc/indent] Expected indentation of 4 spaces but found 0.",
        "[jsonc/indent] Expected indentation of 0 spaces but found 4.",

        "[jsonc/array-bracket-newline] A linebreak is required after '['.",
        "[jsonc/array-element-newline] There should be a linebreak after this element.",
        "[jsonc/array-bracket-spacing] There should be no space before ']'.",
        "[jsonc/array-bracket-newline] A linebreak is required before ']'.",
        "[jsonc/array-element-newline] There should be a linebreak after this element.",
        "[jsonc/array-bracket-newline] A linebreak is required before ']'.",

        "[jsonc/key-spacing] Missing space before value for key 'a'.",
        "[jsonc/comma-style] ',' should be placed last.",
        "[jsonc/key-spacing] Missing space before value for key 'b'.",
        "[jsonc/comma-dangle] Unexpected trailing comma.",

        "[jsonc/object-curly-spacing] There should be no space after '{'.",
        "[jsonc/sort-keys] Expected object keys to be in ascending order. 'foo' should be after 'bar'.",
        "[jsonc/object-property-newline] Object properties must go on a new line.",
        "[jsonc/object-property-newline] Object properties must go on a new line.",
        "[jsonc/no-dupe-keys] Duplicate key 'foo'.",
        "[jsonc/object-curly-spacing] There should be no space before '}'.",
      ],
      languageOptions: {
        parser: "vue-eslint-parser",
      },
    },
    {
      filename: path.join(ROOT_DIR, "test02", "sfc.vue"),
      code: `
<i18n>
{
"foo": "bar"
    }
</i18n>`,
      output: `
<i18n>
{
    "foo": "bar"
}
</i18n>`,
      errors: [
        "[jsonc/indent] Expected indentation of 4 spaces but found 0.",
        "[jsonc/indent] Expected indentation of 0 spaces but found 4.",
      ],
      languageOptions: {
        parser: "vue-eslint-parser",
      },
    },
  ],
});
