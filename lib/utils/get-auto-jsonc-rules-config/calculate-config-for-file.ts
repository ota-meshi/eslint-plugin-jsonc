import type { Linter } from "eslint";
import { createSyncFn } from "synckit";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ext = path.extname(fileURLToPath(import.meta.url));
const getSync = createSyncFn(
  fileURLToPath(
    import.meta.resolve(`./get-auto-jsonc-rules-config-worker${ext}`),
  ),
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
