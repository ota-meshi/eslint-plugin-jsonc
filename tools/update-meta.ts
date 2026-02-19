import fs from "node:fs";
import path from "node:path";
import { ESLint } from "eslint";
import { name, version } from "../package.json";
import { getNewVersion } from "./lib/changesets-util.ts";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const META_PATH = path.join(dirname, "../lib/meta.ts");

void main();

/** main */
async function main() {
  if (!fs.existsSync(META_PATH)) {
    fs.writeFileSync(META_PATH, "", "utf8");
  }
  const eslint = new ESLint({ fix: true });
  const [result] = await eslint.lintText(
    `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
export const name = ${JSON.stringify(name)} as const;
export const version = ${JSON.stringify(await getVersion())} as const;
`,
    { filePath: META_PATH },
  );
  fs.writeFileSync(META_PATH, result.output!);
}

/** Get version */
function getVersion() {
  // eslint-disable-next-line no-process-env -- ignore
  if (process.env.IN_VERSION_CI_SCRIPT) {
    return getNewVersion();
  }
  return version;
}
