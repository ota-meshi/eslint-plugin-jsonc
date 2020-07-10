import type { SourceCode } from "eslint"
import Evk from "eslint-visitor-keys"
export const KEYS: SourceCode.VisitorKeys = Evk.unionWith({
    JSONExpressionStatement: ["expression"],
    JSONArrayExpression: ["elements"],
    JSONObjectExpression: ["properties"],
    JSONProperty: ["key", "value"],
    JSONIdentifier: [],
    JSONLiteral: [],
}) as SourceCode.VisitorKeys
