"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseForESLint = void 0;
var Tokens_1 = require("./Tokens");
var eslint_visitor_keys_1 = require("eslint-visitor-keys");
function parseForESLint(code, options) {
    var visitorKeys = {
        Program: [],
        BlockStatement: ['body'],
        ResourceBlockStatement: ['body', 'blocklabel', 'blocklabel2'],
        ExpressionStatement: [],
        AssignmentExpression: ['operator', 'left', 'right'],
        Identifier: ['name'],
        BinaryExpression: ['operator', 'left', 'right'],
        StringLiteral: ['value'],
        NumericLiteral: ['value']
    };
    var pars = new Parser();
    return {
        ast: pars.parse(code),
        services: {},
        visitorKeys: (0, eslint_visitor_keys_1.unionWith)(visitorKeys)
    };
}
exports.parseForESLint = parseForESLint;
var Parser = /** @class */ (function () {
    function Parser() {
        // eslint-disable-next-line @typescript-eslint/ban-types
        this.exp = {
            MultiplicativeExpression: this.MultiplicativeExpression,
            PrimaryExpression: this.PrimaryExpression,
        };
    }
    Parser.prototype.init = function (string) {
        this._cursor = -1;
        this._string = "";
        this._tokens = (0, Tokens_1.getTokens)(string);
    };
    Parser.prototype.parse = function (string) {
        this.init(string);
        if (!this.hasMoreTokens()) {
            return null;
        }
        this._lookahead = this.getNextToken();
        return this.Program();
    };
    Parser.prototype.getNextToken = function () {
        return this._tokens[++this._cursor];
    };
    Parser.prototype.hasMoreTokens = function () {
        return this._cursor < this._tokens.length;
    };
    /**
     * Main entry point.
     *
     * Program
     *  : StatementList
     *  ;
     */
    Parser.prototype.Program = function () {
        var statementList = this.StatementList("initial");
        if (statementList !== null) {
            return {
                type: "Program",
                body: statementList,
                tokens: this._tokens,
                loc: {
                    start: __assign({}, statementList[0].loc.start),
                    end: __assign({}, statementList[statementList.length - 1].loc.end),
                },
                range: [
                    statementList[0].range[0],
                    statementList[statementList.length - 1].range[1],
                ],
                comments: [],
                parent: null,
            };
        }
        else {
            return {
                type: "Program",
                body: statementList,
                tokens: this._tokens,
                loc: {
                    start: {
                        line: 0,
                        column: 0,
                        offset: 0
                    },
                    end: {
                        line: 0,
                        column: 0,
                        offset: 0
                    },
                },
                range: [
                    0,
                    0,
                ],
                comments: [],
                parent: null,
            };
        }
    };
    /**
     * StatementList
     * : statement
     * | StatementList Statement -> Statement Statement Statement Statement
     * ;
     */
    Parser.prototype.StatementList = function (stopLookahead, config) {
        if (stopLookahead === void 0) { stopLookahead = null; }
        if (config === void 0) { config = null; }
        var statementList = [this.Statement(config)];
        while (typeof this._lookahead !== "undefined" && this._lookahead !== null && this._lookahead.type !== stopLookahead && config !== "block") {
            statementList.push(this.Statement(config));
        }
        return statementList;
    };
    /**
     * Statement
     *  : ExpressionStatement
     *  | BlockStatement
     *  | EmptyStatement
     *  ;F
     *
     */
    Parser.prototype.Statement = function (config) {
        if (config === void 0) { config = null; }
        if (this._lookahead != null) {
            switch (this._lookahead.type) {
                case ";":
                    return this.EmptyStatement();
                case "{":
                    return this.BlockStatement(config);
                case "[":
                    return this.listStatement();
                case "resource":
                    return this.ResourceBlockStatement();
                default:
                    return this.ExpressionStatement();
            }
        }
    };
    /**
     * EmptyStatement
     * : ';'
     * ;
     */
    Parser.prototype.EmptyStatement = function () {
        this._eat(";");
        return null;
    };
    /**
     * BlockStatement
     *  : '{' optStatementList '}'
     *  ;
     */
    Parser.prototype.BlockStatement = function (config) {
        if (config === void 0) { config = null; }
        var blockStart = this._eat("{");
        if (this._lookahead != null) {
            var body = this._lookahead.type !== "}" ? this.StatementList("}") : [];
            var blockEndToken = this._eat("}");
            return {
                type: "BlockStatement",
                body: body,
                loc: {
                    start: blockStart.loc.start,
                    end: blockEndToken.loc.end,
                },
                range: [blockStart.range[0], blockEndToken.range[1]],
                parent: null,
            };
        }
    };
    /**
     * List
     *  : '{' optStatementList '}'
     *  ;
     */
    Parser.prototype.listStatement = function (config) {
        if (config === void 0) { config = null; }
        var listStart = this._eat("[");
        if (this._lookahead != null) {
            var body = this._lookahead.type !== "]" ? this.StatementList("]") : [];
            var listEndToken = this._eat("]");
            return {
                type: "listStatement",
                body: body,
                loc: {
                    start: listStart.loc.start,
                    end: listEndToken.loc.end,
                },
                range: [listStart.range[0], listEndToken.range[1]],
                parent: null,
            };
        }
    };
    /**
     * ResourceBlockStatement
     *  : 'Resource StringLiteral StringLiteral{' optStatementList '}'
     *  ;
     */
    Parser.prototype.ResourceBlockStatement = function () {
        var resourceToken = this._eat("resource");
        // TODO: use return from _eat to parse to StringLiteral(_eat retrurn value ) in order to make a new node type for blocklables.
        if (this._lookahead != null) {
            var blocklabel = this._lookahead.type == "STRING" ? this.StringLiteral() : []; // if false: this is where we could handle "wrong"
            //next
            var blocklabel2 = this._lookahead.type == "STRING" ? this.StringLiteral() : [];
            var body = this._lookahead.type !== "}" ? this.StatementList("}", "block") : [];
            return {
                type: "ResourceBlockStatement",
                blocklabel: blocklabel,
                blocklabel2: blocklabel2,
                body: body[0].body,
                loc: {
                    start: resourceToken.loc.start,
                    end: body[0].loc.end,
                },
                range: [resourceToken.range[0], body[0].range[1]],
                parent: null,
            };
        }
    };
    /**
     * ExpressionStatement
     *  : Expression ';'
     *  ;
     *
     */
    Parser.prototype.ExpressionStatement = function () {
        var expression = this.Expression();
        // this._eat(';');
        return __assign({}, expression);
    };
    /**
     * Expression
     *  : Literal
     *  ;
     */
    Parser.prototype.Expression = function () {
        return this.AssignmentExpression();
    };
    /**
     * AssignmentExpression
     *  : AdditiveExpression
     *  | LeftHandSideExpression AssignmentOperator AssignmentExpression
     *  ;
     * @returns
     */
    Parser.prototype.AssignmentExpression = function () {
        var left = this.AdditiveExpression();
        if ((typeof this._lookahead === "undefined") || (!this._isAssignmentOperator(this._lookahead.type))) {
            return left;
        }
        var operator = this.AssignmentOperator();
        var right = this.AssignmentExpression();
        if (typeof right.loc === "undefined") {
            var endLoc = right[0].loc.end;
            var endRange = right[0].range[1];
            right = right[0];
        }
        else {
            var endLoc = right.loc.end;
            var endRange = right.range[1];
        }
        return {
            type: "AssignmentExpression",
            operator: operator.value,
            left: this._chekValidAssignmentTarget(left),
            right: right,
            loc: {
                start: left.loc.start,
                end: endLoc
            },
            range: [left.range[0], endRange],
            parent: null,
        };
    };
    /**
     * LeftHandSideExpression:
     *  : Identifies
     */
    Parser.prototype.LeftHandSideExpression = function () {
        return this.Identifier();
    };
    /**
     * Identifier
     *   : IDENTIFIER
     *   ;
     * @returns
     */
    Parser.prototype.Identifier = function () {
        var name = this._eat("Identifier");
        if (this._lookahead.type !== "{") {
            return {
                type: "Identifier",
                name: name.value,
                loc: name.loc,
                range: name.range,
                parent: null,
            };
        }
        if (this._lookahead !== null) {
            var body = this.StatementList("}", "block");
            return {
                type: "TFBlock",
                name: name.value,
                body: body[0].body,
                loc: {
                    start: name.loc.start,
                    end: body[0].loc.end,
                },
                range: [name.range[0], body[0].range[1]],
                parent: null,
            };
        }
    };
    /**
     * Extra check whether it's valid assignment target.
     */
    Parser.prototype._chekValidAssignmentTarget = function (node) {
        if (node.type === "Identifier") {
            return node;
        }
        throw new SyntaxError("Invalid left-hand side in assignment expression");
    };
    /**
     * Wheter the token is an assignment operator.
     * @returns
     */
    Parser.prototype._isAssignmentOperator = function (tokenType) {
        return tokenType === "SIMPLE_ASSIGN" || tokenType === "COMPLEX_ASSIGN";
    };
    /**
     * AssignmentOperator
     *   : SIMPLE_ASSIGN
     *   | COMPLEX_ASSIGN
     *   ;
     * @returns
     */
    Parser.prototype.AssignmentOperator = function () {
        if (this._lookahead.type === "SIMPLE_ASSIGN") {
            return this._eat("SIMPLE_ASSIGN");
        }
        return this._eat("COMPLEX_ASSIGN");
    };
    /**
     * Literal
     * : NumericLiteral
     * | StringLiteral
     * ;
     */
    Parser.prototype.Literal = function () {
        switch (this._lookahead.type) {
            case "NUMBER":
                return this.NumericLiteral();
            case "STRING":
                return this.StringLiteral();
            case "ExpressionStatement":
                return this.ExpressionStatement();
        }
        throw new SyntaxError("Literal: unexpected literal production");
    };
    /**
     * AdditiveExpression
     *   : MultiplicativeExpression
     *   | AdditiveEcpression ADDITIVE_OPERATOR MiltiplicativeExpression -> MultiplicativeExpression ADDITIVE_OPERATOR MultiplivativeExpression
     * @returns
     */
    Parser.prototype.AdditiveExpression = function () {
        return this._BinaryExpression("MultiplicativeExpression", "ADDITIVE_OPERATOR");
    };
    /**
     * MultiplicativeExpression
     *   : PrimaryExpression
     *   | MultiplicativeExpression MULTIPLICATIVE_OPERATOR PrimaryExpression -> PrimaryExpression MULTIPLICATIVE_OPERATOR MultiplivativeExpression
     * @returns
     */
    Parser.prototype.MultiplicativeExpression = function () {
        return this._BinaryExpression("PrimaryExpression", "MULTIPLICATIVE_OPERATOR");
    };
    /**
     * Generic binary expression.
     *
     * @returns
     */
    Parser.prototype._BinaryExpression = function (builderName, operatorToken) {
        var left;
        if (builderName === "MultiplicativeExpression") {
            left = this.MultiplicativeExpression();
        }
        else {
            left = this.PrimaryExpression();
        }
        if (typeof this._lookahead === "undefined") {
            return left;
        }
        while (this._lookahead.type === operatorToken) {
            // operator: *, /
            var operator = this._eat(operatorToken).value;
            var right = void 0;
            if (builderName === "MultiplicativeExpression") {
                right = this.MultiplicativeExpression();
            }
            else {
                right = this.PrimaryExpression();
            }
            left = {
                type: "BinaryExpression",
                operator: operator,
                left: left,
                right: right,
                loc: {
                    start: left.loc.start,
                    end: right.loc.start
                },
                parent: null,
            };
        }
        return left;
    };
    /**
     * PrimaryExpression
     *  : Literal
     *  | ParenthesizedExpression
     *  | LeftHandSideExpression
     *  ;
     * @returns
     */
    Parser.prototype.PrimaryExpression = function () {
        if (this._isLiteral(this._lookahead.type)) {
            return this.Literal();
        }
        switch (this._lookahead.type) {
            case "(":
                return this.ParentesizedExpression();
            case "{":
                return this.StatementList("}", "block");
            case "[":
                return this.StatementList("]", "block");
            default:
                return this.LeftHandSideExpression();
        }
    };
    /**
     * Whether the token is a literal.
     * @returns
     */
    Parser.prototype._isLiteral = function (tokenType) {
        return tokenType === "NUMBER" || tokenType === "STRING";
    };
    /**
     * ParentesizedExpression
     *    : '('  Expression ')'
     *    ;
     */
    Parser.prototype.ParentesizedExpression = function () {
        this._eat("(");
        var expression = this.Expression();
        this._eat(")");
        return expression;
    };
    /**
     * StringLiteral
     *  :STRING
     *  ;
     */
    Parser.prototype.StringLiteral = function () {
        var token = this._eat("STRING");
        return {
            type: "StringLiteral",
            value: token.value.slice(1, -1),
            loc: token.loc,
            range: token.range,
            parent: null,
        };
    };
    /**
     * NumericLiteral
     * : NUMBER
     * ;
     */
    Parser.prototype.NumericLiteral = function () {
        var token = this._eat("NUMBER");
        return {
            type: "NumericLiteral",
            value: Number(token.value),
            loc: token.loc,
            range: token.range,
            parent: null,
        };
    };
    //   /**
    //  * Identifier
    //  * : Identifier
    //  * ;
    // */
    //    Identifier() {
    //     const token = this._eat('IDENTIFIER');
    //     return {
    //       type: 'Identifier',
    //       value: token.value.slice(1, -1)
    //     };
    //   }
    Parser.prototype._eat = function (tokenType) {
        var token = this._lookahead;
        if (token == null) {
            throw new SyntaxError("Unexpected end of input, expected \"".concat(tokenType, "\""));
        }
        if (token.type !== tokenType) {
            throw new SyntaxError("Unexpected token: \"".concat(token.value, "\", expected: \"").concat(tokenType, "\n\n        in node: ").concat(token.range, "\""));
        }
        this._lookahead = this.getNextToken();
        return token;
    };
    return Parser;
}());
