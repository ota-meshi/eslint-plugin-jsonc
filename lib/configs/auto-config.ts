/**
 * @deprecated Use the `jsonc/auto` rule instead.
 */
import path from "path";
const base = require.resolve("./base");
const baseExtend =
  path.extname(`${base}`) === ".ts" ? "plugin:jsonc/base" : base;
export = {
  extends: [baseExtend],
  rules: {
    "jsonc/auto": "error",
  },
};
