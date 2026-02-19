/**
 * @fileoverview The JSONC language implementation for ESLint.
 */
import type { Language, File, OkParseResult } from "@eslint/core";
import { parseForESLint, VisitorKeys } from "jsonc-eslint-parser";
import type { AST } from "jsonc-eslint-parser";
import { JSONCSourceCode } from "./jsonc-source-code.ts";

/**
 * Parse result
 */
interface JSONCParseResult {
  ok: true;
  ast: AST.JSONProgram;
}

/**
 * Language options for JSONC.
 */
export type JSONCLanguageOptions = {
  parserOptions?: Record<string, unknown>;
};

/**
 * The JSONC language implementation for ESLint.
 */
export class JSONCLanguage
  implements
    Language<{
      LangOptions: JSONCLanguageOptions;
      Code: JSONCSourceCode;
      RootNode: AST.JSONProgram;
      Node: AST.JSONNode;
    }>
{
  /**
   * The type of file to read.
   */
  public fileType = "text" as const;

  /**
   * The line number at which the parser starts counting.
   */
  public lineStart = 1 as const;

  /**
   * The column number at which the parser starts counting.
   */
  public columnStart = 0 as const;

  /**
   * The name of the key that holds the type of the node.
   */
  public nodeTypeKey = "type" as const;

  /**
   * Validates the language options.
   */
  public validateLanguageOptions(
    _languageOptions: JSONCLanguageOptions,
  ): void {
    // Currently no validation needed
  }

  public normalizeLanguageOptions(
    languageOptions: JSONCLanguageOptions,
  ): JSONCLanguageOptions {
    const fakeProperties: Record<string, unknown> = {
      ecmaVersion: "latest",
    };
    return {
      ...fakeProperties,
      ...languageOptions,
      parserOptions: {
        ...languageOptions.parserOptions,
      },
    };
  }

  /**
   * Parses the given file into an AST.
   */
  public parse(
    file: File,
    _context: { languageOptions?: JSONCLanguageOptions },
  ): OkParseResult<AST.JSONProgram> | JSONCParseResult {
    // Note: BOM already removed
    const text = file.body as string;

    const result = parseForESLint(text, {
      filePath: file.path,
    });

    return {
      ok: true,
      ast: result.ast,
    };
  }

  /**
   * Creates a new SourceCode object for the given file and parse result.
   */
  public createSourceCode(
    file: File,
    parseResult: OkParseResult<AST.JSONProgram> | JSONCParseResult,
  ): JSONCSourceCode {
    return new JSONCSourceCode({
      text: file.body as string,
      ast: parseResult.ast,
      hasBOM: file.bom,
      parserServices: { isJSON: true },
      visitorKeys: VisitorKeys,
    });
  }
}
