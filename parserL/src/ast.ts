import type { Token, Comment } from "../types"
import type { AST } from "eslint"

export interface Locations {
    loc: SourceLocation
    range: [number, number]
}

//All nodes have type, range, loc and parent properties according to ESLint 
interface BasicNode extends Locations {
    type: string
}

export interface SourceLocation {
    start: Position
    end: Position
}

export interface Position {
    /** >= 1 */
    line: number
    /** >= 0 */
    column: number
}

export type TFNode =
    | TFProgram
    | TFExpressionStatement
    | TFExpression
    | TFIdentifier

export interface TFProgram extends BasicNode {
    type: "Program"
    body: [TFExpressionStatement]
    comments: Comment[]
    tokens: Token[]
    parent: null
}

export interface TFExpressionStatement extends BasicNode {
    type: "TFExpressionStatement"
    expression: TFExpression
    parent: TFProgram
}

export type TFExpression =
    | TFLiteral
    | TFUndefinedIdentifier


export interface TFIdentifier extends BasicNode {
    type: "TFIdentifier"
    name: string
    parent?:
    | TFExpressionStatement
}

export interface TFUndefinedIdentifier extends TFIdentifier {
    name: "undefined"
}
interface TFLiteralBase extends BasicNode {
    type: "TFLiteral"
    raw: string
    parent?:
    TFExpressionStatement
}

export interface TFStringLiteral extends TFLiteralBase {
    value: string

}
export interface TFNumberLiteral extends TFLiteralBase {
    value: number
    regex: null
    bigint: null
}

export type TFLiteral =
    | TFStringLiteral
    | TFNumberLiteral
