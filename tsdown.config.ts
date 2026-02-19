import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "lib/index.ts",
    "get-auto-jsonc-rules-config-worker":
      "lib/utils/get-auto-jsonc-rules-config/get-auto-jsonc-rules-config-worker.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  inlineOnly: false,
});
