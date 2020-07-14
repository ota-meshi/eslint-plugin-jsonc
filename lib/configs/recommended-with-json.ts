import path from "path"
const base = require.resolve("./base")
const baseExtend =
    path.extname(`${base}`) === ".ts" ? "plugin:jsonc/base" : base
export = {
    extends: [baseExtend],
    rules: {
        // eslint-plugin-jsonc rules
        "jsonc/comma-dangle": "error",
        "jsonc/no-comments": "error",
        "jsonc/no-dupe-keys": "error",
        "jsonc/no-multi-str": "error",
        "jsonc/no-template-literals": "error",
        "jsonc/no-undefined-value": "error",
        "jsonc/no-useless-escape": "error",
        "jsonc/quote-props": "error",
        "jsonc/quotes": "error",
        "jsonc/valid-json-number": "error",
    },
}
