import path from "path"
import assert from "assert"
import { ESLint } from "../../tools/lib/eslint-compat"
import plugin from "../../lib/index"

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/integrations/eslint-plugin")

describe("eslint-plugin-jsonc as parser", () => {
    it("should parse '.json6'", async () => {
        const engine = new ESLint({
            cwd: TEST_CWD,
            extensions: [".js", ".json6"],
            plugins: {
                "eslint-plugin-jsonc": plugin,
            },
        })
        const results = await engine.lintFiles(["test-as-parser01/src"])
        assert.strictEqual(results.length, 1)
        assert.strictEqual(path.basename(results[0].filePath), "test.json6")
        assert.strictEqual(results[0].messages.length, 1)
        assert.strictEqual(results[0].messages[0].ruleId, "jsonc/no-comments")
    })
})
