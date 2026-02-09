const js = require("@eslint/js");

module.exports = [
  {
    ...js.configs.all,
    "files": ["*.js", "**/*.js", "*.json", "**/*.json", "*.vue", "**/*.vue"],
  },
  {
    "files": ["*.js", "**/*.js", "*.json", "**/*.json", "*.vue", "**/*.vue"],
    "rules": {
      "indent": ["off", 4]
    }
  }
]
