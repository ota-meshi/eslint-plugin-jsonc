import type { Linter } from "eslint";
import { createSyncFn } from "synckit";
import { fileURLToPath } from "node:url";

const getSync = createSyncFn(
  fileURLToPath(import.meta.resolve("./worker.js")),
);

/**
 * Synchronously calculateConfigForFile
 */
export function calculateConfigForFile(
  cwd: string,
  fileName: string,
): Pick<Linter.Config, "rules"> {
  return getSync(cwd, fileName);
}
