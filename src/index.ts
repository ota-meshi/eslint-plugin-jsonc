import type { RuleModule } from "./types";
import { rules as ruleList } from "./utils/rules";
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
