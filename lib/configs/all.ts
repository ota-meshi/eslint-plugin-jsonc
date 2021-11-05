import { rules } from "../utils/rules"
import path from "path"
const base = require.resolve("./base")
const baseExtend =
    path.extname(`${base}`) === ".ts" ? "plugin:jsonc/base" : base

const all: Record<string, string> = {}
for (const rule of rules) {
    all[rule.meta.docs.ruleId] = "error"
}

export = {
    extends: [baseExtend],
    rules: {
        ...all,
    },
}
