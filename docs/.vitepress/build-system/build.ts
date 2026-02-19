/**
 * Pre-build cjs packages that cannot be bundled well.
 */
import esbuild from "esbuild";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

build(
  path.join(dirname, "./src/vue-eslint-parser.mjs"),
  path.join(dirname, "./shim/vue-eslint-parser.mjs"),
  ["eslint", "path", "module", "events"],
);
build(
  path.join(dirname, "./src/events.mjs"),
  path.join(dirname, "./shim/events.mjs"),
  [],
);

function build(input: string, out: string, injects: string[] = []) {
  // eslint-disable-next-line no-console -- ignore
  console.log(`build@ ${input}`);
  let code = bundle(input, injects);
  code = transform(code, injects);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, code, "utf8");
}

function bundle(entryPoint: string, externals: string[]) {
  const result = esbuild.buildSync({
    entryPoints: [entryPoint],
    format: "esm",
    bundle: true,
    external: externals,
    write: false,
  });

  return `${result.outputFiles[0].text}`;
}

function transform(code: string, injects: string[]) {
  const newCode = code.replace(/"[a-z]+" = "[a-z]+";/u, "");
  return `
${injects
  .map(
    (inject) =>
      `import $inject_${inject.replace(/-/gu, "_")}$ from '${inject}';`,
  )
  .join("\n")}
const $_injects_$ = {${injects
    .map((inject) => `${inject.replace(/-/gu, "_")}:$inject_${inject}$`)
    .join(",\n")}};
function require(module, ...args) {
  return $_injects_$[module] || {}
}
${newCode}

if (typeof __require !== 'undefined') __require.cache = {};
`;
}
