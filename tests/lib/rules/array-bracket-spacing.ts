import { RuleTester } from "../test-lib/tester.ts";
import rule from "../../../lib/rules/array-bracket-spacing.ts";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("array-bracket-spacing", rule, {
  valid: [
    '["element"]',
    { code: "[ 1 ]", options: ["always"] },
    { code: "[ 'foo' ]", options: ["always"] },
    { code: "[ [ 1, 1 ] ]", options: ["always"] },
    // always - singleValue
    { code: "['foo']", options: ["always", { singleValue: false }] },
    { code: "[2]", options: ["always", { singleValue: false }] },
    {
      code: "[[ 1, 1 ]]",
      options: ["always", { singleValue: false }],
    },
    {
      code: "[{ 'foo': 'bar' }]",
      options: ["always", { singleValue: false }],
    },
    { code: "['bar']", options: ["always", { singleValue: false }] },
    // always - objectsInArrays
    {
      code: "[{ 'bar': 'baz' }, 1,  5 ]",
      options: ["always", { objectsInArrays: false }],
    },
    {
      code: "[ 1, 5, { 'bar': 'baz' }]",
      options: ["always", { objectsInArrays: false }],
    },
    {
      code: "[{\n'bar': 'baz', \n'qux': [{ 'bar': 'baz' }], \n'quxx': 1 \n}]",
      options: ["always", { objectsInArrays: false }],
    },
    {
      code: "[{ 'bar': 'baz' }]",
      options: ["always", { objectsInArrays: false }],
    },
    {
      code: "[{ 'bar': 'baz' }, 1, { 'bar': 'baz' }]",
      options: ["always", { objectsInArrays: false }],
    },
    {
      code: "[ 1, { 'bar': 'baz' }, 5 ]",
      options: ["always", { objectsInArrays: false }],
    },
    {
      code: "[ 1, { 'bar': 'baz' }, [{ 'bar': 'baz' }] ]",
      options: ["always", { objectsInArrays: false }],
    },
    {
      code: "[{}]",
      options: ["always", { objectsInArrays: false }],
    },
    // always - arraysInArrays
    {
      code: "[[ 1, 2 ], 2, 3, 4 ]",
      options: ["always", { arraysInArrays: false }],
    },
    {
      code: "[[ 1, 2 ], [[[ 1 ]]], 3, 4 ]",
      options: ["always", { arraysInArrays: false }],
    },
    {
      code: "[[ 'i' ], [ 'j' ]]",
      options: ["always", { arraysInArrays: false }],
    },
    // always - arraysInArrays, objectsInArrays
    {
      code: "[[ 1, 2 ], 2, 3, { 'foo': 'bar' }]",
      options: ["always", { arraysInArrays: false, objectsInArrays: false }],
    },

    // always - arraysInArrays, objectsInArrays, singleValue
    {
      code: "[[ 1, 2 ], [2], 3, { 'foo': 'bar' }]",
      options: [
        "always",
        { arraysInArrays: false, objectsInArrays: false, singleValue: false },
      ],
    },
    { code: "[\n'foo'\n]", options: ["always"] },
    { code: "[ 'foobar' ]", options: ["always"] },
    { code: "[ [ 'foo' ] ]", options: ["always"] },
    {
      code: "[\n1,\n2,\n3,\n4\n]",
      options: ["always"],
    },

    { code: "[ 1, 2, 3, 4 ]", options: ["always"] },
    { code: "[ [ 1, 2 ], 2, 3, 4 ]", options: ["always"] },
    { code: "[\n1, 2, 3, 4\n]", options: ["always"] },
    { code: "[]", options: ["always"] },
    {
      code: "[\n { alias: 'a', url: 'http://www.amazon.de' },\n { alias: 'g', url: 'http://www.google.de' }\n]",
      options: [
        "always",
        { singleValue: false, objectsInArrays: true, arraysInArrays: true },
      ],
    },
    // never
    { code: "['foo']", options: ["never"] },
    { code: "['foobar']", options: ["never"] },
    { code: "[['foo']]", options: ["never"] },
    {
      code: "[\n1,\n2,\n3,\n4\n]",
      options: ["never"],
    },
    { code: "[1, 2, 3, 4]", options: ["never"] },
    { code: "[[1, 2], 2, 3, 4]", options: ["never"] },
    { code: "[\n1, 2, 3, 4\n]", options: ["never"] },
    { code: "[\n'foo']", options: ["never"] },
    { code: "['foo'\n]", options: ["never"] },
    { code: "[1,\n2,\n3,\n4\n]", options: ["never"] },
    { code: "[\n1,\n2,\n3,\n4]", options: ["never"] },
    // never - singleValue
    { code: "[ 'foo' ]", options: ["never", { singleValue: true }] },
    { code: "[ 2 ]", options: ["never", { singleValue: true }] },
    { code: "[ [1, 1] ]", options: ["never", { singleValue: true }] },
    {
      code: "[ {'foo': 'bar'} ]",
      options: ["never", { singleValue: true }],
    },
    { code: "[ 'bar' ]", options: ["never", { singleValue: true }] },
    // never - objectsInArrays
    {
      code: "[ {'bar': 'baz'}, 1, 5]",
      options: ["never", { objectsInArrays: true }],
    },
    {
      code: "[1, 5, {'bar': 'baz'} ]",
      options: ["never", { objectsInArrays: true }],
    },
    {
      code: "[ {\n'bar': 'baz', \n'qux': [ {'bar': 'baz'} ], \n'quxx': 1 \n} ]",
      options: ["never", { objectsInArrays: true }],
    },
    {
      code: "[ {'bar': 'baz'} ]",
      options: ["never", { objectsInArrays: true }],
    },
    {
      code: "[ {'bar': 'baz'}, 1, {'bar': 'baz'} ]",
      options: ["never", { objectsInArrays: true }],
    },
    {
      code: "[1, {'bar': 'baz'} , 5]",
      options: ["never", { objectsInArrays: true }],
    },
    {
      code: "[1, {'bar': 'baz'}, [ {'bar': 'baz'} ]]",
      options: ["never", { objectsInArrays: true }],
    },
    {
      code: "[ {} ]",
      options: ["never", { objectsInArrays: true }],
    },
    { code: "[]", options: ["never", { objectsInArrays: true }] },
    // never - arraysInArrays
    {
      code: "[ [1, 2], 2, 3, 4]",
      options: ["never", { arraysInArrays: true }],
    },
    {
      code: "[ ['i'], ['j'] ]",
      options: ["never", { arraysInArrays: true }],
    },
    { code: "[]", options: ["never", { arraysInArrays: true }] },
    // never - arraysInArrays, singleValue
    {
      code: "[ [1, 2], [ [ [ 1 ] ] ], 3, 4]",
      options: ["never", { arraysInArrays: true, singleValue: true }],
    },
    // never - arraysInArrays, objectsInArrays
    {
      code: "[ [1, 2], 2, 3, {'foo': 'bar'} ]",
      options: ["never", { arraysInArrays: true, objectsInArrays: true }],
    },
    // should not warn
    { code: "{}", options: ["never"] },
    { code: "[]", options: ["never"] },
    {
      code: "[{'bar':'baz'}, 1, {'bar': 'baz'}]",
      options: ["never"],
    },
    { code: "[{'bar': 'baz'}]", options: ["never"] },
    {
      code: "[{\n'bar': 'baz', \n'qux': [{'bar': 'baz'}], \n'quxx': 1 \n}]",
      options: ["never"],
    },
    { code: "[1, {'bar': 'baz'}, 5]", options: ["never"] },
    { code: "[{'bar': 'baz'}, 1,  5]", options: ["never"] },
    { code: "[1, 5, {'bar': 'baz'}]", options: ["never"] },
    { code: "{'foo': [1, 2]}", options: ["never"] },
  ],
  invalid: [
    {
      code: '[ "element" ]',
      output: '["element"]',
      errors: [
        "There should be no space after '['.",
        "There should be no space before ']'.",
      ],
    },
    {
      filename: "test.vue",
      code: `<i18n>[ 1, 2 ]</i18n><custom-block lang="jsonc">[ 1 ]</custom-block>`,
      output: `<i18n>[1, 2]</i18n><custom-block lang="jsonc">[1]</custom-block>`,
      errors: [
        "There should be no space after '['.",
        "There should be no space before ']'.",
        "There should be no space after '['.",
        "There should be no space before ']'.",
      ],
      ...{
        languageOptions: {
          parser: vueParser,
        },
      },
    },
    {
      code: "[ ]",
      output: "[]",
      options: ["never"],
      errors: [{ messageId: "unexpectedSpaceAfter" }],
    },
    // objectsInArrays
    {
      code: "[ { 'bar': 'baz' }, 1,  5]",
      output: "[{ 'bar': 'baz' }, 1,  5 ]",
      options: ["always", { objectsInArrays: false }],
      errors: [
        { messageId: "unexpectedSpaceAfter" },
        { messageId: "missingSpaceBefore" },
      ],
    },
    {
      code: "[1, 5, { 'bar': 'baz' } ]",
      output: "[ 1, 5, { 'bar': 'baz' }]",
      options: ["always", { objectsInArrays: false }],
      errors: [
        { messageId: "missingSpaceAfter" },
        { messageId: "unexpectedSpaceBefore" },
      ],
    },
    {
      code: "[ { 'bar':'baz' }, 1, { 'bar': 'baz' } ]",
      output: "[{ 'bar':'baz' }, 1, { 'bar': 'baz' }]",
      options: ["always", { objectsInArrays: false }],
      errors: [
        { messageId: "unexpectedSpaceAfter" },
        { messageId: "unexpectedSpaceBefore" },
      ],
    },
    // singleValue
    {
      code: "[ 'foo' ]",
      output: "['foo']",
      options: ["always", { singleValue: false }],
      errors: [
        { messageId: "unexpectedSpaceAfter" },
        { messageId: "unexpectedSpaceBefore" },
      ],
    },
    {
      code: "['foo' ]",
      output: "['foo']",
      options: ["always", { singleValue: false }],
      errors: [{ messageId: "unexpectedSpaceBefore" }],
    },
    {
      code: "['foo']",
      output: "[ 'foo' ]",
      options: ["never", { singleValue: true }],
      errors: [
        { messageId: "missingSpaceAfter" },
        { messageId: "missingSpaceBefore" },
      ],
    },
    // always - arraysInArrays
    {
      code: "[ [ 1, 2 ], 2, 3, 4 ]",
      output: "[[ 1, 2 ], 2, 3, 4 ]",
      options: ["always", { arraysInArrays: false }],
      errors: [{ messageId: "unexpectedSpaceAfter" }],
    },
    {
      code: "[ 1, 2, 2, [ 3, 4 ] ]",
      output: "[ 1, 2, 2, [ 3, 4 ]]",
      options: ["always", { arraysInArrays: false }],
      errors: [{ messageId: "unexpectedSpaceBefore" }],
    },
    {
      code: "[[ 1, 2 ], 2, [ 3, 4 ] ]",
      output: "[[ 1, 2 ], 2, [ 3, 4 ]]",
      options: ["always", { arraysInArrays: false }],
      errors: [{ messageId: "unexpectedSpaceBefore" }],
    },
    {
      code: "[ [ 1, 2 ], 2, [ 3, 4 ]]",
      output: "[[ 1, 2 ], 2, [ 3, 4 ]]",
      options: ["always", { arraysInArrays: false }],
      errors: [{ messageId: "unexpectedSpaceAfter" }],
    },
    {
      code: "[ [ 1, 2 ], 2, [ 3, 4 ] ]",
      output: "[[ 1, 2 ], 2, [ 3, 4 ]]",
      options: ["always", { arraysInArrays: false }],
      errors: [
        { messageId: "unexpectedSpaceAfter" },
        { messageId: "unexpectedSpaceBefore" },
      ],
    },
    // never -  arraysInArrays
    {
      code: "[[1, 2], 2, [3, 4]]",
      output: "[ [1, 2], 2, [3, 4] ]",
      options: ["never", { arraysInArrays: true }],
      errors: [
        { messageId: "missingSpaceAfter" },
        { messageId: "missingSpaceBefore" },
      ],
    },
    {
      code: "[ ]",
      output: "[]",
      options: ["never", { arraysInArrays: true }],
      errors: [{ messageId: "unexpectedSpaceAfter" }],
    },
    // never -  objectsInArrays
    {
      code: "[ ]",
      output: "[]",
      options: ["never", { objectsInArrays: true }],
      errors: [{ messageId: "unexpectedSpaceAfter" }],
    },
    // always
    {
      code: "[1, 2, 3, 4]",
      output: "[ 1, 2, 3, 4 ]",
      options: ["always"],
      errors: [
        { messageId: "missingSpaceAfter" },
        { messageId: "missingSpaceBefore" },
      ],
    },
    {
      code: "[1, 2, 3, 4 ]",
      output: "[ 1, 2, 3, 4 ]",
      options: ["always"],
      errors: [{ messageId: "missingSpaceAfter" }],
    },
    {
      code: "[ 1, 2, 3, 4]",
      output: "[ 1, 2, 3, 4 ]",
      options: ["always"],
      errors: [{ messageId: "missingSpaceBefore" }],
    },
    // never
    {
      code: "[ 1, 2, 3, 4 ]",
      output: "[1, 2, 3, 4]",
      options: ["never"],
      errors: [
        { messageId: "unexpectedSpaceAfter" },
        { messageId: "unexpectedSpaceBefore" },
      ],
    },
    {
      code: "[1, 2, 3, 4 ]",
      output: "[1, 2, 3, 4]",
      options: ["never"],
      errors: [{ messageId: "unexpectedSpaceBefore" }],
    },
    {
      code: "[ 1, 2, 3, 4]",
      output: "[1, 2, 3, 4]",
      options: ["never"],
      errors: [{ messageId: "unexpectedSpaceAfter" }],
    },
    {
      code: "[ [ 1], 2, 3, 4]",
      output: "[[1], 2, 3, 4]",
      options: ["never"],
      errors: [
        { messageId: "unexpectedSpaceAfter" },
        { messageId: "unexpectedSpaceAfter" },
      ],
    },
    {
      code: "[[1 ], 2, 3, 4 ]",
      output: "[[1], 2, 3, 4]",
      options: ["never"],
      errors: [
        { messageId: "unexpectedSpaceBefore" },
        { messageId: "unexpectedSpaceBefore" },
      ],
    },
    // multiple spaces
    {
      code: "[  1, 2   ]",
      output: "[1, 2]",
      options: ["never"],
      errors: [
        { messageId: "unexpectedSpaceAfter" },
        { messageId: "unexpectedSpaceBefore" },
      ],
    },
    {
      code: "[   1, 2  ]",
      output: "[1, 2]",
      options: ["never"],
      errors: [
        { messageId: "unexpectedSpaceAfter" },
        { messageId: "unexpectedSpaceBefore" },
      ],
    },
    {
      code: "[ 1,\n   2   ]",
      output: "[1,\n   2]",
      options: ["never"],
      errors: [
        { messageId: "unexpectedSpaceAfter" },
        { messageId: "unexpectedSpaceBefore" },
      ],
    },
    {
      code: "[  1, [ 2, 3  ] ]",
      output: "[1, [2, 3]]",
      options: ["never"],
      errors: [
        { messageId: "unexpectedSpaceAfter" },
        { messageId: "unexpectedSpaceAfter" },
        { messageId: "unexpectedSpaceBefore" },
        { messageId: "unexpectedSpaceBefore" },
      ],
    },
  ],
});
