export = {
    plugins: ["jsonc"],
    overrides: [
        {
            files: ["*.json"],
            parser: require.resolve("../parser/json-eslint-parser"),
        },
    ],
}
