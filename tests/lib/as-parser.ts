import path from "path"
import assert from "assert"
import { CLIEngine } from "eslint"
import plugin from "../../lib/index"
import Module from "module"

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/integrations/eslint-plugin")

describe("eslint-plugin-jsonc as parser", () => {
    // @ts-ignore
    const resolveFilename = Module._resolveFilename
    before(() => {
        // @ts-ignore
        Module._resolveFilename = function (id, ...args) {
            if (id === "eslint-plugin-jsonc") {
                return require.resolve("../../lib/index")
            }
            return resolveFilename.call(this, id, ...args)
        }
    })

    after(() => {
        // @ts-ignore
        Module._resolveFilename = resolveFilename
    })

    it("should parse '.json6'", () => {
        const engine = new CLIEngine({
            cwd: TEST_CWD,
            extensions: [".js", ".json6"],
        })
        engine.addPlugin("eslint-plugin-jsonc", plugin)
        const r = engine.executeOnFiles(["test-as-parser01/src"])
        assert.strictEqual(r.results.length, 1)
        assert.strictEqual(path.basename(r.results[0].filePath), "test.json6")
        assert.strictEqual(r.results[0].messages.length, 1)
        assert.strictEqual(r.results[0].messages[0].ruleId, "jsonc/no-comments")
    })
})
