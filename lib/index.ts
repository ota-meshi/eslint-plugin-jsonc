import type { RuleModule } from "./types.ts";
import flatBase from "./configs/flat/base.ts";
import flatRecommendedWithJson from "./configs/flat/recommended-with-json.ts";
import flatRecommendedWithJsonc from "./configs/flat/recommended-with-jsonc.ts";
import flatRecommendedWithJson5 from "./configs/flat/recommended-with-json5.ts";
import flatPrettier from "./configs/flat/prettier.ts";
import flatAll from "./configs/flat/all.ts";
import * as meta from "./meta.ts";

import {
  parseForESLint,
  parseJSON,
  traverseNodes,
  getStaticJSONValue,
} from "jsonc-eslint-parser";
import type { AST } from "jsonc-eslint-parser";
import type { Linter } from "eslint";
import { getRules } from "./utils/rules.ts";
import { JSONCLanguage } from "./language/index.ts";
import type { JSONCLanguageOptions, JSONCSourceCode } from "./language/index.ts";

/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion -- For some reason type inference doesn't work will. */
const configs = {
  // Primary configs
  base: flatBase as Linter.Config[],
  "recommended-with-json": flatRecommendedWithJson as Linter.Config[],
  "recommended-with-jsonc": flatRecommendedWithJsonc as Linter.Config[],
  "recommended-with-json5": flatRecommendedWithJson5 as Linter.Config[],
  prettier: flatPrettier as Linter.Config[],
  all: flatAll as Linter.Config[],
  // Backward compatibility - flat/* prefix
  "flat/base": flatBase as Linter.Config[],
  "flat/recommended-with-json": flatRecommendedWithJson as Linter.Config[],
  "flat/recommended-with-jsonc": flatRecommendedWithJsonc as Linter.Config[],
  "flat/recommended-with-json5": flatRecommendedWithJson5 as Linter.Config[],
  "flat/prettier": flatPrettier as Linter.Config[],
  "flat/all": flatAll as Linter.Config[],
};
/* eslint-enable @typescript-eslint/no-unnecessary-type-assertion -- For some reason type inference doesn't work will.  */

const rules = getRules().reduce(
  (obj, r) => {
    obj[r.meta.docs.ruleName] = r;
    return obj;
  },
  {} as { [key: string]: RuleModule },
);

const languages = {
  jsonc: new JSONCLanguage(),
};

export default {
  meta,
  configs,
  rules,
  languages,

  // backward compatibility
  parseForESLint,
  parseJSON,
  traverseNodes,
  getStaticJSONValue,
};
export {
  meta,
  configs,
  rules,
  languages,

  // backward compatibility
  parseForESLint,
  parseJSON,
  traverseNodes,
  getStaticJSONValue,
};
export type {
  // types
  AST,
  JSONCLanguageOptions,
  JSONCSourceCode,
};
