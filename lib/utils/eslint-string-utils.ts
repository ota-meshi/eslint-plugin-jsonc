// Most source code was copied from ESLint v8.
// MIT License. Copyright OpenJS Foundation and other contributors, <www.openjsf.org>
/**
 * @fileoverview Utilities to operate on strings.
 * @author Stephen Wade
 */

import Graphemer from "graphemer";
// eslint-disable-next-line no-control-regex -- intentionally including control characters
const ASCII_REGEX = /^[\u0000-\u007f]*$/u;
let segmenter: Intl.Segmenter | undefined;
let splitter: Graphemer | undefined;

/**
 * Counts graphemes in a given string.
 * @param value A string to count graphemes.
 * @returns The number of graphemes in `value`.
 */
export function getGraphemeCount(value: string): number {
  if (ASCII_REGEX.test(value)) return value.length;

  try {
    if (!segmenter) segmenter = new Intl.Segmenter();

    return [...segmenter.segment(value)].length;
  } catch {
    // ignore
  }
  if (!splitter)
    // @ts-expect-error CJS interop
    splitter = new (Graphemer.default || Graphemer)();
  return splitter!.countGraphemes(value);
}
