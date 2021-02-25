const Linter = require("eslint4b")
class CLIEngine {}

// Workaround
// https://github.com/mysticatea/eslint4b/issues/8
const getRules = Linter.prototype.getRules
Linter.prototype.getRules = function (...args) {
    const map = getRules.apply(this, args)
    const originalGet = map.get
    map.get = (ruleId) => {
        try {
            return require(`../../../../node_modules/eslint/lib/rules/${ruleId}`)
        } catch (_e) {
            return originalGet.call(map, ruleId)
        }
    }
    return map
}

module.exports = { Linter, CLIEngine }
