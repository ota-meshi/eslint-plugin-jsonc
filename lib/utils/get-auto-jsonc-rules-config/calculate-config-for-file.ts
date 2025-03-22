import { makeSynchronizedFunction } from "make-synchronized";
import type { Linter } from "eslint";
import { getESLint } from "eslint-compat-utils/eslint";

const ESLint = getESLint();

/**
 *
 */
async function calculateConfigForFileAsync(
  cwd: string,
  fileName: string,
): Promise<Pick<Linter.Config, "rules">> {
  const eslint = new ESLint({ cwd });
  const config = await eslint.calculateConfigForFile(fileName);
  return { rules: config.rules };
}

/**
 * Synchronously calculateConfigForFile
 */
export const calculateConfigForFile = makeSynchronizedFunction(
  __filename,
  calculateConfigForFileAsync,
  "calculateConfigForFile",
);
