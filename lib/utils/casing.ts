// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

export type CasingKind =
  | "camelCase"
  | "kebab-case"
  | "PascalCase"
  | "snake_case"
  | "SCREAMING_SNAKE_CASE";

export const allowedCaseOptions: CasingKind[] = [
  "camelCase",
  "kebab-case",
  "PascalCase",
  "snake_case",
  "SCREAMING_SNAKE_CASE",
];

/**
 * Capitalize a string.
 * @param {string} str
 */
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Checks whether the given string has symbols.
 * @param {string} str
 */
function hasSymbols(str: string) {
  return /[\u0021-\u0023\u0025-\u002c./\u003a-\u0040\u005b-\u005e`\u007b-\u007d]/u.test(
    str,
  ); // without " ", "$", "-" and "_"
}

/**
 * Checks whether the given string has upper.
 * @param {string} str
 */
function hasUpper(str: string) {
  return /[A-Z]/u.test(str);
}

/**
 * Checks whether the given string has lower.
 * @param {string} str
 */
function hasLower(str: string) {
  return /[a-z]/u.test(str);
}

/**
 * Convert text to kebab-case
 * @param {string} str Text to be converted
 * @return {string}
 */
export function kebabCase(str: string): string {
  let res = str.replace(/_/gu, "-");
  if (hasLower(res)) {
    res = res.replace(/\B([A-Z])/gu, "-$1");
  }
  return res.toLowerCase();
}

/**
 * Checks whether the given string is kebab-case.
 * @param {string} str
 */
export function isKebabCase(str: string): boolean {
  if (
    hasUpper(str) ||
    hasSymbols(str) ||
    str.startsWith("-") || // starts with hyphen is not kebab-case
    /_|--|\s/u.test(str)
  ) {
    return false;
  }
  return true;
}

/**
 * Convert text to snake_case
 * @param {string} str Text to be converted
 * @return {string}
 */
export function snakeCase(str: string): string {
  let res = str.replace(/-/gu, "_");
  if (hasLower(res)) {
    res = res.replace(/\B([A-Z])/gu, "_$1");
  }
  return res.toLowerCase();
}

/**
 * Checks whether the given string is snake_case.
 * @param {string} str
 */
export function isSnakeCase(str: string): boolean {
  if (hasUpper(str) || hasSymbols(str) || /-|__|\s/u.test(str)) {
    return false;
  }
  return true;
}

/**
 * Convert text to SCREAMING_SNAKE_CASE
 * @param {string} str Text to be converted
 * @return {string}
 */
export function screamingSnakeCase(str: string): string {
  let res = str.replace(/-/gu, "_");
  if (hasLower(res)) {
    res = res.replace(/\B([A-Z])/gu, "_$1");
  }
  return res.toUpperCase();
}

/**
 * Checks whether the given string is SCREAMING_SNAKE_CASE.
 * @param {string} str
 */
export function isScreamingSnakeCase(str: string): boolean {
  if (hasLower(str) || hasSymbols(str) || /-|__|\s/u.test(str)) {
    return false;
  }
  return true;
}

/**
 * Convert text to camelCase
 * @param {string} str Text to be converted
 * @return {string} Converted string
 */
export function camelCase(str: string): string {
  if (isPascalCase(str)) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
  let s = str;
  if (!hasLower(s)) {
    s = s.toLowerCase();
  }
  return s.replace(/[-_](\w)/gu, (_, c) => (c ? c.toUpperCase() : ""));
}

/**
 * Checks whether the given string is camelCase.
 * @param {string} str
 */
export function isCamelCase(str: string): boolean {
  if (
    hasSymbols(str) ||
    /^[A-Z]/u.test(str) ||
    /[\s\-_]/u.test(str) // kebab or snake or space
  ) {
    return false;
  }
  return true;
}

/**
 * Convert text to PascalCase
 * @param {string} str Text to be converted
 * @return {string} Converted string
 */
export function pascalCase(str: string): string {
  return capitalize(camelCase(str));
}

/**
 * Checks whether the given string is PascalCase.
 * @param {string} str
 */
export function isPascalCase(str: string): boolean {
  if (
    hasSymbols(str) ||
    /^[a-z]/u.test(str) ||
    /[\s\-_]/u.test(str) // kebab or snake or space
  ) {
    return false;
  }
  return true;
}

const convertersMap = {
  "kebab-case": kebabCase,
  snake_case: snakeCase,
  SCREAMING_SNAKE_CASE: screamingSnakeCase,
  camelCase,
  PascalCase: pascalCase,
};

const checkersMap = {
  "kebab-case": isKebabCase,
  snake_case: isSnakeCase,
  SCREAMING_SNAKE_CASE: isScreamingSnakeCase,
  camelCase: isCamelCase,
  PascalCase: isPascalCase,
};

/**
 * Return case checker
 * @param name type of checker to return ('camelCase', 'kebab-case', 'PascalCase')
 */
export function getChecker(name: CasingKind): (str: string) => boolean {
  return checkersMap[name] || isPascalCase;
}

/**
 * Return case converter
 * @param name type of converter to return
 */
export function getConverter(name: CasingKind): (str: string) => string {
  return convertersMap[name] || pascalCase;
}

/**
 * Return case exact converter.
 * If the converted result is not the correct case, the original value is returned.
 * @param name type of converter to return ('camelCase', 'kebab-case', 'PascalCase')
 */
export function getExactConverter(name: CasingKind): (str: string) => string {
  const converter = getConverter(name);
  const checker = getChecker(name);
  return (str: string) => {
    const result = converter(str);
    return checker(result) ? result : str; /* cannot convert */
  };
}
