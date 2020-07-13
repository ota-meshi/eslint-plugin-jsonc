export = {
    plugins: ["jsonc"],
    overrides: [
        {
            files: ["*.json", "*.json5"],
            parser: require.resolve("../parser/json-eslint-parser"),
        },
    ],
}
