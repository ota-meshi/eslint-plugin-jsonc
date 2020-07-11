import path from "path"
import fs from "fs"
import os from "os"
// import eslint from "eslint"
import { rules } from "./lib/load-rules"
const isWin = os.platform().startsWith("win")

for (const rec of ["json", "jsonc", "json5"]) {
    let content = `
import path from "path"
const base = require.resolve("./base")
const baseExtend = path.extname(base) === ".ts" ? "plugin:jsonc/base" : base
export = {
    extends: [baseExtend],
    rules: {
        // eslint-plugin-jsonc rules
        ${rules
            .filter(
                (rule) =>
                    rule.meta.docs.recommended &&
                    !rule.meta.deprecated &&
                    rule.meta.docs.recommended.includes(rec),
            )
            .map((rule) => {
                const conf = rule.meta.docs.default || "error"
                return `"${rule.meta.docs.ruleId}": "${conf}"`
            })
            .join(",\n")}
    },
}
`

    const filePath = path.resolve(
        __dirname,
        `../lib/configs/recommended-with-${rec}.ts`,
    )

    if (isWin) {
        content = content
            .replace(/\r?\n/gu, "\n")
            .replace(/\r/gu, "\n")
            .replace(/\n/gu, "\r\n")
    }

    // Update file.
    fs.writeFileSync(filePath, content)
}
