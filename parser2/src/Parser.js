
const {Tokenizer} = require('./Tokenizer')

class Parser {



  constructor() {
    this._string = '';
    this._tokenizer = new Tokenizer();
  }

  parse(string) {
    this._string = string;
    this._tokenizer.init(string);

    this._lookahead = this._tokenizer.getNextToken();

    return this.Program()
  }

  /**
   * Main entry point.
   * 
   * Program 
   *  : StatementList
   *  ;
   */
  Program() {
    return {
      type: 'Program',
      body: this.StatementList(),
    }
  }


  /**
   * StatementList
   * : statement
   * | StatementList Statement -> Statement Statement Statement Statement
   * ;
   */
   StatementList(stopLookahead = null) {
     const statementList = [this.Statement()];
     
     while(this._lookahead != null && this._lookahead.type !== stopLookahead) {
        statementList.push(this.Statement());
     }

     return statementList;
   }



  /**
   * Statement
   *  : ExpressionStatement
   *  | BlockStatement
   *  | EmptyStatement
   *  ;
   * 
   */
  Statement() {
    switch (this._lookahead.type) {
      case ';':
        return this.EmptyStatement()
      case '{':
        return this.BlockStatement();
      default:
        return this.ExpressionStatement();
    }
  } 

  /**
   * EmptyStatement
   * : ';'
   * ;
   */
  EmptyStatement() {
    this._eat(';');
    return {
      type: 'EmptyStatement'
    }
  }

  /**
   * BlockStatement
   *  : '{' optStatementList '}'
   *  ;
   */
   BlockStatement() {
     this._eat('{');

     const body = this._lookahead.type !== '}' ? this.StatementList('}') : [];

     this._eat('}');

     return {
       type: 'BlockStatement',
       body,
     };
   }

  /**
   * ExpressionStatement
   *  : Expression ';'
   *  ;
   * 
   */
  ExpressionStatement() {
    const expression = this.Expression();
    this._eat(';');
    return {
      type: 'ExpressionStatement',
      expression,
    };
  }

  /**
   * Expression 
   *  : Literal
   *  ;
   */

  Expression() {
    return this.AdditiveExpression(); 
  }


  /**
   * Literal
   * : NumericLiteral
   * | StringLiteral
   * ; 
  */
 Literal() {
   switch (this._lookahead.type) {
    case 'NUMBER': 
      return this.NumericLiteral();
    case 'STRING':
      return this.StringLiteral();
    case 'ExpressionStatement':
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
     'MultiplicativeExpression',
     'ADDITIVE_OPERATOR'
  );
 }


 /**
  * Generic  binary expression.
  * 
  * @returns 
  */
 _BinaryExpression(builderName, operatorToken) {
    let left = this[builderName]();

    while (this._lookahead.type === operatorToken) {
      // operator: *, /
      const operator = this._eat('operatorToken').value;

      const right = this[builderName]();

      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      };
    }

      return left;
 }
/**
  * MultiplicativeExpression 
  *   : PrimaryExpression
  *   | MultiplicativeExpression MULTIPLICATIVE_OPERATOR PrimaryExpression -> PrimaryExpression MULTIPLICATIVE_OPERATOR MultiplivativeExpression
  * @returns 
  */
  MultiplicativeExpression() {
    return this._BinaryExpression(
      'PrimaryExpression',
      'MULTIPLICATIVE_OPERATOR'
    );
  }
  /**
   * PrimaryExpression 
   *  : Literal 
   *  | ParenthesizedExpression
   *  ;
   * @returns 
   */
  PrimaryExpression() {
    switch (this._lookahead.type) {
      case '(': 
        return this.ParentesizedExpression();
      default:    
      return this.Literal();
    }
  }

  /**
   * ParentesizedExpression
   *    : '('  Expression ')'
   *    ;
   */
  ParentesizedExpression() {
    this._eat('(');
    const expression = this.Expression();
    this._eat(')');
    return expression;
  }

  /** 
   * StringLiteral 
   *  :STRING
   *  ;
  */
  StringLiteral() {
    const token = this._eat('STRING');
    return {
      type: 'StringLiteral',
      value: token.value.slice(1, -1),
    };
  }


  /**
   * NumericLiteral
   * : NUMBER
   * ;
  */
  NumericLiteral() {
    const token = this._eat('NUMBER');
    return {
      type: 'NumericLiteral',
      value: Number(token.value)
    };
  }


  _eat(tokenType) {
    const token = this._lookahead;

    if (token == null) {
      throw new SyntaxError(
        `Unexpected end of input, expected "${tokenType}"`
      );
    }

    if (token.type !== tokenType) {
      throw new SyntaxError(
        `Unexpected token: "${token.value}", expected: "${tokenType}"`
      );
    }

    this._lookahead = this._tokenizer.getNextToken();

    return token;
  }


}

module.exports = {
  Parser
};
