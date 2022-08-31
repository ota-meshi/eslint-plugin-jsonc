import type { RuleModule } from "../lib/types";
import { rules } from "../lib/utils/rules";

//eslint-disable-next-line require-jsdoc, @typescript-eslint/explicit-module-boundary-types -- tools
export default function renderRulesTableContent(
  categoryLevel: number,
  buildRulePath = (ruleName: string) => `./${ruleName}.md`
) {
  const pluginRules = rules.filter(
    (rule) => !rule.meta.deprecated && !rule.meta.docs.extensionRule
  );
  const extensionRules = rules.filter(
    (rule) => !rule.meta.deprecated && rule.meta.docs.extensionRule
  );

  const deprecatedRules = rules.filter((rule) => rule.meta.deprecated);

  // -----------------------------------------------------------------------------

  //eslint-disable-next-line require-jsdoc -- tools
  function toRuleRow(rule: RuleModule) {
    const fixableMark = rule.meta.fixable ? ":wrench:" : "";
    const jsonMark = (rule.meta.docs.recommended || []).includes("json")
      ? ":star:"
      : "";
    const jsoncMark = (rule.meta.docs.recommended || []).includes("jsonc")
      ? ":star:"
      : "";
    const json5Mark = (rule.meta.docs.recommended || []).includes("json5")
      ? ":star:"
      : "";
    const link = `[${rule.meta.docs.ruleId}](${buildRulePath(
      rule.meta.docs.ruleName || ""
    )})`;
    const description = rule.meta.docs.description || "(no description)";

    return `| ${link} | ${description} | ${fixableMark} | ${jsonMark} | ${jsoncMark} | ${json5Mark} |`;
  }

  //eslint-disable-next-line require-jsdoc -- tools
  function toDeprecatedRuleRow(rule: RuleModule) {
    const link = `[${rule.meta.docs.ruleId}](${buildRulePath(
      rule.meta.docs.ruleName || ""
    )})`;
    const replacedRules = rule.meta.docs.replacedBy || [];
    const replacedBy = replacedRules
      .map((name) => `[jsonc/${name}](${buildRulePath(name)}.md)`)
      .join(", ");

    return `| ${link} | ${replacedBy || "(no replacement)"} |`;
  }

  // -----------------------------------------------------------------------------
  let rulesTableContent = `
#${"#".repeat(categoryLevel)} JSONC Rules

| Rule ID | Description | Fixable | JSON | JSONC | JSON5 |
|:--------|:------------|:-------:|:----:|:-----:|:-----:|
${pluginRules.map(toRuleRow).join("\n")}

#${"#".repeat(categoryLevel)} Extension Rules

| Rule ID | Description | Fixable | JSON | JSONC | JSON5 |
|:--------|:------------|:-------:|:----:|:-----:|:-----:|
${extensionRules.map(toRuleRow).join("\n")}
`;

  // -----------------------------------------------------------------------------
  if (deprecatedRules.length >= 1) {
    rulesTableContent += `
## Deprecated

- :warning: We're going to remove deprecated rules in the next major release. Please migrate to successor/new rules.
- :innocent: We don't fix bugs which are in deprecated rules since we don't have enough resources.

| Rule ID | Replaced by |
|:--------|:------------|
${deprecatedRules.map(toDeprecatedRuleRow).join("\n")}
`;
  }
  return rulesTableContent;
}
