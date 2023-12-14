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
    "plugin:@ota-meshi/+vue3",
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
    "one-var": "off",
    "no-invalid-this": "off",
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
    "no-restricted-properties": [
      "error",
      {
        object: "context",
        property: "getSourceCode",
        message:
          "Please use `eslint-compat-utils` module's `getSourceCode(context)` instead.",
      },
      {
        object: "context",
        property: "sourceCode",
        message:
          "Please use `eslint-compat-utils` module's `getSourceCode(context)` instead.",
      },
      {
        object: "context",
        property: "getFilename",
        message:
          "Please use `eslint-compat-utils` module's `getFilename(context)` instead.",
      },
      {
        object: "context",
        property: "filename",
        message:
          "Please use `eslint-compat-utils` module's `getFilename(context)` instead.",
      },
      {
        object: "context",
        property: "getCwd",
        message:
          "Please use `eslint-compat-utils` module's `getCwd(context)` instead.",
      },
      {
        object: "context",
        property: "cwd",
        message:
          "Please use `eslint-compat-utils` module's `getCwd(context)` instead.",
      },
      {
        object: "context",
        property: "getScope",
        message:
          "Please use `eslint-compat-utils` module's `getSourceCode(context).getScope()` instead.",
      },
      {
        object: "context",
        property: "parserServices",
        message:
          "Please use `eslint-compat-utils` module's `getSourceCode(context).parserServices` instead.",
      },
    ],
  },
  overrides: [
    {
      files: ["*.ts", "*.mts"],
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
