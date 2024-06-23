<template>
  <eslint-editor
    ref="editor"
    :linter="linter"
    :config="config"
    :code="code"
    class="eslint-code-block"
    :language="language"
    :filename="fileName"
    :dark="dark"
    :format="format"
    :fix="fix"
    @update:code="$emit('update:code', $event)"
    @change="$emit('change', $event)"
  />
</template>

<script>
import EslintEditor from "@ota-meshi/site-kit-eslint-editor-vue";
import { loadMonacoEditor } from "@ota-meshi/site-kit-monaco-editor";
import { Linter } from "eslint";
import { rules } from "../../../../../lib/utils/rules";

export default {
  name: "EslintPluginEditor",
  components: { EslintEditor },
  model: {
    prop: "code",
  },
  props: {
    code: {
      type: String,
      default: "",
    },
    fix: {
      type: Boolean,
    },
    rules: {
      type: Object,
      default() {
        return {};
      },
    },
    dark: {
      type: Boolean,
    },
    language: {
      type: String,
      default: "json",
    },
    fileName: {
      type: String,
      default: "a.json",
    },
    parser: {
      type: String,
      default: "jsonc-eslint-parser",
    },
  },
  emits: ["update:code", "change"],

  data() {
    return {
      espree: null,
      jsoncESLintParser: null,
      vueESLintParser: null,
      format: {
        insertSpaces: true,
        tabSize: 2,
      },
    };
  },

  computed: {
    config() {
      return [
        {
          plugins: {
            jsonc: {
              rules: Object.fromEntries(
                rules.map((rule) => [rule.meta.docs.ruleName, rule]),
              ),
            },
          },
          rules: this.rules,
          languageOptions: {
            globals: {
              // ES2015 globals
              ArrayBuffer: false,
              DataView: false,
              Float32Array: false,
              Float64Array: false,
              Int16Array: false,
              Int32Array: false,
              Int8Array: false,
              Map: false,
              Promise: false,
              Proxy: false,
              Reflect: false,
              Set: false,
              Symbol: false,
              Uint16Array: false,
              Uint32Array: false,
              Uint8Array: false,
              Uint8ClampedArray: false,
              WeakMap: false,
              WeakSet: false,
              // ES2017 globals
              Atomics: false,
              SharedArrayBuffer: false,
            },
            parserOptions: {
              parser: this.espree,
              sourceType: "module",
              ecmaVersion: "latest",
            },
          },
        },
        {
          files: ["*.{json,jsonc,json5}", "**/*.{json,jsonc,json5}"],
          languageOptions: {
            parser: this.jsoncESLintParser,
          },
        },
        {
          files: ["*.vue", "**/*.vue"],
          languageOptions: {
            parser: this.vueESLintParser,
          },
        },
      ];
    },
    linter() {
      if (!this.jsoncESLintParser || !this.vueESLintParser) {
        return null;
      }
      const linter = new Linter();
      return linter;
    },
  },

  async mounted() {
    // Load parser asynchronously.
    const [espree, jsoncESLintParser, vueESLintParser] = await Promise.all([
      import("espree"),
      import("jsonc-eslint-parser"),
      import("vue-eslint-parser"),
    ]);
    this.espree = espree;
    this.jsoncESLintParser = jsoncESLintParser;
    this.vueESLintParser = vueESLintParser;

    const monaco = await loadMonacoEditor();
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      validate: false,
    });
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      validate: false,
    });
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: false,
    });

    const editorVue = this.$refs.editor.$refs.monacoEditorRef;
    for (const editor of [
      editorVue.getLeftEditor(),
      editorVue.getRightEditor(),
    ]) {
      editor?.onDidChangeModelDecorations(() =>
        this.onDidChangeModelDecorations(editor),
      );
    }
  },

  methods: {
    async onDidChangeModelDecorations(editor) {
      const monaco = await loadMonacoEditor();
      const model = editor.getModel();
      monaco.editor.setModelMarkers(model, "json", []);
    },
  },
};
</script>

<style scoped>
.eslint-code-block {
  width: 100%;
  margin: 1em 0;
}
</style>
