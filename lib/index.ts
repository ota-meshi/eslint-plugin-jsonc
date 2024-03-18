import type { RuleModule } from "./types";
import { rules as ruleList } from "./utils/rules";
import base from "./configs/base";
import autoConfig from "./configs/auto-config";
import recommendedWithJson from "./configs/recommended-with-json";
import recommendedWithJsonc from "./configs/recommended-with-jsonc";
import recommendedWithJson5 from "./configs/recommended-with-json5";
import prettier from "./configs/prettier";
import all from "./configs/all";
import flatBase from "./configs/base";
import flatRecommendedWithJson from "./configs/flat/recommended-with-json";
import flatRecommendedWithJsonc from "./configs/flat/recommended-with-jsonc";
import flatRecommendedWithJson5 from "./configs/flat/recommended-with-json5";
import flatPrettier from "./configs/flat/prettier";
import flatAll from "./configs/all";
import * as meta from "./meta";

// backward compatibility
import {
  parseForESLint,
  parseJSON,
  traverseNodes,
  AST,
  getStaticJSONValue,
} from "jsonc-eslint-parser";

const configs = {
  base,
  "auto-config": autoConfig,
  "recommended-with-json": recommendedWithJson,
  "recommended-with-jsonc": recommendedWithJsonc,
  "recommended-with-json5": recommendedWithJson5,
  prettier,
  all,
  "flat/base": flatBase,
  "flat/recommended-with-json": flatRecommendedWithJson,
  "flat/recommended-with-jsonc": flatRecommendedWithJsonc,
  "flat/recommended-with-json5": flatRecommendedWithJson5,
  "flat/prettier": flatPrettier,
  "flat/all": flatAll,
};

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
  // as parser
  parseForESLint,
  // tools
  parseJSON,
  traverseNodes,
  getStaticJSONValue,
};
export {
  meta,
  configs,
  rules,
  // as parser
  parseForESLint,
  // tools
  parseJSON,
  traverseNodes,
  getStaticJSONValue,
  // types
  AST,
};
