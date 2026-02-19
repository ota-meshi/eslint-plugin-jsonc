import type { Linter } from "eslint";
import { createSyncFn } from "synckit";

const getSync = createSyncFn(require.resolve("./worker"));

/**
 * Synchronously calculateConfigForFile
 */
export function calculateConfigForFile(
  cwd: string,
  fileName: string,
): Pick<Linter.Config, "rules"> {
  return getSync(cwd, fileName);
}
