const { rules } = require("../../dist/utils/rules")

function ruleToLink({
    meta: {
        docs: { ruleId, ruleName },
    },
}) {
    return [`/rules/${ruleName}`, ruleId]
}

module.exports = {
    base: "/eslint-plugin-jsonc/",
    title: "eslint-plugin-jsonc",
    description: "ESLint plugin for JSON, JSONC and JSON5 files",
    serviceWorker: true,
    evergreen: true,
    configureWebpack(_config, _isServer) {
        return {
            resolve: {
                alias: {
                    module: require.resolve("./shim/module"),
                },
            },
        }
    },

    head: [
        // ["link", { rel: "icon", type: "image/png", href: "/logo.png" }]
    ],
    themeConfig: {
        // logo: "/logo.svg",
        repo: "ota-meshi/eslint-plugin-jsonc",
        docsRepo: "ota-meshi/eslint-plugin-jsonc",
        docsDir: "docs",
        docsBranch: "master",
        editLinks: true,
        lastUpdated: true,
        serviceWorker: {
            updatePopup: true,
        },

        nav: [
            { text: "Introduction", link: "/" },
            { text: "User Guide", link: "/user-guide/" },
            { text: "Rules", link: "/rules/" },
            { text: "Playground", link: "/playground/" },
        ],

        sidebar: {
            "/rules/": [
                "/rules/",
                {
                    title: "JSONC Rules",
                    collapsable: false,
                    children: rules
                        .filter(
                            (rule) =>
                                !rule.meta.docs.extensionRule &&
                                !rule.meta.deprecated
                        )
                        .map(ruleToLink),
                },
                {
                    title: "Extension Rules",
                    collapsable: false,
                    children: rules
                        .filter(
                            (rule) =>
                                rule.meta.docs.extensionRule &&
                                !rule.meta.deprecated
                        )
                        .map(ruleToLink),
                },

                // Rules in no category.
                ...(rules.some((rule) => rule.meta.deprecated)
                    ? [
                          {
                              title: "Deprecated",
                              collapsable: false,
                              children: rules
                                  .filter((rule) => rule.meta.deprecated)
                                  .map(ruleToLink),
                          },
                      ]
                    : []),
            ],
            "/": ["/", "/user-guide/", "/rules/", "/playground/"],
        },
    },
}
