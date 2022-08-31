import { RuleTester } from "eslint";
import rule from "../../../lib/rules/no-useless-escape";

const tester = new RuleTester({
  parser: require.resolve("jsonc-eslint-parser"),
});

tester.run("no-useless-escape", rule as any, {
  valid: ['"\\""'],
  invalid: [
    {
      filename: "test.json",
      code: '"hol\\a"',
      errors: ["Unnecessary escape character: \\a."],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">"hol\\a"</custom-block>`,
      parser: require.resolve("vue-eslint-parser"),
      errors: ["Unnecessary escape character: \\a."],
    },
  ],
});
