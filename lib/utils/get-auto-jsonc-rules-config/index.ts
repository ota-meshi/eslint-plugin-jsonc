import type { Linter } from "eslint";
import { calculateConfigForFile } from "./calculate-config-for-file.ts";
import { ruleNames } from "../rule-names.ts";

const configResolvers: Record<
  string,
  undefined | ((filePath: string) => Pick<Linter.Config, "rules">)
> = {};
const ruleNameSet = new Set<string>(ruleNames);

/**
 * Get config resolver
 */
function getConfigResolver(
  cwd: string,
): (filePath: string) => Pick<Linter.Config, "rules"> {
  const configResolver = configResolvers[cwd];
  if (configResolver) {
    return configResolver;
  }

  return (configResolvers[cwd] = (filePath: string) =>
    calculateConfigForFile(cwd, filePath));
}

/**
 * Get config for the given filename
 * @param filename
 */
function getConfig(
  cwd: string,
  filename: string,
): Pick<Linter.Config, "rules"> {
  return getConfigResolver(cwd)(filename);
}

/**
 * Get jsonc rule from the given base rule name
 * @param filename
 */
function getJsoncRule(rule: string) {
  const ruleName = rule.startsWith("@stylistic/")
    ? (rule.split("/").pop() ?? rule)
    : rule;

  return ruleNameSet.has(ruleName) ? `jsonc/${ruleName}` : null;
}

/**
 * Get additional jsonc rules config from fileName
 * @param filename
 */
export function getAutoConfig(
  cwd: string,
  filename: string,
): {
  [name: string]: Linter.RuleEntry;
} {
  const autoConfig: { [name: string]: Linter.RuleEntry } = {};

  const config = getConfig(cwd, filename);
  if (config.rules) {
    for (const ruleName of Object.keys(config.rules)) {
      const jsoncName = getJsoncRule(ruleName);
      if (jsoncName && !config.rules[jsoncName]) {
        const entry = config.rules[ruleName];
        if (entry) {
          const severity = Array.isArray(entry) ? entry[0] : entry;
          if (severity !== "off" && severity !== 0) {
            autoConfig[jsoncName] = entry;
          }
        }
      }
    }
  }
  return autoConfig;
}
