import type { Linter } from "eslint";
import { existsSync, statSync } from "fs";
import { dirname, extname, resolve } from "path";
import type { RuleModule } from "../../types";
import { shouldUseFlatConfig } from "./should-use-flat-config";
import { calculateConfigForFile } from "./calculate-config-for-file";

const configResolvers: Record<
  string,
  undefined | ((filePath: string) => Pick<Linter.Config, "rules">)
> = {};
let ruleNames: Set<string>;

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

  if (shouldUseFlatConfig(cwd)) {
    return (configResolvers[cwd] = (filePath: string) =>
      calculateConfigForFile(cwd, filePath));
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- special
  const plugin = require("../..");
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- special
    const eslintrc = require("@eslint/eslintrc");
    const configArrayFactory = new eslintrc.Legacy.CascadingConfigArrayFactory({
      additionalPluginPool: new Map([["eslint-plugin-jsonc", plugin]]),
      getEslintRecommendedConfig() {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
        return require("../../../conf/eslint-recommended.js");
      },
      getEslintAllConfig() {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
        return require("../../../conf/eslint-all.js");
      },
      // for v1.1.0
      eslintRecommendedPath: require.resolve(
        "../../../conf/eslint-recommended.js",
      ),
      eslintAllPath: require.resolve("../../../conf/eslint-all.js"),
      // other plugins should be resolved as siblings to this one
      resolvePluginsRelativeTo: resolve(__dirname, "../../../../../"),
    });
    return (configResolvers[cwd] = (filePath: string) => {
      const absolutePath = resolve(cwd, filePath);
      return configArrayFactory
        .getConfigArrayForFile(absolutePath)
        .extractConfig(absolutePath)
        .toCompatibleObjectAsConfigFileContent();
    });
  } catch {
    // ignore
    // console.log(_e);
  }
  try {
    // For ESLint v6

    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- special
    const eslint = require("eslint");
    const engine = new eslint.CLIEngine({ cwd });
    engine.addPlugin("eslint-plugin-jsonc", plugin);
    return (configResolvers[cwd] = (filePath) => {
      // Adjust the file name to avoid a crash.
      // https://github.com/ota-meshi/eslint-plugin-jsonc/issues/28
      let targetFilePath = filePath;
      const ext = extname(filePath);
      while (!isValidFilename(targetFilePath)) {
        const dir = dirname(targetFilePath);
        if (dir === targetFilePath) {
          return {};
        }
        targetFilePath = dir;
        if (ext && extname(targetFilePath) !== ext) {
          targetFilePath += ext;
        }
      }

      return engine.getConfigForFile(targetFilePath);
    });
  } catch {
    // ignore
  }

  return () => ({});
}

/**
 * Checks if the given file name can get the configuration (for ESLint v6).
 */
function isValidFilename(filename: string) {
  const dir = dirname(filename);
  if (existsSync(dir) && statSync(dir).isDirectory()) {
    if (existsSync(filename) && statSync(filename).isDirectory()) {
      return false;
    }
    return true;
  }

  return false;
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
  ruleNames =
    ruleNames ||
    new Set(
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- special
      (require("../rules").rules as RuleModule[]).map(
        (r) => r.meta.docs.ruleName,
      ),
    );

  const ruleName = rule.startsWith("@stylistic/")
    ? (rule.split("/").pop() ?? rule)
    : rule;

  return ruleNames.has(ruleName) ? `jsonc/${ruleName}` : null;
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
