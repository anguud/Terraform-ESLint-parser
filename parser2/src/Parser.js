

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
      case 'resource':
        return this.ResourceBlockStatement();
      case 'STRING': 
        return this.StringLiteral();
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
   * ResourceBlockStatement
   *  : 'Resource StringLiteral StringLiteral{' optStatementList '}'
   *  ;
   */
   ResourceBlockStatement() {
    this._eat('resource');
    const blocklabel = this._lookahead.type == 'STRING' ? this.StringLiteral() : []; 
    //next
    const blocklabel2 = this._lookahead.type == 'STRING' ? this.StringLiteral() : [];

    const body = this._lookahead.type !== '}' ? this.StatementList('}') : [];


    return {
      type: 'ResourceBlockStatement',
      blocklabel,
      blocklabel2,
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

     return {
       type: 'AssignmentExpression',
       operator: this.AssignmentOperator().value,
       left: this._chekValidAssignmentTarget(left),
       right: this.AssignmentExpression(),
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
     const name = this._eat('IDENTIFIER').value;
     return {
       type: 'Identifier',
       name,
     };
   }

   /**
    * Extra check whether it's valid assignment target.
    */
   _chekValidAssignmentTarget(node) {
     if (node.type === 'Identifyer') {
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
    AssignmentExpression() {
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

    /**
   * Identifier
   * : Identifier
   * ;
  */
     Identifyer() {
      const token = this._eat('IDENTIFIER');
      return {
        type: 'Identifier',
        value: token.value.slice(1, -1)
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
