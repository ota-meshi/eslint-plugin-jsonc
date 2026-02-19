import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["lib/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  inlineOnly: false,
});
