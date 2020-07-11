import path from "path"
import assert from "assert"
import { CLIEngine } from "eslint"
import plugin from "../../lib/index"

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const TEST_CWD = path.join(__dirname, "../fixtures/integrations/eslint-plugin")

describe("Integration with eslint-plugin-jsonc", () => {
    it("should lint without errors", () => {
        const engine = new CLIEngine({
            cwd: TEST_CWD,
            extensions: [".js", ".json"],
        })
        engine.addPlugin("eslint-plugin-jsonc", plugin)
        const r = engine.executeOnFiles(["test01/src"])
        assert.strictEqual(r.results.length, 2)
        assert.strictEqual(r.errorCount, 0)
    })
})
