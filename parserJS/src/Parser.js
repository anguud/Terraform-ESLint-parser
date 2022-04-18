

import { getTokens } from './tokens.js';
import { ScopeManager } from 'eslint-scope';

// const getTokens = require('./tokens');
// const ScopeManager = require('eslint-scope');

export function parse(code, options) {
  let pars = new Parser()


  let scopeManager = new ScopeManager({});

  let visitorKeys = {
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

  return {
    ast: pars.parse(code),
    services: {},
    scopeManager: scopeManager,
    visitorKeys: visitorKeys
  }
}

class Parser {



  init(string) {
    this._cursor = -1;
    this._string = '';
    this._tokens = getTokens(string);
  }
  
  parse(code,
    options) {
    this.init(code)
    this._lookahead = this.getNextToken();

    return this.Program()
  }

  getNextToken() {

    if(!this.hasMoreTokens()){
      return null
    }

    return this._tokens[++this._cursor]
  }

  hasMoreTokens() {
    return (this._cursor < this._tokens.length);
  }

  /**
   * Main entry point.
   * 
   * Program 
   *  : StatementList
   *  ;
   */
  Program() {
    const statementList = this.StatementList()
    return {
      type: 'Program',
      tokens: statementList,
      loc: {start: {...statementList[0].loc.start}, end: {...statementList[statementList.length-1].loc.end}},
      range: [statementList[0].range[0], statementList[statementList.length-1].range[1]],
      comments: [], 
      // value: code.substr(statementList.range[0], statementList.range[1] - statementList.range[0])
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
      case 'resource':
        return this.ResourceBlockStatement();
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
    return
  }

  /**
   * BlockStatement
   *  : '{' optStatementList '}'
   *  ;
   */
   BlockStatement() {
     const blockStart = this._eat('{');

     const body = this._lookahead.type !== '}' ? this.StatementList('}') : [];

     const blockEnd = this._eat('}');

     return {
       type: 'BlockStatement',
       body,
       loc: {start: {...body[0].loc.start}, end: {...body[body.length-1].loc.end}},
       range: [body[0].range[0], body[body.length-1].range[1]], 
     };
   }

  /**
   * ResourceBlockStatement
   *  : 'Resource StringLiteral StringLiteral{' optStatementList '}'
   *  ;
   */
   ResourceBlockStatement() {
    this._eat('resource');
    // TODO: use return from _eat to parse to StringLiteral(_eat retrurn value ) in order to make a new node type for blocklables.  
    const blocklabel = this._lookahead.type == 'STRING' ? this.StringLiteral() : []; // if false: this is where we could handle "wrong" 
    //next
    const blocklabel2 = this._lookahead.type == 'STRING' ? this.StringLiteral() : [];

    const body = this._lookahead.type !== '}' ? this.StatementList('}') : [];


    return {
      type: 'ResourceBlockStatement',
      blocklabel,
      blocklabel2,
      body,
      loc: {start: {...body[0].loc.start}, end: {...body[body.length-1].loc.end}},
      range: [body[0].range[0], body[body.length-1].range[1]],
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
    // this._eat(';');
    return {
      type: 'ExpressionStatement',
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
   AssignmentExpression() {
     const left = this.AdditiveExpression();

     if (!this._isAssignmentOperator(this._lookahead.type)) {
       return left;
     }
     let operator = this.AssignmentOperator()
     // TODO: maybe we should handle edgecases such as: 'this = that = not_Handled' where parser would probalby crash if this happens.
     return {
       type: 'AssignmentExpression',
       operator: operator.value,
       left: this._chekValidAssignmentTarget(left),
       right: this.AssignmentExpression(),
       loc: operator.loc,
       range: operator.range,
     };
   }
   
   /**
    * LeftHandSideExpression: 
    *  : Identifies
    */
    LeftHandSideExpression() {
      return this.Identifier()
    }

   /**
    * Identifier 
    *   : IDENTIFIER
    *   ;
    * @returns 
    */
   Identifier() {
     const name = this._eat('Identifier');
     return {
       type: 'Identifier',
       name: name.value,
       loc: name.loc,
       range: name.range 
     };
   }

   /**
    * Extra check whether it's valid assignment target.
    */
   _chekValidAssignmentTarget(node) {
     if (node.type === 'Identifier') {
       return node;
     }
     throw new SyntaxError('Invalid left-hand side in assignment expression');
   }


   /**
    * Wheter the token is an assignment operator. 
    * @returns 
    */
   _isAssignmentOperator(tokenType) {
     return tokenType === 'SIMPLE_ASSIGN' || tokenType === 'COMPLEX_ASSIGN';
   }

   /**
    * AssignmentOperator
    *   : SIMPLE_ASSIGN
    *   | COMPLEX_ASSIGN
    *   ;
    * @returns 
    */
   AssignmentOperator() {
     if (this._lookahead.type === 'SIMPLE_ASSIGN') {
       return this._eat('SIMPLE_ASSIGN');
     }
     return this._eat('COMPLEX_ASSIGN');
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
      const operator = this._eat(operatorToken).value;

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
   *  | LeftHandSideExpression
   *  ;
   * @returns 
   */
  PrimaryExpression() {
    if (this._isLiteral(this._lookahead.type)) {
      return this.Literal();
    }
    switch (this._lookahead.type) {
      case '(': 
        return this.ParentesizedExpression();
      default:    
        return this.LeftHandSideExpression();
    }
  }

  /**
   * Whether the token is a literal.
   * @returns 
   */
  _isLiteral(tokenType) {
    return tokenType === 'NUMBER' || tokenType === 'STRING';
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
   * AssignmentExpression
   *  : Expression '='
   *  ;
   * 
   */
    AssignmentExpressionx() {
      const expression = this.Expression();
      this._eat('=');
      return {
        type: 'AssignmentExpression',
        expression,
      };
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
      loc: token.loc,
      range: token.range,
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

    this._lookahead = this.getNextToken();

    return token;
  }


}
