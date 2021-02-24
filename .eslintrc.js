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
    },
    overrides: [
        {
            files: ["*.ts"],
            rules: {
                "@typescript-eslint/naming-convention": [
                    "error",
                    {
                        selector: "default",
                        format: ["camelCase"],
                        leadingUnderscore: "allow",
                        trailingUnderscore: "allow",
                    },
                    {
                        selector: "variable",
                        format: ["camelCase", "UPPER_CASE"],
                        leadingUnderscore: "allow",
                        trailingUnderscore: "allow",
                    },
                    {
                        selector: "typeLike",
                        format: ["PascalCase"],
                    },
                    {
                        selector: "method",
                        format: ["camelCase", "UPPER_CASE", "PascalCase"],
                    },
                ],
            },
            parser: "@typescript-eslint/parser",
            parserOptions: {
                sourceType: "module",
                project: "./tsconfig.json",
            },
        },
        {
            files: ["scripts/**/*.ts", "tests/**/*.ts"],
            rules: {
                "require-jsdoc": "off",
                "no-console": "off",
                "@typescript-eslint/ban-ts-comment": "off",
            },
        },
    ],
}
