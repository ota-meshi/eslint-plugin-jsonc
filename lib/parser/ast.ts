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
    parent?: null
}

export interface JSONExpressionStatement extends BaseJSONNode {
    type: "JSONExpressionStatement"
    expression: JSONExpression
    parent?: JSONProgram
}

export type JSONExpression =
    | JSONArrayExpression
    | JSONObjectExpression
    | JSONLiteral
    | JSONUnaryExpression
    | JSONNumberIdentifier

export interface JSONArrayExpression extends BaseJSONNode {
    type: "JSONArrayExpression"
    elements: JSONExpression[]
    parent?: JSONArrayExpression | JSONProperty | JSONExpressionStatement
}

export interface JSONObjectExpression extends BaseJSONNode {
    type: "JSONObjectExpression"
    properties: JSONProperty[]
    parent?: JSONArrayExpression | JSONProperty | JSONExpressionStatement
}

export interface JSONProperty extends BaseJSONNode {
    type: "JSONProperty"
    key: JSONIdentifier | JSONLiteral
    value: JSONExpression
    kind: "init"
    method: false
    shorthand: false
    computed: false
    parent?: JSONObjectExpression
}

export interface JSONIdentifier extends BaseJSONNode {
    type: "JSONIdentifier"
    name: string
    parent?:
        | JSONArrayExpression
        | JSONProperty
        | JSONExpressionStatement
        | JSONUnaryExpression
}

export interface JSONNumberIdentifier extends JSONIdentifier {
    name: "Infinity" | "NaN"
}

export interface JSONLiteral extends BaseJSONNode {
    type: "JSONLiteral"
    value: string | boolean | number | null
    raw: string
    parent?:
        | JSONArrayExpression
        | JSONProperty
        | JSONExpressionStatement
        | JSONUnaryExpression
}

export interface JSONNumberLiteral extends JSONLiteral {
    type: "JSONLiteral"
    value: number
    raw: string
}

export interface JSONUnaryExpression extends BaseJSONNode {
    type: "JSONUnaryExpression"
    operator: "-" | "+"
    prefix: true
    argument: JSONNumberLiteral | JSONNumberIdentifier
    parent?: JSONArrayExpression | JSONProperty | JSONExpressionStatement
}
