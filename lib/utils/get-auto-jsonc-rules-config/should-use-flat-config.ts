/** copied from https://github.com/eslint/eslint/blob/v8.56.0/lib/eslint/flat-eslint.js#L1119 */

import path from "path";
import fs from "fs";

const FLAT_CONFIG_FILENAME = "eslint.config.js";
/**
 * Returns whether flat config should be used.
 * @returns {Promise<boolean>} Whether flat config should be used.
 */
export function shouldUseFlatConfig(cwd: string): boolean {
  // eslint-disable-next-line no-process-env -- ignore
  switch (process.env.ESLINT_USE_FLAT_CONFIG) {
    case "true":
      return true;
    case "false":
      return false;
    default:
      // If neither explicitly enabled nor disabled, then use the presence
      // of a flat config file to determine enablement.
      return Boolean(findFlatConfigFile(cwd));
  }
}

/**
 * Searches from the current working directory up until finding the
 * given flat config filename.
 * @param {string} cwd The current working directory to search from.
 * @returns {string|undefined} The filename if found or `undefined` if not.
 */
function findFlatConfigFile(cwd: string) {
  return findUp(FLAT_CONFIG_FILENAME, { cwd });
}

/** We used https://github.com/sindresorhus/find-up/blob/b733bb70d3aa21b22fa011be8089110d467c317f/index.js#L94 as a reference */
function findUp(name: string, options: { cwd: string }) {
  let directory = path.resolve(options.cwd);
  const { root } = path.parse(directory);
  const stopAt = path.resolve(directory, root);

  // eslint-disable-next-line no-constant-condition -- ignore
  while (true) {
    const target = path.resolve(directory, name);
    const stat = fs.statSync(target, {
      throwIfNoEntry: false,
    });
    if (stat?.isFile()) {
      return target;
    }

    if (directory === stopAt) {
      break;
    }

    directory = path.dirname(directory);
  }

  return null;
}
