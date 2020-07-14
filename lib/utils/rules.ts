import type { RuleModule } from "../types"
import arrayBracketNewline from "../rules/array-bracket-newline"
import arrayBracketSpacing from "../rules/array-bracket-spacing"
import arrayElementNewline from "../rules/array-element-newline"
import commaDangle from "../rules/comma-dangle"
import commaStyle from "../rules/comma-style"
import indent from "../rules/indent"
import keySpacing from "../rules/key-spacing"
import noComments from "../rules/no-comments"
import noDupeKeys from "../rules/no-dupe-keys"
import noMultiStr from "../rules/no-multi-str"
import noNumberProps from "../rules/no-number-props"
import noOctalEscape from "../rules/no-octal-escape"
import noSparseArrays from "../rules/no-sparse-arrays"
import noTemplateLiterals from "../rules/no-template-literals"
import noUndefinedValue from "../rules/no-undefined-value"
import noUselessEscape from "../rules/no-useless-escape"
import objectCurlyNewline from "../rules/object-curly-newline"
import objectCurlySpacing from "../rules/object-curly-spacing"
import objectPropertyNewline from "../rules/object-property-newline"
import quoteProps from "../rules/quote-props"
import quotes from "../rules/quotes"
import sortKeys from "../rules/sort-keys"
import spaceUnaryOps from "../rules/space-unary-ops"
import validJsonNumber from "../rules/valid-json-number"

export const rules = [
    arrayBracketNewline,
    arrayBracketSpacing,
    arrayElementNewline,
    commaDangle,
    commaStyle,
    indent,
    keySpacing,
    noComments,
    noDupeKeys,
    noMultiStr,
    noNumberProps,
    noOctalEscape,
    noSparseArrays,
    noTemplateLiterals,
    noUndefinedValue,
    noUselessEscape,
    objectCurlyNewline,
    objectCurlySpacing,
    objectPropertyNewline,
    quoteProps,
    quotes,
    sortKeys,
    spaceUnaryOps,
    validJsonNumber,
] as RuleModule[]
