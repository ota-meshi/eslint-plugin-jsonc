import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginRoot = path.join(__dirname, "../..");
const libRoot = path.join(pluginRoot, "lib");

const autoShimPath = path.join(
  pluginRoot,
  "docs/.vitepress/shim/rules/auto.mjs",
);

export function vitePluginAutoRule() {
  return {
    name: "vite-plugin-jsonc-auto-rule",
    transform(_code, id, _options) {
      if (id.startsWith(libRoot) && /rules[/\\]auto\.ts$/u.test(id)) {
        return {
          code: fs.readFileSync(autoShimPath, "utf8"),
        };
      }
      return undefined;
    },
  };
}

export function viteCommonjs() {
  return {
    name: "vite-plugin-cjs-to-esm",
    apply: () => true,
    transform(code, id) {
      if (!id.startsWith(libRoot) && !id.includes("vue-eslint-parser")) {
        return undefined;
      }
      const base = transformRequire(code);
      try {
        const transformed = esbuild.transformSync(base, {
          format: "esm",
        });
        return transformed.code;
      } catch (e) {
        console.error(`Transform error. base code:\n${base}`, e);
      }
      return undefined;
    },
  };
}

/**
 * Transform `require()` to `import`
 */
function transformRequire(code) {
  if (!code.includes("require")) {
    return code;
  }
  const modules = new Map();
  const replaced = code.replace(
    /(?<comment>\/\/[^\n\r]*|\/\*[\s\S]*?\*\/)|\brequire\s*\(\s*(?<moduleString>["'].*?["'])\s*\)/gu,
    (match, comment, moduleString) => {
      if (comment) {
        return match;
      }

      let id = `__${moduleString.replace(/[^\w$]+/gu, "_")}${Math.random()
        .toString(32)
        .substring(2)}`;
      while (code.includes(id) || modules.has(id)) {
        id += Math.random().toString(32).substring(2);
      }
      modules.set(id, moduleString);
      return id;
    },
  );

  return `${[...modules]
    .map(
      ([id, moduleString]) => `import * as __temp_${id} from ${moduleString};
const ${id} = __temp_${id}.default || __temp_${id};
`,
    )
    .join("")};\n${replaced}`;
}
