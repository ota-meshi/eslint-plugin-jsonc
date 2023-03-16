module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    project: require.resolve("./tsconfig.json"),
  },
  extends: [
    "plugin:@ota-meshi/recommended",
    "plugin:@ota-meshi/+node",
    "plugin:@ota-meshi/+typescript",
    "plugin:@ota-meshi/+eslint-plugin",
    "plugin:@ota-meshi/+vue2",
    "plugin:@ota-meshi/+json",
    "plugin:@ota-meshi/+package-json",
    "plugin:@ota-meshi/+yaml",
    "plugin:@ota-meshi/+md",
    "plugin:@ota-meshi/+prettier",
  ],
  rules: {
    "require-jsdoc": "error",
    "no-warning-comments": "warn",
    "no-lonely-if": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-shadow": "off",
    // Repo rule
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["/regexpp", "/regexpp/*"],
            message: "Please use `@eslint-community/regexpp` instead.",
          },
          {
            group: ["/eslint-utils", "/eslint-utils/*"],
            message: "Please use `@eslint-community/eslint-utils` instead.",
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["*.ts"],
      rules: {
        "@typescript-eslint/naming-convention": "off",
      },
      parser: "@typescript-eslint/parser",
      parserOptions: {
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    {
      files: ["scripts/**/*.ts", "tests/**/*.ts", "tests-integrations/**/*.ts"],
      rules: {
        "require-jsdoc": "off",
        "no-console": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-misused-promises": "off",
      },
    },
  ],
};
