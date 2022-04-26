import { getTokens } from "./Tokens";
import  *  as types from "./types";
import { SourceCode } from 'eslint';

export function parseForESLint(code: string, options: any,) {


  let visitorKeys: SourceCode.VisitorKeys = {
      'Program': [],
      'BlockStatement': ['body'],
      'ResourceBlockStatement': ['body', 'blocklabel', 'blocklabel2'],
      'ExpressionStatement': [],
      'AssignmentExpression': ['operator', 'left', 'right'],
      'Identifier': ['name'],
      'BinaryExpression': ['operator', 'left', 'right' ],
      'StringLiteral': ['value'],
      'NumericLiteral': ['value']
  };

  let pars = new Parser()


  return {
    ast: pars.parse(code),
    services: {},
    visitorKeys: visitorKeys
  }
}

class Parser {
  _cursor: number;
  _string: string;
  _tokens: types.Token[];
  _lookahead: types.Token; //

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
      return  {
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
        comments: this._tokens,
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
          end: { line: 0,
            column: 0,
            offset: 0
          },
        },
        range: [
          0,
          0,
        ],
        comments: this._tokens,
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

    while (this._lookahead != null && this._lookahead.type !== stopLookahead && config !== "block") {
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
  Statement(config: string | null= null) {
    if (this._lookahead != null) {
      switch (this._lookahead.type) {
        case ";":
          return this.EmptyStatement();
        case "{":
          return this.BlockStatement(config);
        case "resource":
          return this.ResourceBlockStatement();
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
  AssignmentExpression(): types.Assignment {
    const left = this.AdditiveExpression();
    if (!this._isAssignmentOperator(this._lookahead.type)) {
      return left;
    }

    const operator = this.AssignmentOperator();
    // TODO: maybe we should handle edgecases such as: 'this = that = not_Handled' where parser would probalby crash if this happens.
    return {
      type: "AssignmentExpression",
      operator: operator.value,
      left: this._chekValidAssignmentTarget(left),
      right: this.AssignmentExpression(),
      loc: operator.loc,
      range: operator.range,
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
    const name = this._eat("Identifier");
    return {
      type: "Identifier",
      name: name.value,
      loc: name.loc,
      range: name.range,
    };
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
   exp: {[K: string] : Function } = {
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
    if (builderName === "MultiplicativeExpression" ) { 
      left = this.MultiplicativeExpression()
    } else {
      left = this.PrimaryExpression();
    }

    while (this._lookahead.type === operatorToken) {
      // operator: *, /
      const operator = this._eat(operatorToken).value;
      let right: any;
      if (builderName === "MultiplicativeExpression" ) { 
        right = this.MultiplicativeExpression()
      } else {
        right = this.PrimaryExpression();
      }

      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
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
        `Unexpected token: "${token.value}", expected: "${tokenType}"`
      );
    }

    this._lookahead = this.getNextToken();

    return token;
  }
}
