if (typeof globalThis !== "undefined") {
  if (typeof require === "undefined") {
    (globalThis as any).require = () => {
      const e = new Error("require is not defined");
      (e as any).code = "MODULE_NOT_FOUND";
      throw e;
    };
  }
}
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import ESLintCodeBlock from "./components/eslint-code-block.vue";
import PlaygroundBlock from "./components/playground-block.vue";
import "./style.css";

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx);
    ctx.app.component("eslint-code-block", ESLintCodeBlock);
    ctx.app.component("playground-block", PlaygroundBlock);
  },
};
export default theme;
