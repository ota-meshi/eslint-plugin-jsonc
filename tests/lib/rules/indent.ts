import fs from "fs";
import path from "path";
import { RuleTester } from "../test-lib/tester";
import type { RuleTester as ESLintRuleTester } from "eslint";
import rule from "../../../lib/rules/indent";
import * as jsonParser from "jsonc-eslint-parser";

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

const FIXTURE_ROOT = path.resolve(__dirname, "../../fixtures/indent/");

/**
 * Load test patterns from fixtures.
 *
 * - Valid tests:   All codes in FIXTURE_ROOT are valid code.
 * - Invalid tests: There is an invalid test for every valid test. It removes
 *                  all indentations from the valid test and checks whether
 *                  `html-indent` rule restores the removed indentations exactly.
 *
 * If a test has some ignored line, we can't use the mechanism.
 * So `additionalValid` and `additionalInvalid` exist for asymmetry test cases.
 *
 */
function loadPatterns(
  additionalValid: ESLintRuleTester.ValidTestCase[],
  additionalInvalid: ESLintRuleTester.InvalidTestCase[],
) {
  const valid = fs.readdirSync(FIXTURE_ROOT).map((filename) => {
    const code0 = fs.readFileSync(path.join(FIXTURE_ROOT, filename), "utf8");
    const code = code0
      .replace(/^\/\*(.+?)\*\//u, `/*${filename}*/`)
      .replace(/^<!--(.+?)-->/u, `<!--${filename}-->`);
    const baseObj = JSON.parse(
      /^(?:\/\*|<!--)(.+?)(?:\*\/|-->)/u.exec(code0)![1],
    );
    baseObj.languageOptions ??= {};
    if ("parser" in baseObj.languageOptions) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
      baseObj.languageOptions.parser = require(baseObj.languageOptions.parser);
    }
    if (
      baseObj.languageOptions.parserOptions &&
      "parser" in baseObj.languageOptions.parserOptions
    ) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
      baseObj.languageOptions.parserOptions.parser = require(
        baseObj.languageOptions.parserOptions.parser,
      );
    }
    return Object.assign(baseObj, { code, filename });
  });
  const invalid = valid
    .map((pattern) => {
      const kind =
        (pattern.options && pattern.options[0]) === "tab" ? "tab" : "space";
      const output = pattern.code;
      const lines: {
        text: string;
        number: number;
        indentSize: number;
      }[] = output.split("\n").map((text: string, number: number) => ({
        number,
        text,
        indentSize: (/^[\t ]+/u.exec(text) || [""])[0].length,
      }));
      const code = lines
        .map((line) => line.text.replace(/^[\t ]+/u, ""))
        .join("\n");
      const errors = lines
        .map((line) =>
          line.indentSize === 0
            ? null
            : {
                message: `Expected indentation of ${line.indentSize} ${kind}${
                  line.indentSize === 1 ? "" : "s"
                } but found 0.`,
                line: line.number + 1,
              },
        )
        .filter(Boolean);

      return Object.assign({}, pattern, { code, output, errors });
    })
    .filter((test) => test.errors.length > 0) // Empty errors cannot be verified with eslint 7.3.
    .filter(Boolean);

  return {
    valid: valid.concat(additionalValid),
    invalid: invalid.concat(additionalInvalid),
  };
}

/**
 * Prevents leading spaces in a multiline template literal from appearing in the resulting string
 * @param {string[]} strings The strings in the template literal
 * @returns {string} The template literal, with spaces removed from all lines
 */
function unIndent(strings: TemplateStringsArray) {
  const templateValue = strings[0];
  const lines = templateValue
    .replace(/^\n/u, "")
    .replace(/\n\s*$/u, "")
    .split("\n");
  const lineIndents = lines
    .filter((line) => line.trim())
    .map((line) => / */u.exec(line)![0].length);
  const minLineIndent = Math.min.apply(null, lineIndents);

  return lines.map((line) => line.slice(minLineIndent)).join("\n");
}

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run(
  "indent",
  rule as any,
  loadPatterns(
    [
      {
        code: unIndent`
                {
                    /* ✓ GOOD */
                    "GOOD": {
                        "GOOD": "foo"
                    },
                }
                `,
      },
    ],
    [],
  ),
);
