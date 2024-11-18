import path from "path";
import fs from "fs";
import cp from "child_process";
const logger = console;

// main
((ruleId) => {
  if (ruleId == null) {
    logger.error("Usage: npm run new <RuleID>");
    process.exitCode = 1;
    return;
  }
  if (!/^[\w\-/]+$/u.test(ruleId)) {
    logger.error("Invalid RuleID '%s'.", ruleId);
    process.exitCode = 1;
    return;
  }

  const ruleFile = path.resolve(__dirname, `../lib/rules/${ruleId}.ts`);
  const testFile = path.resolve(__dirname, `../tests/lib/rules/${ruleId}.ts`);
  const docFile = path.resolve(__dirname, `../docs/rules/${ruleId}.md`);

  fs.writeFileSync(
    ruleFile,
    `
import type { AST } from "jsonc-eslint-parser"
import { createRule, defineWrapperListener, getCoreRule } from "../utils"
const coreRule = getCoreRule("${ruleId}")

export default createRule("${ruleId}", {
    meta: {
        ...coreRule.meta,
        docs: {
            description: "...",
            recommended: true,
        },
        fixable: coreRule.meta?.fixable,
        hasSuggestions: (coreRule.meta as any)?.hasSuggestions,
        schema: coreRule.meta!.schema!,
        messages: coreRule.meta!.messages!,
        type: coreRule.meta!.type!,
        deprecated: false,
        replacedBy: [],
    },
    create(context) {
        const sourceCode = context.sourceCode;
        if (!sourceCode.parserServices.isJSON) {
          return {};
        }
        return defineWrapperListener(coreRule, context, context.options)
    },
})
`,
  );
  fs.writeFileSync(
    testFile,
    `import { RuleTester } from "../test-lib/tester"
import rule from "../../../lib/rules/${ruleId}"
import * as jsonParser from "jsonc-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
})

tester.run("${ruleId}", rule as any, {
    valid: [
        '{"key": "value"}', '"string"', '["element"]'
    ],
    invalid: [
        {
            code: \`{}\`,
            errors: [
                ""
            ],
        },
    ],
})
`,
  );
  fs.writeFileSync(
    docFile,
    `#  (jsonc/${ruleId})

> description

## :book: Rule Details

This rule reports ???.


<eslint-code-block fix>

<!-- eslint-skip -->

\`\`\`json5
/* eslint jsonc/${ruleId}: 'error' */
{
    /* ✓ GOOD */
    "GOOD": "foo",

    /* ✗ BAD */
    "BAD": "bar"
}
\`\`\`

</eslint-code-block>

## :wrench: Options

Nothing.

\`\`\`json
{
  "jsonc/${ruleId}": ["error", {
   
  }]
}
\`\`\`

Same as [${ruleId}] rule option. See [here](https://eslint.org/docs/rules/${ruleId}#options) for details.

- 

## :books: Further reading

- 

## :couple: Related rules

- [${ruleId}]

[${ruleId}]: https://eslint.org/docs/rules/${ruleId}

`,
  );

  cp.execSync(`code "${ruleFile}"`);
  cp.execSync(`code "${testFile}"`);
  cp.execSync(`code "${docFile}"`);
})(process.argv[2]);
