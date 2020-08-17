export = {
    plugins: ["jsonc"],
    overrides: [
        {
            files: ["*.json", "*.json5"],
            parser: require.resolve("jsonc-eslint-parser"),
            rules: {
                // ESLint core rules known to cause problems with JSON.
                strict: "off",
                "no-unused-expressions": "off",
            },
        },
    ],
}
