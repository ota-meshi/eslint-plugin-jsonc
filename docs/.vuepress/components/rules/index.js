// eslint-disable-next-line eslint-comments/disable-enable-pair -- DEMO
/* eslint-disable node/no-unsupported-features/es-syntax -- DEMO */
import { Linter } from "eslint/lib/linter";
import plugin from "../../../../";

const coreRules = Object.fromEntries(new Linter().getRules());

const CATEGORY_TITLES = {
  jsonc: "eslint-plugin-jsonc",
  "eslint-core-rules@problem": "ESLint core rules(Possible Errors)",
  "eslint-core-rules@suggestion": "ESLint core rules(Suggestions)",
  "eslint-core-rules@layout": "ESLint core rules(Layout & Formatting)",
};
const CATEGORY_INDEX = {
  jsonc: 2,
  "eslint-core-rules@problem": 20,
  "eslint-core-rules@suggestion": 21,
  "eslint-core-rules@layout": 22,
};
const CATEGORY_CLASSES = {
  jsonc: "eslint-plugin-jsonc-category",
  "eslint-core-rules@problem": "eslint-core-category",
  "eslint-core-rules@suggestion": "eslint-core-category",
  "eslint-core-rules@layout": "eslint-core-category",
};

const allRules = [];

for (const k of Object.keys(plugin.rules)) {
  if (k === "auto") {
    continue;
  }
  const rule = plugin.rules[k];
  rule.meta.docs.category = "jsonc";
  allRules.push({
    classes: "eslint-plugin-jsonc-rule",
    category: "jsonc",
    ruleId: rule.meta.docs.ruleId,
    url: rule.meta.docs.url,
    initChecked: CATEGORY_INDEX[rule.meta.docs.category] <= 3,
  });
}

for (const k of Object.keys(coreRules)) {
  const rule = coreRules[k];
  if (rule.meta.deprecated) {
    continue;
  }
  allRules.push({
    classes: "eslint-core-rule",
    category: `eslint-core-rules@${rule.meta.type}`,
    ruleId: k,
    url: rule.meta.docs.url,
    initChecked: rule.meta.docs.recommended,
  });
}

allRules.sort((a, b) =>
  a.ruleId > b.ruleId ? 1 : a.ruleId < b.ruleId ? -1 : 0
);

export const categories = [];

for (const rule of allRules) {
  const title = CATEGORY_TITLES[rule.category] || rule.fallbackTitle;
  let category = categories.find((c) => c.title === title);
  if (!category) {
    category = {
      classes: CATEGORY_CLASSES[rule.category],
      category: rule.category,
      categoryOrder: CATEGORY_INDEX[rule.category],
      title,
      rules: [],
    };
    categories.push(category);
  }
  category.rules.push(rule);
}
categories.sort((a, b) =>
  a.categoryOrder > b.categoryOrder
    ? 1
    : a.categoryOrder < b.categoryOrder
    ? -1
    : a.title > b.title
    ? 1
    : a.title < b.title
    ? -1
    : 0
);

export const DEFAULT_RULES_CONFIG = allRules.reduce((c, r) => {
  if (r.ruleId === "jsonc/auto") {
    return c;
  }
  if (r.ruleId === "vue/no-parsing-error") {
    c[r.ruleId] = "error";
  } else {
    c[r.ruleId] = r.initChecked ? "error" : "off";
  }
  return c;
}, {});

export const rules = allRules;

export function getRule(ruleId) {
  if (!ruleId) {
    return null;
  }
  for (const category of categories) {
    for (const rule of category.rules) {
      if (rule.ruleId === ruleId) {
        return rule;
      }
    }
  }
  return {
    ruleId,
    url: "",
    classes: "",
  };
}
