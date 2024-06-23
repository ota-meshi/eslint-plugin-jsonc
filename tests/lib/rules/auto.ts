import assert from "assert";
import path from "path";
import rule from "../../../lib/rules/auto";
import { getLegacyESLint } from "eslint-compat-utils/eslint";

const ROOT_DIR = path.join(__dirname, "../../fixtures/auto");

function run(tests: {
  valid: {
    code: string;
    filename: string;
    languageOptions?: { parser: string };
  }[];
  invalid: {
    code: string;
    filename: string;
    errors: string[];
    output: string;
    languageOptions: { parser: string };
  }[];
}) {
  const ESLint = getLegacyESLint();
  const plugin = { rules: { auto: rule } };
  const config = {
    plugins: ["jsonc"],
    parser: "jsonc-eslint-parser",
    rules: {
      "jsonc/auto": "error",
    } as const,
  };

  describe("auto", () => {
    describe("valid", () => {
      for (const test of tests.valid) {
        it(`should pass ${test.filename}`, async () => {
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
        it(`should fail ${test.filename}`, async () => {
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

  async function lint(
    code: string,
    filePath: string,
    parser: string | undefined,
  ) {
    const engine = new ESLint({
      cwd: path.dirname(filePath),
      extensions: [".js", ".json"],
      plugins: {
        "eslint-plugin-jsonc": plugin as any,
      },
      overrideConfig: parser
        ? {
            ...config,
            parser,
          }
        : config,
    });
    const fixEngine = new ESLint({
      cwd: path.dirname(filePath),
      extensions: [".js", ".json"],
      plugins: {
        "eslint-plugin-jsonc": plugin as any,
      },
      fix: true,
      overrideConfig: parser
        ? {
            ...config,
            parser,
          }
        : config,
    });

    // eslint-disable-next-line no-process-env -- Legacy config test
    process.env.ESLINT_USE_FLAT_CONFIG = "false";
    try {
      const resultFixBefore = await engine.lintText(code, { filePath });
      assert.strictEqual(resultFixBefore.length, 1);

      const resultFixAfter = await fixEngine.lintText(code, { filePath });
      assert.strictEqual(resultFixAfter.length, 1);
      return {
        messages: resultFixBefore[0].messages,
        output: resultFixAfter[0].output,
      };
    } finally {
      // eslint-disable-next-line no-process-env -- Legacy config test
      delete process.env.ESLINT_USE_FLAT_CONFIG;
    }
  }
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
        "[jsonc/object-property-newline] Object properties must go on a new line.",
        "[jsonc/sort-keys] Expected object keys to be in ascending order. 'bar' should be before 'foo'.",
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
