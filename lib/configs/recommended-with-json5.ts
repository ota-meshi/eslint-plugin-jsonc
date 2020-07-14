import path from "path"
const base = require.resolve("./base")
const baseExtend =
    path.extname(`${base}`) === ".ts" ? "plugin:jsonc/base" : base
export = {
    extends: [baseExtend],
    rules: {
        // eslint-plugin-jsonc rules
        "jsonc/no-dupe-keys": "error",
        "jsonc/no-template-literals": "error",
        "jsonc/no-useless-escape": "error",
    },
}
