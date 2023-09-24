<template>
  <div class="eslint-code-block-root">
    <eslint-plugin-editor
      v-show="height"
      ref="editor"
      v-model:code="code"
      :style="{ height }"
      :rules="rules"
      dark
      :fix="fix"
      :language="language"
      :file-name="fileName"
      :parser="parser"
    />
    <template v-if="!height">
      <slot></slot>
    </template>
  </div>
</template>

<script>
import EslintPluginEditor from "./components/EslintPluginEditor.vue";

export default {
  name: "ESLintCodeBlock",
  components: { EslintPluginEditor },
  props: {
    fix: {
      type: Boolean,
    },
    rules: {
      type: Object,
      default() {
        return {};
      },
    },
    language: {
      type: String,
      default: undefined,
    },
    fileName: {
      type: String,
      default: undefined,
    },
    parser: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      code: "",
      height: "100px",
    };
  },
  mounted() {
    this.code = `${computeCodeFromSlot(
      findCode(this.$slots.default?.()),
    ).trim()}\n`;
    const lines = this.code.split("\n").length;
    this.height = `${Math.max(120, 20 * (1 + lines))}px`;
  },
};

/**
 * Find VNode of <code> tag
 */
function findCode(n) {
  const nodes = Array.isArray(n) ? n : [n];
  for (const node of nodes) {
    if (!node) {
      continue;
    }
    if (node.type === "code") {
      return node;
    }
    const c = findCode(node.children);
    if (c) {
      return c;
    }
  }
  return null;
}

/**
 * Extract text
 */
function computeCodeFromSlot(n) {
  if (!n) {
    return "";
  }
  const nodes = Array.isArray(n) ? n : [n];
  // debugger
  return nodes
    .map((node) =>
      typeof node === "string" ? node : computeCodeFromSlot(node.children),
    )
    .join("");
}
</script>
