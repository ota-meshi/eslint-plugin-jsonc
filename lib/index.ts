import type { RuleModule } from "./types";
import { rules as ruleList } from "./utils/rules";
import base from "./configs/base";
import autoConfig from "./configs/auto-config";
import recommendedWithJson from "./configs/recommended-with-json";
import recommendedWithJsonc from "./configs/recommended-with-jsonc";
import recommendedWithJson5 from "./configs/recommended-with-json5";
import prettier from "./configs/prettier";
import all from "./configs/all";
import flatBase from "./configs/flat/base";
import flatRecommendedWithJson from "./configs/flat/recommended-with-json";
import flatRecommendedWithJsonc from "./configs/flat/recommended-with-jsonc";
import flatRecommendedWithJson5 from "./configs/flat/recommended-with-json5";
import flatPrettier from "./configs/flat/prettier";
import flatAll from "./configs/flat/all";
import * as meta from "./meta";

import {
  parseForESLint,
  parseJSON,
  traverseNodes,
  AST,
  getStaticJSONValue,
} from "jsonc-eslint-parser";
import type { Linter } from "eslint";

/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion -- For some reason type inference doesn't work will. */
const configs = {
  base: base as Linter.LegacyConfig,
  "auto-config": autoConfig as Linter.LegacyConfig,
  "recommended-with-json": recommendedWithJson as Linter.LegacyConfig,
  "recommended-with-jsonc": recommendedWithJsonc as Linter.LegacyConfig,
  "recommended-with-json5": recommendedWithJson5 as Linter.LegacyConfig,
  prettier: prettier as Linter.LegacyConfig,
  all: all as Linter.LegacyConfig,
  "flat/base": flatBase as Linter.Config[],
  "flat/recommended-with-json": flatRecommendedWithJson as Linter.Config[],
  "flat/recommended-with-jsonc": flatRecommendedWithJsonc as Linter.Config[],
  "flat/recommended-with-json5": flatRecommendedWithJson5 as Linter.Config[],
  "flat/prettier": flatPrettier as Linter.Config[],
  "flat/all": flatAll as Linter.Config[],
};
/* eslint-enable @typescript-eslint/no-unnecessary-type-assertion -- For some reason type inference doesn't work will.  */

const rules = ruleList.reduce(
  (obj, r) => {
    obj[r.meta.docs.ruleName] = r;
    return obj;
  },
  {} as { [key: string]: RuleModule },
);

export default {
  meta,
  configs,
  rules,

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
  // types
  AST,

  // backward compatibility
  parseForESLint,
  parseJSON,
  traverseNodes,
  getStaticJSONValue,
};
