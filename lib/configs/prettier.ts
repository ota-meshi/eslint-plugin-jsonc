import path from "path";
const base = require.resolve("./base");
const baseExtend =
  path.extname(`${base}`) === ".ts" ? "plugin:jsonc/base" : base;
export = {
  extends: [baseExtend],
  rules: {
    // eslint-plugin-jsonc rules
    "jsonc/array-bracket-newline": "off",
    "jsonc/array-bracket-spacing": "off",
    "jsonc/array-element-newline": "off",
    "jsonc/comma-dangle": "off",
    "jsonc/comma-style": "off",
    "jsonc/indent": "off",
    "jsonc/key-spacing": "off",
    "jsonc/no-floating-decimal": "off",
    "jsonc/object-curly-newline": "off",
    "jsonc/object-curly-spacing": "off",
    "jsonc/object-property-newline": "off",
    "jsonc/quote-props": "off",
    "jsonc/quotes": "off",
    "jsonc/space-unary-ops": "off",
  },
};
