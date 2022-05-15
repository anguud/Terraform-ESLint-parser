import { getTokens } from "./Tokens";
import *  as types from "./types";
import { SourceCode } from 'eslint';
import { unionWith } from "eslint-visitor-keys"
import { endianness } from "os";

export function parseForESLint(code: string, options: any,) {


  const visitorKeys: SourceCode.VisitorKeys = {
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

  const pars = new Parser()


  return {
    ast: pars.parse(code),
    services: {},
    visitorKeys: unionWith(visitorKeys)
  }
}

class Parser {
  _cursor: number;
  _string: string;
  _tokens: types.Token[];
  _lookahead: types.Token; //
  _insideBlock: boolean;

  init(string: string) {
    this._cursor = -1;
    this._string = "";
    this._tokens = getTokens(string);
  }

  parse(string: string) {
    this.init(string);
    if (!this.hasMoreTokens()) {
      return null;
    }
    this._lookahead = this.getNextToken();

    return this.Program();
  }

  getNextToken(): types.Token {
    return this._tokens[++this._cursor];
  }

  hasMoreTokens(): boolean {
    return this._cursor < this._tokens.length;
  }

  /**
   * Main entry point.
   *
   * Program
   *  : StatementList
   *  ;
   */
  Program(): types.Program {
    const statementList = this.StatementList("initial");
    if (statementList !== null) {
      return {
        type: "Program",
        body: statementList,
        tokens: this._tokens,
        loc: {
          start: { ...statementList[0].loc.start },
          end: { ...statementList[statementList.length - 1].loc.end },
        },
        range: [
          statementList[0].range[0],
          statementList[statementList.length - 1].range[1],
        ],
        comments: [],
        parent: null,
      };
    } else {
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
  }

  /**
   * StatementList
   * : statement
   * | StatementList Statement -> Statement Statement Statement Statement
   * ;
   */
  StatementList(stopLookahead: null | string = null, config: string | null = null): any {

    const statementList = [this.Statement(config)];

    while (typeof this._lookahead !== "undefined" && this._lookahead !== null && this._lookahead.type !== stopLookahead && config !== "block") {
      statementList.push(this.Statement(config));
    }

    return statementList;
  }

  /**
   * Statement
   *  : ExpressionStatement
   *  | BlockStatement
   *  | EmptyStatement
   *  ;F
   *
   */
  Statement(config: string | null = null) {
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
        case "provider":
          if(this._tokens[this._cursor+1].type === "STRING"){
          return this.ProviderBlock();
          } else {
            return this.ExpressionStatement();
          }
        case "variable":
          return this.variableBlock();
        default:
          return this.ExpressionStatement();
      }
    }
  }

  /**
   * EmptyStatement
   * : ';'
   * ;
   */
  EmptyStatement() {
    this._eat(";");
    return null;
  }

  /**
   * BlockStatement
   *  : '{' optStatementList '}'
   *  ;
   */
  BlockStatement(config: string | null = null) {
    const blockStart = this._eat("{");

    if (this._lookahead != null) {
      const body = this._lookahead.type !== "}" ? this.StatementList("}") : [];

      const blockEndToken = this._eat("}");

      return {
        type: "BlockStatement",
        body,
        loc: {
          start: blockStart.loc.start,
          end: blockEndToken.loc.end,
        },
        range: [blockStart.range[0], blockEndToken.range[1]],
        parent: null,
      };

    }
  }

  /**
   * List
   *  : '{' optStatementList '}'
   *  ;
   */
  listStatement(config: string | null = null) {
    const listStart = this._eat("[");

    if (this._lookahead != null) {
      const body = this._lookahead.type !== "]" ? this.StatementList("]") : [];

      const listEndToken = this._eat("]");

      return {
        type: "listStatement",
        body,
        loc: {
          start: listStart.loc.start,
          end: listEndToken.loc.end,
        },
        range: [listStart.range[0], listEndToken.range[1]],
        parent: null,
      };

    }
  }


  /**
   * ResourceBlockStatement
   *  : 'Resource StringLiteral StringLiteral{' optStatementList '}'
   *  ;
   */
  ResourceBlockStatement() {
    const resourceToken = this._eat("resource");
    // TODO: use return from _eat to parse to StringLiteral(_eat retrurn value ) in order to make a new node type for blocklables.
    if (this._lookahead != null) {
      const blocklabel =
        this._lookahead.type == "STRING" ? this.StringLiteral() : []; // if false: this is where we could handle "wrong"
      //next
      const blocklabel2 =
        this._lookahead.type == "STRING" ? this.StringLiteral() : [];

      const body = this._lookahead.type !== "}" ? this.StatementList("}", "block") : [];

      return {
        type: "ResourceBlockStatement",
        blocklabel,
        blocklabel2,
        body: body[0].body,
        loc: {
          start: resourceToken.loc.start,
          end: body[0].loc.end,
        },
        range: [resourceToken.range[0], body[0].range[1]],
        parent: null,
      };
    }
  }


  /**
   * ResourceBlockStatement
   *  : 'Resource StringLiteral StringLiteral{' optStatementList '}'
   *  ;
   */
   variableBlock() {
    const variableToken = this._eat("variable");
    // TODO: use return from _eat to parse to StringLiteral(_eat retrurn value ) in order to make a new node type for blocklables.
    if (this._lookahead != null) {
      const variableName =
        this._lookahead.type == "STRING" ? this.StringLiteral() : []; // if false: this is where we could handle "wrong"

      const body = this._lookahead.type !== "}" ? this.StatementList("}", "block") : [];

      return {
        type: "VariableBlock",
        variableName,
        body: body[0].body,
        loc: {
          start: variableToken.loc.start,
          end: body[0].loc.end,
        },
        range: [variableToken.range[0], body[0].range[1]],
        parent: null,
      };
    }
  }



  /**
   * ResourceBlockStatement
   *  : 'Resource StringLiteral StringLiteral{' optStatementList '}'
   *  ;
   */
   ProviderBlock() {
    const providerToken = this._eat("provider");
    // TODO: use return from _eat to parse to StringLiteral(_eat retrurn value ) in order to make a new node type for blocklables.
    if (this._lookahead != null) {
      const providerName =
        this._lookahead.type == "STRING" ? this.StringLiteral() : []; // if false: this is where we could handle "wrong"

      const body = this._lookahead.type !== "}" ? this.StatementList("}", "block") : [];

      return {
        type: "ProviderBlock",
        providerName,
        body: body[0].body,
        loc: {
          start: providerToken.loc.start,
          end: body[0].loc.end,
        },
        range: [providerToken.range[0], body[0].range[1]],
        parent: null,
      };
    }
  }



  /**
   * ExpressionStatement
   *  : Expression ';'
   *  ;
   *
   */
  ExpressionStatement() {
    const expression = this.Expression();
    // this._eat(';');
    return {
      //type: "ExpressionStatement",
      ...expression,
    };
  }


  /**
   * Expression
   *  : Literal
   *  ;
   */

  Expression() {
    return this.AssignmentExpression();
  }

  /**
   * AssignmentExpression
   *  : AdditiveExpression
   *  | LeftHandSideExpression AssignmentOperator AssignmentExpression
   *  ;
   * @returns
   */
  AssignmentExpression(): types.Assignment | types.Statement {
    const left = this.AdditiveExpression();
    if ((typeof this._lookahead === "undefined") || (!this._isAssignmentOperator(this._lookahead.type))) {
      return left;
    }

    const operator = this.AssignmentOperator();
    var right = this.AssignmentExpression()

    if (typeof right.loc === "undefined") {
      var endLoc = right[0].loc.end
      var endRange = right[0].range[1]
      right = right[0]
    } else {
      var endLoc = right.loc.end
      var endRange = right.range[1]
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
  }

  /**
   * LeftHandSideExpression:
   *  : Identifies
   */
  LeftHandSideExpression() {
    return this.Identifier();
  }

  /**
   * Identifier
   *   : IDENTIFIER
   *   ;
   * @returns
   */
  Identifier() {
    if (this._tokens[this._cursor].type === "var" && this._tokens[this._cursor+1].type === "."){
      return this.VariableReference();
    } 
    if (this._tokens[this._cursor+1].type === ".") {
      return this.Reference()
    }
    if (this._tokens[this._cursor].type === "provider"){
      var name = this._eat("provider");
    } else {
      var name = this._eat("Identifier");
    }
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
      const body = this.StatementList("}", "block");

      return {
        type: "TFBlock",
        name: name,
        body: body[0].body,
        loc: {
          start: name.loc.start,
          end: body[0].loc.end,
        },
        range: [name.range[0], body[0].range[1]],
        parent: null,
      }

    }
  }

  /**
   * Extra check whether it's valid assignment target.
   */
  _chekValidAssignmentTarget(node: types.Statement) {
    if (node.type === "Identifier") {
      return node;
    }
    throw new SyntaxError("Invalid left-hand side in assignment expression");
  }

  /**
   * Wheter the token is an assignment operator.
   * @returns
   */
  _isAssignmentOperator(tokenType: string) {
    return tokenType === "SIMPLE_ASSIGN" || tokenType === "COMPLEX_ASSIGN";
  }

  /** 
   * AssignmentOperator
   *   : SIMPLE_ASSIGN
   *   | COMPLEX_ASSIGN
   *   ;
   * @returns
   */
  AssignmentOperator() {
    if (this._lookahead.type === "SIMPLE_ASSIGN") {
      return this._eat("SIMPLE_ASSIGN");
    }
    return this._eat("COMPLEX_ASSIGN");
  }

  /**
   * Literal
   * : NumericLiteral
   * | StringLiteral
   * ;
   */
  Literal() {
    switch (this._lookahead.type) {
      case "NUMBER":
        return this.NumericLiteral();
      case "STRING":
        return this.StringLiteral();
      case "ExpressionStatement":
        return this.ExpressionStatement();
    }
    throw new SyntaxError(`Literal: unexpected literal production`);
  }

  /**
   * AdditiveExpression
   *   : MultiplicativeExpression
   *   | AdditiveEcpression ADDITIVE_OPERATOR MiltiplicativeExpression -> MultiplicativeExpression ADDITIVE_OPERATOR MultiplivativeExpression
   * @returns
   */
  AdditiveExpression() {
    return this._BinaryExpression(
      "MultiplicativeExpression",
      "ADDITIVE_OPERATOR"
    );
  }

  /**
   * MultiplicativeExpression
   *   : PrimaryExpression
   *   | MultiplicativeExpression MULTIPLICATIVE_OPERATOR PrimaryExpression -> PrimaryExpression MULTIPLICATIVE_OPERATOR MultiplivativeExpression
   * @returns
   */
  MultiplicativeExpression() {
    return this._BinaryExpression(
      "PrimaryExpression",
      "MULTIPLICATIVE_OPERATOR"
    );
  }


  // eslint-disable-next-line @typescript-eslint/ban-types
  exp: { [K: string]: Function } = {
    MultiplicativeExpression: this.MultiplicativeExpression,
    PrimaryExpression: this.PrimaryExpression,
  };

  /**
   * Generic binary expression.
   *
   * @returns
   */
  _BinaryExpression(builderName: string, operatorToken: string) {
    let left: any;
    if (builderName === "MultiplicativeExpression") {
      left = this.MultiplicativeExpression()
    } else {
      left = this.PrimaryExpression();
    }

    if (typeof this._lookahead === "undefined") {
      return left
    }
    while (this._lookahead.type === operatorToken) {
      // operator: *, /
      const operator = this._eat(operatorToken).value;
      let right: any;
      if (builderName === "MultiplicativeExpression") {
        right = this.MultiplicativeExpression()
      } else {
        right = this.PrimaryExpression();
      }

      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
        loc: {
          start: left.loc.start, 
          end: right.loc.start
        },
        range: [left.range[0], right.range[1]],
        parent: null,
      };
    }


    return left;
  }


  /**
   * PrimaryExpression
   *  : Literal
   *  | ParenthesizedExpression
   *  | LeftHandSideExpression
   *  ;
   * @returns
   */
  PrimaryExpression() {
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
  }

  /**
   * Whether the token is a literal.
   * @returns
   */
  _isLiteral(tokenType: string) {
    return tokenType === "NUMBER" || tokenType === "STRING";
  }

  /**
   * ParentesizedExpression
   *    : '('  Expression ')'
   *    ;
   */
  ParentesizedExpression() {
    this._eat("(");
    const expression = this.Expression();
    this._eat(")");
    return expression;
  }

  /**
   * StringLiteral
   *  :STRING
   *  ;
   */
  StringLiteral(): types.Token {
    const token = this._eat("STRING");
    return {
      type: "StringLiteral",
      value: token.value.slice(1, -1),
      loc: token.loc,
      range: token.range,
      parent: null,
    };
  }

  /**
   * NumericLiteral
   * : NUMBER
   * ;
   */
  NumericLiteral() {
    const token = this._eat("NUMBER");
    return {
      type: "NumericLiteral",
      value: Number(token.value),
      loc: token.loc,
      range: token.range,
      parent: null,
    };
  }

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

  _eat(tokenType: string) {
    const token = this._lookahead;

    if (token == null) {
      throw new SyntaxError(`Unexpected end of input, expected "${tokenType}"`);
    }

    if (token.type !== tokenType) {
      throw new SyntaxError(
        `Unexpected token: "${token.value}", expected: "${tokenType}"\n
        in range: ${token.range}`
      );
    }

    this._lookahead = this.getNextToken();

    return token;
  }

  VariableReference() {
    const startRef = this._eat("var");
    this._eat(".");
    const varName = this._eat("Identifier")

      return {
        type: "variable",
        varName: varName,
        loc: {
          start: startRef.loc.start,
          end: varName.loc.end,
        },
        range: [startRef.range[0], varName.range[1]],
        parent: null,
      };
  }
  
  Reference() {
    const resouceName = this._eat("Identifier");
    this._eat(".")
    const terraformName = this._eat("Identifier");
    this._eat(".")
    const blockIdentifier = this._eat("Identifier")
      return {
        type: "reference",
        ressouceName: resouceName,
        terraformName: terraformName,
        blockIdentifier: blockIdentifier,
        loc: {
          start: resouceName.loc.start,
          end: blockIdentifier.loc.end,
        },
        range: [resouceName.range[0], blockIdentifier.range[1]],
        parent: null,
      };
  }
  //google_compute_network.vpc.id

}