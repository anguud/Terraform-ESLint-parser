import type { AST } from "eslint"
import type { Comment as ESTreeComment } from "estree"
export interface RuleListener {
    [key: string]: (node: never) => void
}

export type Token = AST.Token
export type Comment = ESTreeComment


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
    | TFProperty
    | TFIdentifier
    | TFTemplateLiteral
    | TFTemplateElement

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
    | TFArrayExpression
    | TFObjectExpression
    | TFLiteral
    | TFUnaryExpression
    | TFNumberIdentifier
    | TFUndefinedIdentifier
    | TFTemplateLiteral
    | TFBinaryExpression

export interface TFArrayExpression extends BasicNode {
    type: "TFArrayExpression"
    elements: (TFExpression | null)[]
    parent: TFArrayExpression | TFProperty | TFExpressionStatement
}

export interface TFObjectExpression extends BasicNode {
    type: "TFObjectExpression"
    properties: TFProperty[]
    parent: TFArrayExpression | TFProperty | TFExpressionStatement
}

export interface TFProperty extends BasicNode {
    type: "TFProperty"
    key: TFIdentifier | TFStringLiteral | TFNumberLiteral
    value: TFExpression
    kind: "init"
    method: false
    shorthand: false
    computed: false
    parent: TFObjectExpression
}

export interface TFIdentifier extends BasicNode {
    type: "TFIdentifier"
    name: string
    parent?:
    | TFArrayExpression
    | TFProperty
    | TFExpressionStatement
    | TFUnaryExpression
}

export interface TFNumberIdentifier extends TFIdentifier {
    name: "Infinity" | "NaN"
}

export interface TFUndefinedIdentifier extends TFIdentifier {
    name: "undefined"
}
interface TFLiteralBase extends BasicNode {
    type: "TFLiteral"
    raw: string
    parent?:
    | TFArrayExpression
    | TFProperty
    | TFExpressionStatement
    | TFUnaryExpression
    | TFBinaryExpression
}

export interface TFStringLiteral extends TFLiteralBase {
    value: string
    regex: null
    bigint: null
}
export interface TFNumberLiteral extends TFLiteralBase {
    value: number
    regex: null
    bigint: null
}
export interface TFKeywordLiteral extends TFLiteralBase {
    value: boolean | null
    regex: null
    bigint: null
}
export interface TFRegExpLiteral extends TFLiteralBase {
    value: null
    regex: {
        pattern: string
        flags: string
    }
    bigint: null
}
export interface TFBigIntLiteral extends TFLiteralBase {
    value: null
    regex: null
    bigint: string
}

export type TFLiteral =
    | TFStringLiteral
    | TFNumberLiteral
    | TFKeywordLiteral
    | TFRegExpLiteral
    | TFBigIntLiteral

export interface TFUnaryExpression extends BasicNode {
    type: "TFUnaryExpression"
    operator: "-" | "+"
    prefix: true
    argument: TFNumberLiteral | TFNumberIdentifier
    parent: TFArrayExpression | TFProperty | TFExpressionStatement
}

export interface TFTemplateLiteral extends BasicNode {
    type: "TFTemplateLiteral"
    quasis: [TFTemplateElement]
    expressions: []
    parent: TFArrayExpression | TFProperty | TFExpressionStatement
}

export interface TFTemplateElement extends BasicNode {
    type: "TFTemplateElement"
    tail: boolean
    value: {
        cooked: string
        raw: string
    }
    parent: TFTemplateLiteral
}

export interface TFBinaryExpression extends BasicNode {
    type: "TFBinaryExpression"
    operator: "-" | "+" | "*" | "/" | "%" | "**"
    left: TFNumberLiteral | TFUnaryExpression | TFBinaryExpression
    right: TFNumberLiteral | TFUnaryExpression | TFBinaryExpression
    parent:
    | TFArrayExpression
    | TFProperty
    | TFExpressionStatement
    | TFUnaryExpression
    | TFBinaryExpression
}