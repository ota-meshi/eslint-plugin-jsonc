import { ESLint } from "eslint";
import { runAsWorker } from "synckit";

runAsWorker(async (cwd: string, fileName: string) => {
  const eslint = new ESLint({ cwd });
  const config = await eslint.calculateConfigForFile(fileName);
  return { rules: config.rules };
});
