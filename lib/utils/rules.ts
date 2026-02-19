// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
import type { RuleModule } from "../types.ts";
import arrayBracketNewline from "../rules/array-bracket-newline.ts";
import arrayBracketSpacing from "../rules/array-bracket-spacing.ts";
import arrayElementNewline from "../rules/array-element-newline.ts";
import auto from "../rules/auto.ts";
import commaDangle from "../rules/comma-dangle.ts";
import commaStyle from "../rules/comma-style.ts";
import indent from "../rules/indent.ts";
import keyNameCasing from "../rules/key-name-casing.ts";
import keySpacing from "../rules/key-spacing.ts";
import noBigintLiterals from "../rules/no-bigint-literals.ts";
import noBinaryExpression from "../rules/no-binary-expression.ts";
import noBinaryNumericLiterals from "../rules/no-binary-numeric-literals.ts";
import noComments from "../rules/no-comments.ts";
import noDupeKeys from "../rules/no-dupe-keys.ts";
import noEscapeSequenceInIdentifier from "../rules/no-escape-sequence-in-identifier.ts";
import noFloatingDecimal from "../rules/no-floating-decimal.ts";
import noHexadecimalNumericLiterals from "../rules/no-hexadecimal-numeric-literals.ts";
import noInfinity from "../rules/no-infinity.ts";
import noIrregularWhitespace from "../rules/no-irregular-whitespace.ts";
import noMultiStr from "../rules/no-multi-str.ts";
import noNan from "../rules/no-nan.ts";
import noNumberProps from "../rules/no-number-props.ts";
import noNumericSeparators from "../rules/no-numeric-separators.ts";
import noOctalEscape from "../rules/no-octal-escape.ts";
import noOctalNumericLiterals from "../rules/no-octal-numeric-literals.ts";
import noOctal from "../rules/no-octal.ts";
import noParenthesized from "../rules/no-parenthesized.ts";
import noPlusSign from "../rules/no-plus-sign.ts";
import noRegexpLiterals from "../rules/no-regexp-literals.ts";
import noSparseArrays from "../rules/no-sparse-arrays.ts";
import noTemplateLiterals from "../rules/no-template-literals.ts";
import noUndefinedValue from "../rules/no-undefined-value.ts";
import noUnicodeCodepointEscapes from "../rules/no-unicode-codepoint-escapes.ts";
import noUselessEscape from "../rules/no-useless-escape.ts";
import objectCurlyNewline from "../rules/object-curly-newline.ts";
import objectCurlySpacing from "../rules/object-curly-spacing.ts";
import objectPropertyNewline from "../rules/object-property-newline.ts";
import quoteProps from "../rules/quote-props.ts";
import quotes from "../rules/quotes.ts";
import sortArrayValues from "../rules/sort-array-values.ts";
import sortKeys from "../rules/sort-keys.ts";
import spaceUnaryOps from "../rules/space-unary-ops.ts";
import validJsonNumber from "../rules/valid-json-number.ts";
import vueCustomBlockNoParsingError from "../rules/vue-custom-block/no-parsing-error.ts";

let rules: RuleModule[] | null = null;
/**
 *
 */
export function getRules(): RuleModule[] {
  if (rules) {
    return rules;
  }
  rules = [
    arrayBracketNewline,
    arrayBracketSpacing,
    arrayElementNewline,
    auto,
    commaDangle,
    commaStyle,
    indent,
    keyNameCasing,
    keySpacing,
    noBigintLiterals,
    noBinaryExpression,
    noBinaryNumericLiterals,
    noComments,
    noDupeKeys,
    noEscapeSequenceInIdentifier,
    noFloatingDecimal,
    noHexadecimalNumericLiterals,
    noInfinity,
    noIrregularWhitespace,
    noMultiStr,
    noNan,
    noNumberProps,
    noNumericSeparators,
    noOctalEscape,
    noOctalNumericLiterals,
    noOctal,
    noParenthesized,
    noPlusSign,
    noRegexpLiterals,
    noSparseArrays,
    noTemplateLiterals,
    noUndefinedValue,
    noUnicodeCodepointEscapes,
    noUselessEscape,
    objectCurlyNewline,
    objectCurlySpacing,
    objectPropertyNewline,
    quoteProps,
    quotes,
    sortArrayValues,
    sortKeys,
    spaceUnaryOps,
    validJsonNumber,
    vueCustomBlockNoParsingError,
  ] as RuleModule[];
  return rules;
}
