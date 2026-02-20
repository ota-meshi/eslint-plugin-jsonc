/**
 * @fileoverview The JSONCSourceCode class.
 */

import { traverseNodes, VisitorKeys } from "jsonc-eslint-parser";
import type { AST } from "jsonc-eslint-parser";
import type {
  TraversalStep,
  IDirective as Directive,
} from "@eslint/plugin-kit";
import {
  TextSourceCodeBase,
  CallMethodStep,
  VisitNodeStep,
  ConfigCommentParser,
  Directive as DirectiveImpl,
} from "@eslint/plugin-kit";
import type { DirectiveType, FileProblem, RulesConfig } from "@eslint/core";
import {
  TokenStore,
  type CursorWithSkipOptionsWithoutFilter,
  type CursorWithSkipOptionsWithFilter,
  type CursorWithSkipOptionsWithComment,
  type CursorWithCountOptionsWithoutFilter,
  type CursorWithCountOptionsWithFilter,
  type CursorWithCountOptionsWithComment,
} from "@ota-meshi/ast-token-store";
import type { AST as ESLintAST } from "eslint";
import type { Scope } from "eslint";
import type { Comment } from "estree";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const commentParser = new ConfigCommentParser();

/**
 * Pattern to match ESLint inline configuration comments in JSONC.
 * Matches: eslint, eslint-disable, eslint-enable, eslint-disable-line, eslint-disable-next-line
 */
const INLINE_CONFIG =
  /^\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|$)/u;

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/**
 * A comment token with required range and loc.
 */
export type JSONCComment = Comment & {
  range: [number, number];
  loc: AST.SourceLocation;
};

/**
 * JSONC-specific syntax element type
 */
export type JSONCSyntaxElement = AST.JSONNode | JSONCTokenOrComment;
export type JSONCToken = ESLintAST.Token;
export type JSONCTokenOrComment = JSONCToken | JSONCComment;

/**
 * JSONC Source Code Object
 */
export class JSONCSourceCode extends TextSourceCodeBase<{
  LangOptions: Record<never, never>;
  RootNode: AST.JSONProgram;
  SyntaxElementWithLoc: JSONCSyntaxElement;
  ConfigNode: JSONCComment;
}> {
  public readonly hasBOM: boolean;

  public readonly parserServices: {
    isJSON?: boolean;
    parseError?: unknown;
  };

  public readonly visitorKeys: Record<string, string[]>;

  private readonly tokenStore: TokenStore<
    AST.JSONNode,
    JSONCToken,
    JSONCComment
  >;

  #steps: TraversalStep[] | null = null;

  #cacheTokensAndComments: (JSONCToken | JSONCComment)[] | null = null;

  #inlineConfigComments: JSONCComment[] | null = null;

  /**
   * Creates a new instance.
   */
  public constructor(config: {
    text: string;
    ast: AST.JSONProgram;
    hasBOM: boolean;
    parserServices: { isJSON: boolean; parseError?: unknown };
    visitorKeys?: Record<string, string[]> | null | undefined;
  }) {
    super({
      ast: config.ast,
      text: config.text,
    });
    this.hasBOM = Boolean(config.hasBOM);
    this.parserServices = config.parserServices;
    this.visitorKeys = config.visitorKeys || VisitorKeys;
    this.tokenStore = new TokenStore<AST.JSONNode, JSONCToken, JSONCComment>({
      tokens: [
        ...(config.ast.tokens as (JSONCToken | JSONCComment)[]),
        ...(config.ast.comments as JSONCComment[]),
      ],
      isComment: (token): token is JSONCComment =>
        token.type === "Block" || token.type === "Line",
    });
  }

  public traverse(): Iterable<TraversalStep> {
    if (this.#steps != null) {
      return this.#steps;
    }

    const steps: (VisitNodeStep | CallMethodStep)[] = [];
    this.#steps = steps;

    const root = this.ast;
    steps.push(
      // ESLint core rule compatibility: onCodePathStart is called with two arguments.
      new CallMethodStep({
        target: "onCodePathStart",
        args: [{}, root],
      }),
    );

    traverseNodes(root, {
      enterNode(n) {
        steps.push(
          new VisitNodeStep({
            target: n,
            phase: 1,
            args: [n],
          }),
        );
      },
      leaveNode(n) {
        steps.push(
          new VisitNodeStep({
            target: n,
            phase: 2,
            args: [n],
          }),
        );
      },
    });

    steps.push(
      // ESLint core rule compatibility: onCodePathEnd is called with two arguments.
      new CallMethodStep({
        target: "onCodePathEnd",
        args: [{}, root],
      }),
    );
    return steps;
  }

  /**
   * Gets all tokens and comments.
   */
  public get tokensAndComments(): JSONCTokenOrComment[] {
    return (this.#cacheTokensAndComments ??= [
      ...this.ast.tokens,
      ...(this.ast.comments as JSONCComment[]),
    ].sort((a, b) => a.range[0] - b.range[0]));
  }

  public getLines(): string[] {
    return this.lines;
  }

  public getAllComments(): JSONCComment[] {
    return this.tokenStore.getAllComments();
  }

  /**
   * Returns an array of all inline configuration nodes found in the source code.
   * This includes eslint-disable, eslint-enable, eslint-disable-line,
   * eslint-disable-next-line, and eslint (for inline config) comments.
   */
  public getInlineConfigNodes(): JSONCComment[] {
    if (!this.#inlineConfigComments) {
      this.#inlineConfigComments = (this.ast.comments as JSONCComment[]).filter(
        (comment) => INLINE_CONFIG.test(comment.value),
      );
    }

    return this.#inlineConfigComments;
  }

  /**
   * Returns directives that enable or disable rules along with any problems
   * encountered while parsing the directives.
   */
  public getDisableDirectives(): {
    directives: Directive[];
    problems: FileProblem[];
  } {
    const problems: FileProblem[] = [];
    const directives: Directive[] = [];

    this.getInlineConfigNodes().forEach((comment) => {
      const directive = commentParser.parseDirective(comment.value);

      if (!directive) {
        return;
      }

      const { label, value, justification } = directive;

      // `eslint-disable-line` directives are not allowed to span multiple lines
      // as it would be confusing to which lines they apply
      if (
        label === "eslint-disable-line" &&
        comment.loc.start.line !== comment.loc.end.line
      ) {
        const message = `${label} comment should not span multiple lines.`;

        problems.push({
          ruleId: null,
          message,
          loc: comment.loc,
        });
        return;
      }

      switch (label) {
        case "eslint-disable":
        case "eslint-enable":
        case "eslint-disable-next-line":
        case "eslint-disable-line": {
          const directiveType = label.slice("eslint-".length);

          directives.push(
            new DirectiveImpl({
              type: directiveType as DirectiveType,
              node: comment,
              value,
              justification,
            }),
          );
          break;
        }
        // no default
      }
    });

    return { problems, directives };
  }

  /**
   * Returns inline rule configurations along with any problems
   * encountered while parsing the configurations.
   */
  public applyInlineConfig(): {
    configs: { config: { rules: RulesConfig }; loc: AST.SourceLocation }[];
    problems: FileProblem[];
  } {
    const problems: FileProblem[] = [];
    const configs: {
      config: { rules: RulesConfig };
      loc: AST.SourceLocation;
    }[] = [];

    this.getInlineConfigNodes().forEach((comment) => {
      const directive = commentParser.parseDirective(comment.value);

      if (!directive) {
        return;
      }

      const { label, value } = directive;

      if (label === "eslint") {
        const parseResult = commentParser.parseJSONLikeConfig(value);

        if (parseResult.ok) {
          configs.push({
            config: {
              rules: parseResult.config,
            },
            loc: comment.loc,
          });
        } else {
          problems.push({
            ruleId: null,
            message: parseResult.error.message,
            loc: comment.loc,
          });
        }
      }
    });

    return { configs, problems };
  }

  /**
   * Gets the source text for the given node or the entire source if no node is provided.
   */
  public getText(
    node?: JSONCSyntaxElement,
    beforeCount?: number,
    afterCount?: number,
  ): string {
    if (!node) return this.text;
    const range = (node as { range: [number, number] }).range;
    const start = range[0] - (beforeCount ?? 0);
    const end = range[1] + (afterCount ?? 0);
    return this.text.slice(Math.max(0, start), Math.min(this.text.length, end));
  }

  public getNodeByRangeIndex(index: number): AST.JSONNode | null {
    let node = find([this.ast]);
    if (!node) return null;
    while (true) {
      const child = find(this._getChildren(node));
      if (!child) return node;
      node = child;
    }

    /**
     * Finds a node that contains the given index.
     */
    function find(nodes: AST.JSONNode[]) {
      for (const node of nodes) {
        if (node.range[0] <= index && index < node.range[1]) {
          return node;
        }
      }
      return null;
    }
  }

  /**
   * Gets the first token of the given node.
   */
  public getFirstToken(node: JSONCSyntaxElement): JSONCToken;

  /**
   * Gets the first token of the given node with options.
   */
  public getFirstToken(
    node: JSONCSyntaxElement,
    options: CursorWithSkipOptionsWithoutFilter,
  ): JSONCToken | null;

  /**
   * Gets the first token of the given node with filter options.
   */
  public getFirstToken<R extends JSONCToken>(
    node: JSONCSyntaxElement,
    options: CursorWithSkipOptionsWithFilter<JSONCToken, R>,
  ): R | null;

  /**
   * Gets the first token of the given node with comment options.
   */
  public getFirstToken<R extends JSONCToken | JSONCComment>(
    node: JSONCSyntaxElement,
    options: CursorWithSkipOptionsWithComment<JSONCToken, JSONCComment, R>,
  ): R | null;

  public getFirstToken(
    node: JSONCSyntaxElement,
    options?:
      | CursorWithSkipOptionsWithoutFilter
      | CursorWithSkipOptionsWithFilter<JSONCToken>
      | CursorWithSkipOptionsWithComment<JSONCToken, JSONCComment>,
  ): JSONCToken | JSONCComment | null {
    return this.tokenStore.getFirstToken(node, options as never);
  }

  /**
   * Gets the first tokens of the given node.
   */
  public getFirstTokens(
    node: JSONCSyntaxElement,
    options?: CursorWithCountOptionsWithoutFilter,
  ): JSONCToken[];

  /**
   * Gets the first tokens of the given node with filter options.
   */
  public getFirstTokens<R extends JSONCToken>(
    node: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithFilter<JSONCToken, R>,
  ): R[];

  /**
   * Gets the first tokens of the given node with comment options.
   */
  public getFirstTokens<R extends JSONCToken | JSONCComment>(
    node: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithComment<JSONCToken, JSONCComment, R>,
  ): R[];

  public getFirstTokens(
    node: JSONCSyntaxElement,
    options?:
      | CursorWithCountOptionsWithoutFilter
      | CursorWithCountOptionsWithFilter<JSONCToken>
      | CursorWithCountOptionsWithComment<JSONCToken, JSONCComment>,
  ): (JSONCToken | JSONCComment)[] {
    return this.tokenStore.getFirstTokens(node, options as never);
  }

  /**
   * Gets the last token of the given node.
   */
  public getLastToken(node: JSONCSyntaxElement): JSONCToken;

  /**
   * Gets the last token of the given node with options.
   */
  public getLastToken(
    node: JSONCSyntaxElement,
    options: CursorWithSkipOptionsWithoutFilter,
  ): JSONCToken | null;

  /**
   * Gets the last token of the given node with filter options.
   */
  public getLastToken<R extends JSONCToken>(
    node: JSONCSyntaxElement,
    options: CursorWithSkipOptionsWithFilter<JSONCToken, R>,
  ): R | null;

  /**
   * Gets the last token of the given node with comment options.
   */
  public getLastToken<R extends JSONCToken | JSONCComment>(
    node: JSONCSyntaxElement,
    options: CursorWithSkipOptionsWithComment<JSONCToken, JSONCComment, R>,
  ): R | null;

  public getLastToken(
    node: JSONCSyntaxElement,
    options?:
      | CursorWithSkipOptionsWithoutFilter
      | CursorWithSkipOptionsWithFilter<JSONCToken>
      | CursorWithSkipOptionsWithComment<JSONCToken, JSONCComment>,
  ): (JSONCToken | JSONCComment) | null {
    return this.tokenStore.getLastToken(node, options as never);
  }

  /**
   * Get the last tokens of the given node.
   */
  public getLastTokens(
    node: JSONCSyntaxElement,
    options?: CursorWithCountOptionsWithoutFilter,
  ): JSONCToken[];

  /**
   * Get the last tokens of the given node with filter options.
   */
  public getLastTokens<R extends JSONCToken>(
    node: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithFilter<JSONCToken, R>,
  ): R[];

  /**
   * Get the last tokens of the given node with comment options.
   */
  public getLastTokens<R extends JSONCToken | JSONCComment>(
    node: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithComment<JSONCToken, JSONCComment, R>,
  ): R[];

  public getLastTokens(
    node: JSONCSyntaxElement,
    options?:
      | CursorWithCountOptionsWithoutFilter
      | CursorWithCountOptionsWithFilter<JSONCToken>
      | CursorWithCountOptionsWithComment<JSONCToken, JSONCComment>,
  ): (JSONCToken | JSONCComment)[] {
    return this.tokenStore.getLastTokens(node, options as never);
  }

  /**
   * Gets the token that precedes a given node or token.
   */
  public getTokenBefore(
    node: JSONCSyntaxElement,
    options?: CursorWithSkipOptionsWithoutFilter,
  ): JSONCToken | null;

  /**
   * Gets the token that precedes a given node or token with filter options.
   */
  public getTokenBefore<R extends JSONCToken>(
    node: JSONCSyntaxElement,
    options: CursorWithSkipOptionsWithFilter<JSONCToken, R>,
  ): R | null;

  /**
   * Gets the token that precedes a given node or token with comment options.
   */
  public getTokenBefore<R extends JSONCToken | JSONCComment>(
    node: JSONCSyntaxElement,
    options: CursorWithSkipOptionsWithComment<JSONCToken, JSONCComment, R>,
  ): R | null;

  public getTokenBefore(
    node: JSONCSyntaxElement,
    options?:
      | CursorWithSkipOptionsWithoutFilter
      | CursorWithSkipOptionsWithFilter<JSONCToken>
      | CursorWithSkipOptionsWithComment<JSONCToken, JSONCComment>,
  ): JSONCToken | JSONCComment | null {
    return this.tokenStore.getTokenBefore(node, options as never);
  }

  /**
   * Gets the `count` tokens that precedes a given node or token.
   */
  public getTokensBefore(
    node: JSONCSyntaxElement,
    options?: CursorWithCountOptionsWithoutFilter,
  ): JSONCToken[];

  /**
   * Gets the `count` tokens that precedes a given node or token with filter options.
   */
  public getTokensBefore<R extends JSONCToken>(
    node: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithFilter<JSONCToken, R>,
  ): R[];

  /**
   * Gets the `count` tokens that precedes a given node or token with comment options.
   */
  public getTokensBefore<R extends JSONCToken | JSONCComment>(
    node: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithComment<JSONCToken, JSONCComment, R>,
  ): R[];

  public getTokensBefore(
    node: JSONCSyntaxElement,
    options?:
      | CursorWithCountOptionsWithoutFilter
      | CursorWithCountOptionsWithFilter<JSONCToken>
      | CursorWithCountOptionsWithComment<JSONCToken, JSONCComment>,
  ): (JSONCToken | JSONCComment)[] {
    return this.tokenStore.getTokensBefore(node, options as never);
  }

  /**
   * Gets the token that follows a given node or token.
   */
  public getTokenAfter(
    node: JSONCSyntaxElement,
    options?: CursorWithSkipOptionsWithoutFilter,
  ): JSONCToken | null;

  /**
   * Gets the token that follows a given node or token with filter options.
   */
  public getTokenAfter<R extends JSONCToken>(
    node: JSONCSyntaxElement,
    options: CursorWithSkipOptionsWithFilter<JSONCToken, R>,
  ): R | null;

  /**
   * Gets the token that follows a given node or token with comment options.
   */
  public getTokenAfter<R extends JSONCToken | JSONCComment>(
    node: JSONCSyntaxElement,
    options: CursorWithSkipOptionsWithComment<JSONCToken, JSONCComment, R>,
  ): R | null;

  public getTokenAfter(
    node: JSONCSyntaxElement,
    options?:
      | CursorWithSkipOptionsWithoutFilter
      | CursorWithSkipOptionsWithFilter<JSONCToken>
      | CursorWithSkipOptionsWithComment<JSONCToken, JSONCComment>,
  ): JSONCToken | JSONCComment | null {
    return this.tokenStore.getTokenAfter(node, options as never);
  }

  /**
   * Gets the `count` tokens that follows a given node or token.
   */
  public getTokensAfter(
    node: JSONCSyntaxElement,
    options?: CursorWithCountOptionsWithoutFilter,
  ): JSONCToken[];

  /**
   * Gets the `count` tokens that follows a given node or token with filter options.
   */
  public getTokensAfter<R extends JSONCToken>(
    node: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithFilter<JSONCToken, R>,
  ): R[];

  /**
   * Gets the `count` tokens that follows a given node or token with comment options.
   */
  public getTokensAfter<R extends JSONCToken | JSONCComment>(
    node: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithComment<JSONCToken, JSONCComment, R>,
  ): R[];

  public getTokensAfter(
    node: JSONCSyntaxElement,
    options?:
      | CursorWithCountOptionsWithoutFilter
      | CursorWithCountOptionsWithFilter<JSONCToken>
      | CursorWithCountOptionsWithComment<JSONCToken, JSONCComment>,
  ): (JSONCToken | JSONCComment)[] {
    return this.tokenStore.getTokensAfter(node, options as never);
  }

  /**
   * Gets the first token between two non-overlapping nodes.
   */
  public getFirstTokenBetween(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options?: CursorWithSkipOptionsWithoutFilter,
  ): JSONCToken | null;

  /**
   * Gets the first token between two non-overlapping nodes with filter options.
   */
  public getFirstTokenBetween<R extends JSONCToken>(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options: CursorWithSkipOptionsWithFilter<JSONCToken, R>,
  ): R | null;

  /**
   * Gets the first token between two non-overlapping nodes with comment options.
   */
  public getFirstTokenBetween<R extends JSONCToken | JSONCComment>(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options: CursorWithSkipOptionsWithComment<JSONCToken, JSONCComment, R>,
  ): R | null;

  public getFirstTokenBetween(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options?:
      | CursorWithSkipOptionsWithoutFilter
      | CursorWithSkipOptionsWithFilter<JSONCToken>
      | CursorWithSkipOptionsWithComment<JSONCToken, JSONCComment>,
  ): JSONCToken | JSONCComment | null {
    return this.tokenStore.getFirstTokenBetween(left, right, options as never);
  }

  /**
   * Gets the first tokens between two non-overlapping nodes.
   */
  public getFirstTokensBetween(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options?: CursorWithCountOptionsWithoutFilter,
  ): JSONCToken[];

  /**
   * Gets the first tokens between two non-overlapping nodes with filter options.
   */
  public getFirstTokensBetween<R extends JSONCToken>(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithFilter<JSONCToken, R>,
  ): R[];

  /**
   * Gets the first tokens between two non-overlapping nodes with comment options.
   */
  public getFirstTokensBetween<R extends JSONCToken | JSONCComment>(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithComment<JSONCToken, JSONCComment, R>,
  ): R[];

  public getFirstTokensBetween(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options?:
      | CursorWithCountOptionsWithoutFilter
      | CursorWithCountOptionsWithFilter<JSONCToken>
      | CursorWithCountOptionsWithComment<JSONCToken, JSONCComment>,
  ): (JSONCToken | JSONCComment)[] {
    return this.tokenStore.getFirstTokensBetween(left, right, options as never);
  }

  /**
   * Gets the last token between two non-overlapping nodes.
   */
  public getLastTokenBetween(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options?: CursorWithSkipOptionsWithoutFilter,
  ): JSONCToken | null;

  /**
   * Gets the last token between two non-overlapping nodes with filter options.
   */
  public getLastTokenBetween<R extends JSONCToken>(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options: CursorWithSkipOptionsWithFilter<JSONCToken, R>,
  ): R | null;

  /**
   * Gets the last token between two non-overlapping nodes with comment options.
   */
  public getLastTokenBetween<R extends JSONCToken | JSONCComment>(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options: CursorWithSkipOptionsWithComment<JSONCToken, JSONCComment, R>,
  ): R | null;

  public getLastTokenBetween(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options?:
      | CursorWithSkipOptionsWithoutFilter
      | CursorWithSkipOptionsWithFilter<JSONCToken>
      | CursorWithSkipOptionsWithComment<JSONCToken, JSONCComment>,
  ): JSONCToken | JSONCComment | null {
    return this.tokenStore.getLastTokenBetween(left, right, options as never);
  }

  /**
   * Gets the last tokens between two non-overlapping nodes.
   */
  public getLastTokensBetween(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options?: CursorWithCountOptionsWithoutFilter,
  ): JSONCToken[];

  /**
   * Gets the last tokens between two non-overlapping nodes with filter options.
   */
  public getLastTokensBetween<R extends JSONCToken>(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithFilter<JSONCToken, R>,
  ): R[];

  /**
   * Gets the last tokens between two non-overlapping nodes with comment options.
   */
  public getLastTokensBetween<R extends JSONCToken | JSONCComment>(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithComment<JSONCToken, JSONCComment, R>,
  ): R[];

  public getLastTokensBetween(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options?:
      | CursorWithCountOptionsWithoutFilter
      | CursorWithCountOptionsWithFilter<JSONCToken>
      | CursorWithCountOptionsWithComment<JSONCToken, JSONCComment>,
  ): (JSONCToken | JSONCComment)[] {
    return this.tokenStore.getLastTokensBetween(left, right, options as never);
  }

  /**
   * Gets all tokens that are related to the given node.
   */
  public getTokens(
    node: JSONCSyntaxElement,
    options?: CursorWithCountOptionsWithoutFilter,
  ): JSONCToken[];

  /**
   * Gets all tokens that are related to the given node with filter options.
   */
  public getTokens<R extends JSONCToken>(
    node: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithFilter<JSONCToken, R>,
  ): R[];

  /**
   * Gets all tokens that are related to the given node with comment options.
   */
  public getTokens<R extends JSONCToken | JSONCComment>(
    node: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithComment<JSONCToken, JSONCComment, R>,
  ): R[];

  public getTokens(
    node: JSONCSyntaxElement,
    options?:
      | CursorWithCountOptionsWithoutFilter
      | CursorWithCountOptionsWithFilter<JSONCToken>
      | CursorWithCountOptionsWithComment<JSONCToken, JSONCComment>,
  ): (JSONCToken | JSONCComment)[] {
    return this.tokenStore.getTokens(node, options as never);
  }

  /**
   * Gets all of the tokens between two non-overlapping nodes.
   */
  public getTokensBetween(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options?: CursorWithCountOptionsWithoutFilter,
  ): JSONCToken[];

  /**
   * Gets all of the tokens between two non-overlapping nodes with filter options.
   */
  public getTokensBetween<R extends JSONCToken>(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithFilter<JSONCToken, R>,
  ): R[];

  /**
   * Gets all of the tokens between two non-overlapping nodes with comment options.
   */
  public getTokensBetween<R extends JSONCToken | JSONCComment>(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options: CursorWithCountOptionsWithComment<JSONCToken, JSONCComment, R>,
  ): R[];

  public getTokensBetween(
    left: JSONCSyntaxElement,
    right: JSONCSyntaxElement,
    options?:
      | CursorWithCountOptionsWithoutFilter
      | CursorWithCountOptionsWithFilter<JSONCToken>
      | CursorWithCountOptionsWithComment<JSONCToken, JSONCComment>,
  ): (JSONCToken | JSONCComment)[] {
    return this.tokenStore.getTokensBetween(left, right, options as never);
  }

  public getCommentsInside(nodeOrToken: JSONCSyntaxElement): JSONCComment[] {
    return this.tokenStore.getCommentsInside(nodeOrToken);
  }

  public getCommentsBefore(nodeOrToken: JSONCSyntaxElement): JSONCComment[] {
    return this.tokenStore.getCommentsBefore(nodeOrToken);
  }

  public getCommentsAfter(nodeOrToken: JSONCSyntaxElement): JSONCComment[] {
    return this.tokenStore.getCommentsAfter(nodeOrToken);
  }

  public isSpaceBetween(
    first: JSONCToken | JSONCComment,
    second: JSONCToken | JSONCComment,
  ): boolean {
    // Normalize order: ensure left comes before right
    const [left, right] =
      first.range[1] <= second.range[0] ? [first, second] : [second, first];
    return this.tokenStore.isSpaceBetween(left, right);
  }

  /**
   * Compatibility for ESLint's SourceCode API
   * @deprecated JSONC does not have scopes
   */
  public getScope(node?: AST.JSONNode): Scope.Scope | null {
    if (node?.type !== "Program") {
      return null;
    }
    return createFakeGlobalScope(this.ast);
  }

  /**
   * Compatibility for ESLint's SourceCode API
   * @deprecated JSONC does not have scopes
   */
  public get scopeManager(): Scope.ScopeManager | null {
    return {
      scopes: [],
      globalScope: createFakeGlobalScope(this.ast),
      acquire: (node) => {
        if (node.type === "Program") {
          return createFakeGlobalScope(this.ast);
        }
        return null;
      },
      getDeclaredVariables: () => [],
      addGlobals: () => {
        // noop
      },
    };
  }

  /**
   * Compatibility for ESLint's SourceCode API
   * @deprecated
   */
  public isSpaceBetweenTokens(
    first: JSONCTokenOrComment,
    second: JSONCTokenOrComment,
  ): boolean {
    return this.isSpaceBetween(first, second);
  }

  private _getChildren(node: AST.JSONNode) {
    const keys = this.visitorKeys[node.type] || [];
    const children: AST.JSONNode[] = [];
    for (const key of keys) {
      const value = (node as unknown as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        for (const element of value) {
          if (isNode(element)) {
            children.push(element);
          }
        }
      } else if (isNode(value)) {
        children.push(value);
      }
    }
    return children;
  }
}

/**
 * Determines whether the given value is a JSONC AST node.
 */
function isNode(value: unknown): value is AST.JSONNode {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).type === "string" &&
    Array.isArray((value as Record<string, unknown>).range) &&
    Boolean((value as Record<string, unknown>).loc) &&
    typeof (value as Record<string, unknown>).loc === "object"
  );
}

/**
 * Creates a fake global scope for JSONC files.
 * @deprecated JSONC does not have scopes
 */
function createFakeGlobalScope(node: AST.JSONProgram): Scope.Scope {
  const fakeGlobalScope: Scope.Scope = {
    type: "global",
    block: node as never,
    set: new Map(),
    through: [],
    childScopes: [],
    variableScope: null as never,
    variables: [],
    references: [],
    functionExpressionScope: false,
    isStrict: false,
    upper: null,
    implicit: {
      variables: [],
      set: new Map(),
    },
  };
  fakeGlobalScope.variableScope = fakeGlobalScope;
  return fakeGlobalScope;
}
