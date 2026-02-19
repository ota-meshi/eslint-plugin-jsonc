import type { DefaultTheme, UserConfig } from "vitepress";
import { defineConfig } from "vitepress";
import path from "node:path";
import { fileURLToPath } from "node:url";
import eslint4b from "vite-plugin-eslint4b";
import type { RuleModule } from "../../lib/types.js";
import { viteCommonjs, vitePluginAutoRule } from "./vite-plugin.mjs";

import "./build-system/build.js";
const dirname = path.dirname(fileURLToPath(import.meta.url));

function ruleToSidebarItem({
  meta: {
    docs: { ruleId, ruleName },
  },
}: RuleModule): DefaultTheme.SidebarItem {
  return {
    text: ruleId,
    link: `/rules/${ruleName}`,
  };
}

export default async (): Promise<UserConfig<DefaultTheme.Config>> => {
  const a = "../../dist/utils/rules.js";
  const { rules } = (await import(a)) as { rules: RuleModule[] };
  return defineConfig({
    base: "/eslint-plugin-jsonc/",
    title: "eslint-plugin-jsonc",
    outDir: path.join(dirname, "./dist/eslint-plugin-jsonc"),
    description: "ESLint plugin for JSON, JSONC and JSON5 files.",
    head: [
      [
        "link",
        {
          rel: "icon",
          href: "/eslint-plugin-jsonc/logo.svg",
          type: "image/svg+xml",
        },
      ],
    ],

    vite: {
      plugins: [viteCommonjs(), vitePluginAutoRule(), eslint4b()],
      resolve: {
        alias: {
          "vue-eslint-parser": path.join(
            dirname,
            "./build-system/shim/vue-eslint-parser.mjs",
          ),
          module: path.join(dirname, "./shim/module.mjs"),
          events: path.join(dirname, "./build-system/shim/events.mjs"),
        },
      },
      define: {
        "process.env.NODE_DEBUG": "false",
        "process.env.ESLINT_USE_FLAT_CONFIG": "false",
      },
    },

    lastUpdated: true,
    themeConfig: {
      logo: "/logo.svg",
      search: {
        provider: "local",
        options: {
          detailedView: true,
        },
      },
      editLink: {
        pattern:
          "https://github.com/ota-meshi/eslint-plugin-jsonc/edit/master/docs/:path",
      },
      nav: [
        { text: "Introduction", link: "/" },
        { text: "User Guide", link: "/user-guide/" },
        { text: "Rules", link: "/rules/" },
        { text: "Playground", link: "/playground/" },
      ],
      socialLinks: [
        {
          icon: "github",
          link: "https://github.com/ota-meshi/eslint-plugin-jsonc",
        },
      ],
      sidebar: {
        "/rules/": [
          {
            text: "Rules",
            items: [{ text: "Available Rules", link: "/rules/" }],
          },
          {
            text: "JSONC Rules",
            collapsed: false,
            items: rules
              .filter(
                (rule) =>
                  !rule.meta.docs.extensionRule && !rule.meta.deprecated,
              )
              .map(ruleToSidebarItem),
          },
          {
            text: "Extension Rules",
            collapsed: false,
            items: rules
              .filter(
                (rule) => rule.meta.docs.extensionRule && !rule.meta.deprecated,
              )
              .map(ruleToSidebarItem),
          },

          // Rules in no category.
          ...(rules.some((rule) => rule.meta.deprecated)
            ? [
                {
                  text: "Deprecated",
                  collapsed: false,
                  items: rules
                    .filter((rule) => rule.meta.deprecated)
                    .map(ruleToSidebarItem),
                },
              ]
            : []),
        ],
        "/": [
          {
            text: "Guide",
            items: [
              { text: "Introduction", link: "/" },
              { text: "User Guide", link: "/user-guide/" },
              { text: "Rules", link: "/rules/" },
            ],
          },
        ],
      },
    },
  });
};
