# eslint-plugin-jsonc

## 3.1.1

### Patch Changes

- [#492](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/492) [`36960d6`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/36960d62b87e2df2b5c64954fc08615a1653f9d9) Thanks [@FloEdelmann](https://github.com/FloEdelmann)! - Add `main` field to package.json

## 3.1.0

### Minor Changes

- [#487](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/487) [`8a1f4b9`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/8a1f4b9d458b0c2de95249eb66ae0568912ad945) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat(object-curly-spacing): add `emptyObjects` option to control spacing in empty objects

## 3.0.1

### Patch Changes

- [#484](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/484) [`8bef6fc`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/8bef6fc87089f34079aa4ec0b81b59ce0ec45227) Thanks [@ota-meshi](https://github.com/ota-meshi)! - update `@ota-meshi/ast-token-store` to v0.3.0

## 3.0.0

### Major Changes

- [#471](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/471) [`d30112b`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/d30112bf2e999d053aeb9af8beb437a7872c1ee8) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Add ESLint language plugin support. The plugin now exports a `languages` object that provides language implementations for `json`, `jsonc`, `json5`, and `x`. The shared configurations (`base`, `recommended-with-json`, etc.) now use the `jsonc`-based language implementation by default (via `language: "jsonc/x"` in ESLint flat config) and have been updated to use the new language plugin approach instead of the parser approach.

- [#468](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/468) [`8c87c6c`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/8c87c6c46c6946af27b2f18d6bd5dcd0606bf84d) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Drop support for legacy config. The plugin now exports flat configs as the main configuration format. The previous `flat/*` namespace is kept for backward compatibility.

- [#465](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/465) [`62b2127`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/62b212710f31295002348c4cfb0337bb5a0f737c) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Drop support for older ESLint versions. The new minimum supported version is ESLint 9.38.0 or later.

- [#460](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/460) [`cc949e3`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/cc949e3622780fb83a81d58041f546db12e60ad6) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Drop support for older Node.js versions. The new minimum supported versions are: ^20.19.0 || ^22.13.0 || >=24

- [#469](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/469) [`ee27486`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/ee2748695ccedc72831ea7a8ccf273ff02b64e1e) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Convert to ESM-only package. The plugin now uses tsdown for bundling and is distributed as pure ESM. The package no longer supports CommonJS `require()` syntax. Users need to use `import` statements or dynamic `import()` to load the plugin.

- [#466](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/466) [`29e47c4`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/29e47c478031ac49dff1dfb3b2b847cc62c013ef) Thanks [@renovate](https://github.com/apps/renovate)! - Update dependency jsonc-eslint-parser to v3

- [#473](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/473) [`0f6d480`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/0f6d480b9fef765e8cfe288fa75e13f19c468a76) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: include "no-irregular-whitespace" rule in recommended configs

- [#477](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/477) [`75304cf`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/75304cfc65b04e6ff0a29d467a4ad3de07a3578f) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Removed re-export from jsonc-eslint-parser

### Minor Changes

- [#474](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/474) [`90c0d61`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/90c0d61116738447996eb9b8ae630313c042f048) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: replace espree with jsonc-eslint-parser for tokenization

- [#476](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/476) [`633b7d1`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/633b7d1f30fd6971700eca84929a70a7b7067f45) Thanks [@ota-meshi](https://github.com/ota-meshi)! - The JSONCSourceCode, JSONCToken, and JSONCComment types are now provided. Using these types, you can define a RuleContext type that is useful for creating JSON rules.

  e.g.

  ```ts
  import type * as core from "@eslint/core";
  export type RuleContext<RuleOptions extends unknown[] = unknown[]> =
    core.RuleContext<{
      LangOptions: JSONCLanguageOptions;
      Code: JSONCSourceCode;
      RuleOptions: RuleOptions;
      Node: JSONCNodeOrToken;
      MessageIds: string;
    }>;
  ```

## 2.21.1

### Patch Changes

- [#447](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/447) [`a8e405a`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/a8e405a49458d94efe6cd6f356a23cb6a27d0564) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: compatibility with ESLint v10

## 2.21.0

### Minor Changes

- [#426](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/426) [`efc00a6`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/efc00a613a78f2f15b6b9815b783bf92a3f838a5) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat(sort-array-values): improve to calculate the minimum edit distance for sorting and report the optimal sorting direction

- [#426](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/426) [`efc00a6`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/efc00a613a78f2f15b6b9815b783bf92a3f838a5) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat(sort-keys): improve to calculate the minimum edit distance for sorting and report the optimal sorting direction

## 2.20.1

### Patch Changes

- [#404](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/404) [`22b1700`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/22b1700428e8aad4ec4bc8d3b054067d3cddcffd) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency synckit to `^0.6.2 || ^0.7.3 || ^0.11.5`

## 2.20.0

### Minor Changes

- [#394](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/394) [`70d4b06`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/70d4b062b52495a716a0c2aaeb6c45c3b383bca4) Thanks [@ota-meshi](https://github.com/ota-meshi)! - minor refactor

- [#402](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/402) [`237932c`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/237932cc6bf469994c686bce597c612e00586347) Thanks [@JounQin](https://github.com/JounQin)! - refactor: hourcekeeping, bump all (dev) deps, stricter rule `options` typings

## 2.19.1

### Patch Changes

- [#392](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/392) [`623ee67`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/623ee679cfdc989303ae35c1ba024736ab30a919) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: more improve auto-fix of sort rules

## 2.19.0

### Minor Changes

- [#390](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/390) [`5950e3d`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/5950e3ddf2f3e9f169e692c48f564ba27d54e9fc) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: improve auto-fix of sort rules

## 2.18.2

### Patch Changes

- [#378](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/378) [`e46de35`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/e46de35da1e491064a2be7955c8aed0507126577) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: crash when used with eslint v9.15

## 2.18.1

### Patch Changes

- [#374](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/374) [`3f8a1b9`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/3f8a1b90b3b3a62bb5c598c62dc55a1d08ccea7b) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency eslint-json-compat-utils to ^0.2.0

## 2.18.0

### Minor Changes

- [#372](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/372) [`9dce7d3`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/9dce7d3dece96b4e22e7be6fc18fd4fd401edcfa) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: use eslint-json-compat-utils

## 2.17.0

### Minor Changes

- [#369](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/369) [`5b1e9ac`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/5b1e9ace7e1ae8e2c047b2562e58cfaf833a6b6b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Experimental support for `@eslint/json`

## 2.16.0

### Minor Changes

- [#342](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/342) [`8cc5b7f`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/8cc5b7f247bef5d806695d149e3046f19b58d2a4) Thanks [@onlywei](https://github.com/onlywei)! - Resolve other plugins relative to this one (as siblings)

## 2.15.1

### Patch Changes

- [#332](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/332) [`f2f9d75`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/f2f9d7553e5eba296cf3e154fbce6fe89a6a93a0) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: crash in `jsonc/auto`

## 2.15.0

### Minor Changes

- [#322](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/322) [`0dfdc50`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/0dfdc501d2a8e20619956eca113d2c4cee2b2773) Thanks [@Logicer16](https://github.com/Logicer16)! - feat: improved compatibility with `@types/eslint` for flat config.

## 2.14.1

### Patch Changes

- [#315](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/315) [`36b9fc7`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/36b9fc7aaa934883dc37c059ef02f1e9ba24ddb5) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: flat config issues

## 2.14.0

### Minor Changes

- [#311](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/311) [`451db46`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/451db4646b5a714c8ded68b1c03286eb7f60b16a) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Add support for flat config

## 2.13.0

### Minor Changes

- [#298](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/298) [`a40f021`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/a40f02114d455d0d7f3677b1d2e6a6522a8e72f4) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: `jsonc/auto` rule works even in flat config

## 2.12.2

### Patch Changes

- [#296](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/296) [`7e904d2`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/7e904d2911234db8eb9695a5c7c2335465a91bde) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency eslint-compat-utils to ^0.4.0

## 2.12.1

### Patch Changes

- [#294](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/294) [`bb9538a`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/bb9538ac57ad93fab7b8d0444d5b58fb0a842080) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency eslint-compat-utils to ^0.3.0

## 2.12.0

### Minor Changes

- [#292](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/292) [`de53d1e`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/de53d1e0303013cc6caf7ee0a8abc8539727cd2c) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update dependency eslint-compat-utils to ^0.2.0

## 2.11.2

### Patch Changes

- [`3291b57`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/3291b578e049bd39c4cc2da9cf07ef71b79c5147) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: add espree to dependencies

## 2.11.1

### Patch Changes

- [#283](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/283) [`994983b`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/994983bf3d267a5afe43d3e93729be1d188eb1c7) Thanks [@ota-meshi](https://github.com/ota-meshi)! - fix: wrong report for object option in `jsonc/object-curly-spacing`

## 2.11.0

### Minor Changes

- [#281](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/281) [`c9e326e`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/c9e326e34bacb92707ad1c92a35c64ed9c34b73d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Improve compatibility with ESLint v9

## 2.10.0

### Minor Changes

- [#265](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/265) [`8d503dd`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/8d503ddd845d370de446d7d2dc1e2c95d22a5ce1) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: use eslint-compat-utils

## 2.9.0

### Minor Changes

- [#243](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/243) [`48d3669`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/48d3669a7b20a47070514ea463dd63688b086052) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add new `allowLineSeparatedGroups` option to the `jsonc/sort-keys` rule

## 2.8.0

### Minor Changes

- [#234](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/234) [`70c558e`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/70c558e35b05ee1bd81a2c723d1c35b090409d2b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: export meta object

## 2.7.0

### Minor Changes

- [#221](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/221) [`0e46152`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/0e461529ff756775f4bb2d2b9548385f8418bcaa) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: use `@eslint-community` packages

## 2.6.0

### Minor Changes

- [#205](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/205) [`05be0a9`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/05be0a9a4ef1b277f681109bb85ca35cd166ca7d) Thanks [@danielrentz](https://github.com/danielrentz)! - disable `no-unused-vars` in base config

## 2.5.0

### Minor Changes

- [#199](https://github.com/ota-meshi/eslint-plugin-jsonc/pull/199) [`b3af910`](https://github.com/ota-meshi/eslint-plugin-jsonc/commit/b3af910f38359b92be6d69244ac442aa41a0f9a4) Thanks [@ota-meshi](https://github.com/ota-meshi)! - feat: add `jsonc/no-irregular-whitespace` rule
