import { runAsWorker } from "synckit";
import { getESLint } from "eslint-compat-utils/eslint";
const ESLint = getESLint();

runAsWorker(async (cwd: string, fileName: string) => {
  const eslint = new ESLint({ cwd });
  const config = await eslint.calculateConfigForFile(fileName);
  return { rules: config.rules };
});
