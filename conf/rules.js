// @ts-nocheck
let ruleMap;

/** Get all rules */
module.exports = function getCoreRules() {
  if (ruleMap) {
    return ruleMap;
  }
  return (ruleMap = new (require("eslint").Linter)().getRules());
};
