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
        @input="$emit('input', $event)"
        @change="$emit('change', $event)"
    />
</template>

<script>
import EslintEditor from "vue-eslint-editor"
import plugin from "../../../.."

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
                return {}
            },
        },
        dark: {
            type: Boolean,
        },
    },

    data() {
        return {
            eslint4b: null,
            parseForESLint: null,
            format: {
                insertSpaces: true,
                tabSize: 2,
            },
        }
    },

    computed: {
        config() {
            return {
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
                rules: this.rules,
                parser: "json-eslint-parser",
                parserOptions: {
                    sourceType: "script",
                    ecmaVersion: 2019,
                },
            }
        },
        fileName() {
            return "a.json"
        },
        language() {
            return "json"
        },
        linter() {
            if (!this.eslint4b || !this.parseForESLint) {
                return null
            }
            const Linter = this.eslint4b

            const linter = new Linter()
            linter.defineParser("json-eslint-parser", {
                parseForESLint: this.parseForESLint,
            })

            for (const k of Object.keys(plugin.rules)) {
                const rule = plugin.rules[k]
                linter.defineRule(rule.meta.docs.ruleId, rule)
            }

            return linter
        },
    },

    async mounted() {
        // Load linter asynchronously.
        const [{ default: eslint4b }, { parseForESLint }] = await Promise.all([
            import("eslint4b"),
            // eslint-disable-next-line @mysticatea/node/no-extraneous-import
            import("espree").then(() =>
                import("../../../../dist/parser/json-eslint-parser")
            ),
        ])
        this.eslint4b = eslint4b
        this.parseForESLint = parseForESLint

        const editor = this.$refs.editor

        editor.$watch("monaco", () => {
            const { monaco } = editor
            // monaco.languages.j()
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                {
                    validate: false,
                }
            )
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
                {
                    validate: false,
                }
            )
        })
        editor.$watch("codeEditor", () => {
            if (editor.codeEditor) {
                editor.codeEditor.onDidChangeModelDecorations(() =>
                    this.onDidChangeModelDecorations(editor.codeEditor)
                )
            }
        })
        editor.$watch("fixedCodeEditor", () => {
            if (editor.fixedCodeEditor) {
                editor.fixedCodeEditor.onDidChangeModelDecorations(() =>
                    this.onDidChangeModelDecorations(editor.fixedCodeEditor)
                )
            }
        })
    },

    methods: {
        onDidChangeModelDecorations(editor) {
            const { monaco } = this.$refs.editor
            const model = editor.getModel()
            monaco.editor.setModelMarkers(model, "json", [])
        },
    },
}
</script>

<style scoped>
.eslint-code-block {
    width: 100%;
    margin: 1em 0;
}
</style>
