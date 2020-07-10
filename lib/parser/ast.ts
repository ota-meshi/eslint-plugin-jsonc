import type { AST } from "eslint"
import type { Comment } from "estree"

export interface Locations {
    loc: SourceLocation
    range: [number, number]
}

interface BaseJSONNode extends Locations {
    type: string
}

interface SourceLocation {
    start: Position
    end: Position
}

export interface Position {
    /** >= 1 */
    line: number
    /** >= 0 */
    column: number
}

export type JSONNode =
    | JSONProgram
    | JSONExpressionStatement
    | JSONExpression
    | JSONProperty
    | JSONIdentifier
export interface JSONProgram extends BaseJSONNode {
    type: "Program"
    body: [JSONExpressionStatement]
    comments: Comment[]
    tokens: AST.Token[]
}

export interface JSONExpressionStatement extends BaseJSONNode {
    type: "JSONExpressionStatement"
    expression: JSONExpression
}

export type JSONExpression =
    | JSONArrayExpression
    | JSONObjectExpression
    | JSONLiteral

export interface JSONArrayExpression extends BaseJSONNode {
    type: "JSONArrayExpression"
    elements: JSONExpression[]
}

export interface JSONObjectExpression extends BaseJSONNode {
    type: "JSONObjectExpression"
    properties: JSONProperty[]
}

export interface JSONProperty extends BaseJSONNode {
    type: "JSONProperty"
    key: JSONIdentifier | JSONLiteral
    value: JSONExpression
}

export interface JSONIdentifier extends BaseJSONNode {
    type: "JSONIdentifier"
    name: string
}

export interface JSONLiteral extends BaseJSONNode {
    type: "JSONLiteral"
    value: string | boolean | number | null
    raw: string
}
