import { getRuleTester } from "eslint-compat-utils/rule-tester";
import { getLegacyESLint, getESLint } from "eslint-compat-utils/eslint";

export const RuleTester = getRuleTester();
export const LegacyESLint = getLegacyESLint();
export const ESLint = getESLint();
