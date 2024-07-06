import myPlugin from "@ota-meshi/eslint-plugin";

export default [
  {
    ignores: [
      ".nyc_output",
      "coverage",
      "dist",
      "dist-ts",
      "node_modules",
      "tests/fixtures/integrations",
      "tests/fixtures/**/*.vue",
      "tests/fixtures/**/*.json",
      "tests-integrations/fixtures/eslint-plugin-markdown/test.md",
      "tests-integrations/fixtures/vue-eslint-parser-option/test.json",
      "tests-integrations/fixtures/eslint-plugin-markdown-nest/test.md",
      "tests-integrations/fixtures/eslint-plugin-markdown-nest-for-v6/test.md",
      "assets",
      "index.d.ts",
      "!.github",
      "!.vscode",
      "!docs/.vuepress",
      "!docs/.vitepress",
      "!.devcontainer",
      "docs/.vuepress/dist",
      "docs/.vuepress/components/demo/demo-code.js",
      "docs/.vitepress/cache",
      "docs/.vitepress/build-system/shim",
      "docs/.vitepress/dist",
      "!tests/fixtures/integrations/eslint-plugin/test-auto-rule-with-flat-config01/eslint.config.js",
    ],
  },
  ...myPlugin.config({
    node: true,
    ts: true,
    eslintPlugin: true,
    vue3: true,
    json: true,
    packageJson: true,
    yaml: true,
    md: true,
    prettier: true,
  }),
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "jsdoc/require-jsdoc": "error",
      "no-warning-comments": "warn",
      "no-lonely-if": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "off",
      "one-var": "off",
      "no-invalid-this": "off",

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
  },
  {
    files: ["**/*.{ts,mts,mjs,vue}"],
    languageOptions: {
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/naming-convention": "off",
    },
  },
  {
    files: ["*.md/**", "**/*.md/**"],
    rules: {
      "n/no-missing-import": "off",
    },
  },
  {
    files: ["scripts/**/*.ts", "tests/**/*.ts", "tests-integrations/**/*.ts"],

    rules: {
      "jsdoc/require-jsdoc": "off",
      "no-console": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
  {
    files: ["docs/.vitepress/**/*.{js,mjs,ts,mts,vue}"],
    languageOptions: {
      sourceType: "module",
    },
    rules: {
      "eslint-plugin/require-meta-docs-description": "off",
      "eslint-plugin/require-meta-docs-url": "off",
      "eslint-plugin/require-meta-type": "off",
      "eslint-plugin/prefer-message-ids": "off",
      "eslint-plugin/prefer-object-rule": "off",
      "eslint-plugin/require-meta-schema": "off",
      "jsdoc/require-jsdoc": "off",
      "n/file-extension-in-import": "off",
      "n/no-unsupported-features/node-builtins": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
];
