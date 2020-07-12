import path from "path"
const base = require.resolve("./base")
const baseExtend =
    path.extname(`${base}`) === ".ts" ? "plugin:jsonc/base" : base
export = {
    extends: [baseExtend],
    overrides: [
        {
            files: ["*.json"],
            processor: "jsonc/auto-config",
        },
    ],
}
