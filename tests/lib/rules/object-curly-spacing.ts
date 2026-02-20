import { RuleTester } from "../test-lib/tester.ts";
import rule from "../../../lib/rules/object-curly-spacing.ts";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("object-curly-spacing", rule, {
  valid: [
    '{"key": "value"}',

    // always - object literals
    { code: "{ foo: 'bar', baz: 'qux' }", options: ["always"] },
    { code: "{ foo: { bar: 'quxx' }, baz: 'qux' }", options: ["always"] },
    { code: "{\nfoo: 'bar',\nbaz: 'qux'\n}", options: ["always"] },
    { code: "{ /**/foo:'bar'/**/ }", options: ["always"] },
    { code: "{ //\nfoo:'bar' }", options: ["always"] },
    // always - empty object
    { code: "{}", options: ["always"] },
    // always - objectsInObjects
    {
      code: "{ 'foo': { 'bar': 1, 'baz': 2 }}",
      options: ["always", { objectsInObjects: false }],
    },
    // always - arraysInObjects
    {
      code: "{ 'foo': [ 1, 2 ]}",
      options: ["always", { arraysInObjects: false }],
    },
    // always - arraysInObjects, objectsInObjects
    {
      code: "{ 'qux': [ 1, 2 ], 'foo': { 'bar': 1, 'baz': 2 }}",
      options: ["always", { arraysInObjects: false, objectsInObjects: false }],
    },
    // always - arraysInObjects, objectsInObjects (reverse)
    {
      code: "{ 'foo': { 'bar': 1, 'baz': 2 }, 'qux': [ 1, 2 ]}",
      options: ["always", { arraysInObjects: false, objectsInObjects: false }],
    },

    // never
    { code: "{foo: 'bar',\nbaz: 'qux'\n}", options: ["never"] },
    { code: "{\nfoo: 'bar',\nbaz: 'qux'}", options: ["never"] },
    // never - object literals
    { code: "{foo: 'bar', baz: 'qux'}", options: ["never"] },
    { code: "{foo: {bar: 'quxx'}, baz: 'qux'}", options: ["never"] },
    { code: "{foo: {\nbar: 'quxx'}, baz: 'qux'\n}", options: ["never"] },
    { code: "{foo: {\nbar: 'quxx'\n}, baz: 'qux'}", options: ["never"] },
    { code: "{\nfoo: 'bar',\nbaz: 'qux'\n}", options: ["never"] },
    { code: "{foo: 'bar', baz: 'qux' /* */}", options: ["never"] },
    { code: "{/* */ foo: 'bar', baz: 'qux'}", options: ["never"] },
    { code: "{//\n foo: 'bar'}", options: ["never"] },
    { code: "{ // line comment exception\n foo: 'bar'}", options: ["never"] },
    // never - empty object
    { code: "{}", options: ["never"] },
    // never - objectsInObjects
    {
      code: "{'foo': {'bar': 1, 'baz': 2} }",
      options: ["never", { objectsInObjects: true }],
    },
  ],
  invalid: [
    {
      code: '{ "key": "value" }',
      output: '{"key": "value"}',
      errors: [
        "There should be no space after '{'.",
        "There should be no space before '}'.",
      ],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">{ "key": "value" }</custom-block>`,
      output: `<custom-block lang="json">{"key": "value"}</custom-block>`,
      errors: [
        "There should be no space after '{'.",
        "There should be no space before '}'.",
      ],
      ...{
        languageOptions: {
          parser: vueParser,
        },
      },
    },
    // always - arraysInObjects
    {
      code: "{ 'foo': [ 1, 2 ] }",
      output: "{ 'foo': [ 1, 2 ]}",
      options: ["always", { arraysInObjects: false }],
      errors: [{ messageId: "unexpectedSpaceBefore" }],
    },
    {
      code: "{ 'foo': [ 1, 2 ] , 'bar': [ 'baz', 'qux' ] }",
      output: "{ 'foo': [ 1, 2 ] , 'bar': [ 'baz', 'qux' ]}",
      options: ["always", { arraysInObjects: false }],
      errors: [{ messageId: "unexpectedSpaceBefore" }],
    },

    // always-objectsInObjects
    {
      code: "{ 'foo': { 'bar': 1, 'baz': 2 } }",
      output: "{ 'foo': { 'bar': 1, 'baz': 2 }}",
      options: ["always", { objectsInObjects: false }],
      errors: [{ messageId: "unexpectedSpaceBefore" }],
    },
    {
      code: "{ 'foo': [ 1, 2 ] , 'bar': { 'baz': 1, 'qux': 2 } }",
      output: "{ 'foo': [ 1, 2 ] , 'bar': { 'baz': 1, 'qux': 2 }}",
      options: ["always", { objectsInObjects: false }],
      errors: [{ messageId: "unexpectedSpaceBefore" }],
    },
    // never-objectsInObjects
    {
      code: "{'foo': {'bar': 1, 'baz': 2}}",
      output: "{'foo': {'bar': 1, 'baz': 2} }",
      options: ["never", { objectsInObjects: true }],
      errors: [{ messageId: "requireSpaceBefore" }],
    },
    {
      code: "{'foo': [1, 2] , 'bar': {'baz': 1, 'qux': 2}}",
      output: "{'foo': [1, 2] , 'bar': {'baz': 1, 'qux': 2} }",
      options: ["never", { objectsInObjects: true }],
      errors: [{ messageId: "requireSpaceBefore" }],
    },

    // always & never
    {
      code: "{foo: 'bar', baz: 'qux'}",
      output: "{ foo: 'bar', baz: 'qux' }",
      options: ["always"],
      errors: [
        { messageId: "requireSpaceAfter" },
        { messageId: "requireSpaceBefore" },
      ],
    },
    {
      code: "{foo: 'bar', baz: 'qux' }",
      output: "{ foo: 'bar', baz: 'qux' }",
      options: ["always"],
      errors: [{ messageId: "requireSpaceAfter" }],
    },
    {
      code: "{/* */foo: 'bar', baz: 'qux' }",
      output: "{ /* */foo: 'bar', baz: 'qux' }",
      options: ["always"],
      errors: [{ messageId: "requireSpaceAfter" }],
    },
    {
      code: "{//\n foo: 'bar' }",
      output: "{ //\n foo: 'bar' }",
      options: ["always"],
      errors: [{ messageId: "requireSpaceAfter" }],
    },
    {
      code: "{ foo: 'bar', baz: 'qux'}",
      output: "{ foo: 'bar', baz: 'qux' }",
      options: ["always"],
      errors: [{ messageId: "requireSpaceBefore" }],
    },
    {
      code: "{ foo: 'bar', baz: 'qux'/* */}",
      output: "{ foo: 'bar', baz: 'qux'/* */ }",
      options: ["always"],
      errors: [{ messageId: "requireSpaceBefore" }],
    },
    {
      code: "{ foo: 'bar', baz: 'qux' }",
      output: "{foo: 'bar', baz: 'qux'}",
      options: ["never"],
      errors: [
        { messageId: "unexpectedSpaceAfter" },
        { messageId: "unexpectedSpaceBefore" },
      ],
    },
    {
      code: "{  foo: 'bar', baz: 'qux' }",
      output: "{foo: 'bar', baz: 'qux'}",
      options: ["never"],
      errors: [
        { messageId: "unexpectedSpaceAfter" },
        { messageId: "unexpectedSpaceBefore" },
      ],
    },
    {
      code: "{foo: 'bar', baz: 'qux' }",
      output: "{foo: 'bar', baz: 'qux'}",
      options: ["never"],
      errors: [{ messageId: "unexpectedSpaceBefore" }],
    },
    {
      code: "{foo: 'bar', baz: 'qux'  }",
      output: "{foo: 'bar', baz: 'qux'}",
      options: ["never"],
      errors: [{ messageId: "unexpectedSpaceBefore" }],
    },
    {
      code: "{foo: 'bar', baz: 'qux' /* */ }",
      output: "{foo: 'bar', baz: 'qux' /* */}",
      options: ["never"],
      errors: [{ messageId: "unexpectedSpaceBefore" }],
    },
    {
      code: "{ foo: 'bar', baz: 'qux'}",
      output: "{foo: 'bar', baz: 'qux'}",
      options: ["never"],
      errors: [{ messageId: "unexpectedSpaceAfter" }],
    },
    {
      code: "{  foo: 'bar', baz: 'qux'}",
      output: "{foo: 'bar', baz: 'qux'}",
      options: ["never"],
      errors: [{ messageId: "unexpectedSpaceAfter" }],
    },
    {
      code: "{ /* */ foo: 'bar', baz: 'qux'}",
      output: "{/* */ foo: 'bar', baz: 'qux'}",
      options: ["never"],
      errors: [{ messageId: "unexpectedSpaceAfter" }],
    },
    {
      code: "{ // line comment exception\n foo: 'bar' }",
      output: "{ // line comment exception\n foo: 'bar'}",
      options: ["never"],
      errors: [{ messageId: "unexpectedSpaceBefore" }],
    },
    {
      code: "{ foo: { bar: 'quxx'}, baz: 'qux'}",
      output: "{foo: {bar: 'quxx'}, baz: 'qux'}",
      options: ["never"],
      errors: [
        { messageId: "unexpectedSpaceAfter" },
        { messageId: "unexpectedSpaceAfter" },
      ],
    },
    {
      code: "{foo: {bar: 'quxx' }, baz: 'qux' }",
      output: "{foo: {bar: 'quxx'}, baz: 'qux'}",
      options: ["never"],
      errors: [
        { messageId: "unexpectedSpaceBefore" },
        { messageId: "unexpectedSpaceBefore" },
      ],
    },
    // never - arraysInObjects
    {
      code: "{'foo': [1, 2]}",
      output: "{'foo': [1, 2] }",
      options: ["never", { arraysInObjects: true }],
      errors: [{ messageId: "requireSpaceBefore" }],
    },
    {
      code: "{'foo': [1, 2] , 'bar': ['baz', 'qux']}",
      output: "{'foo': [1, 2] , 'bar': ['baz', 'qux'] }",
      options: ["never", { arraysInObjects: true }],
      errors: [{ messageId: "requireSpaceBefore" }],
    },
  ],
});
