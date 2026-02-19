import getReleasePlan from "@changesets/get-release-plan";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** Get new version string from changesets */
export async function getNewVersion(): Promise<string> {
  const releasePlan = await getReleasePlan(path.resolve(dirname, "../.."));

  return releasePlan.releases.find(
    ({ name }) => name === "eslint-plugin-jsonc",
  )!.newVersion;
}
