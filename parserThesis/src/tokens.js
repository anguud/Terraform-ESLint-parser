/**
-------------------------------------------------------------------
 * IMPORTS
-------------------------------------------------------------------
 */

// import { Spec } from "./Tokenizer";
// import { Spec } from "./NodeTypes";

const Spec = [
    // ----------------
    // Whitespace

    [/^\s/, null],
    
    
    // ----------------
    // Comments:

    // Single line: 
    [/^\/\/.*/, 'comment'],

    // multi-line comments:
    [/^\/\*[\s\S]*?\*\//, 'comment'],

    // ----------------
    // Symbol, delimiters:
    [/^:/, ':'],
    [/^;/, ';'],
    [/^\{/, '{'],
    [/^\}/, '}'],
    [/^\(/, '('],
    [/^\)/, ')'],
    [/^\,/, ','],

    // ----------------
    //Numbers: 
    // Numbers should be before identifiers 
    // since the w+ in identifiers also will match on numbers

    [/^\d+/, 'NUMBER'],

    // ----------------
    // Resource

    [/^resource/,'resource'],

    // ----------------
    // Identifiers:

    [/^\w+/, 'Identifier'],

    // ----------------
    // Assignment operators =, *=, /=, +=, -=,

    [/^=/, 'SIMPLE_ASSIGN'],
    [/^[\*\/\+\-]=/, 'COMPLESX_ASSIGN'],

    // ----------------
    // Math operators: +, -, * /
    [/^[+\-]/, 'ADDITIVE_OPERATOR'],
    // TODO: parser does not support multiplication over division. 
    [/^[*\/]/, 'MULTIPLICATIVE_OPERATOR'], 



    // ----------------
    // Strings

    [/^"[^"]*"/, 'STRING'],
    [/^'[^']*'/, 'STRING'],
];

/**
 * TODO: 
 * 
 * map token to type: token value, tokentype just as in tokenizer -- imported tokenizer Spec
 * 
 * 
 * tokenize method: 
 *  variables: 
 * 
 *  offset integer
 *  lineNumber integer
 *  columnNumber integer
 *  
 *  nextline bool
 *  
 *  tokens empty array
 * 
 *  helper methods: 
 *  
 *  makeToken()
 *      retunrns the node object as defined in definition of nodes above
 * 
 *  getNextToken()
 *      returns next token
 * 
 *  getLocation()
 *      returns the location (lineNumber, colNumber (offset))
 */


export function getTokens(code) {
    // starting point:
    var offset = 0; // starting point (we havent reached the fitst character)
    var line = 1;
    var column = 0;
    var newLine = false;
    

    // our list of tokens 
    const tokens = [];
    
    while (!isEOF()) {
        tokens.push(findTokens());
    }

   
    return tokens;

    function findTokens() {
        if(!hasMoreTokens()) {
            return null
        }
        var string = code.slice(offset);
        
        
        for(const [regexp, tokenType] of Spec) {
            const tokenValue = _match(regexp, string);
            
            // coun't match this rule, continue.
            if (tokenValue == null) {
                continue
            }
            
            // Should skip token, e.g. whitespace.
            if (tokenType == null){
                getNextToken(string)
                return findTokens();
            }
            const start = getLocation()
            // getNextToken(string)
            return makeToken(tokenType, tokenValue, start);
        }
        
        throw new SyntaxError(`Unexpected token: "${string[0]}"`)
    }

    function hasMoreTokens() {
        return (offset < code.length);
    }

    function isEOF() { 
        return offset === code.length;
    }

    /**
    * Matches a token for a regular expression,
    * 
    * @param {regex to be matched} regexp 
    * @param {string to be lookad at} string 
    * @returns 
    */
    function _match(regexp, string) {
      const matched = regexp.exec(string);
      if (matched == null) {
          return null;
      }
    
      return matched[0];
    }
    
    //get next token
    function getNextToken(tokenstring) {
        
        
        offset++;
    
        if (newLine) {
            line++;
            column = 1;
            newLine = false;
        } else {
            column++;
        }
    
        if (/^\r/.test(tokenstring)) {
            newLine = true;
    
            // if we already see a \r, just ignore upcoming \n
            if (/^\n/.test(tokenstring + 1)) {
                offset++;
            }
        } else if (/^\n/.test(tokenstring)) {
            newLine = true;
        }
    
    }
    
    // get position of token
    function getLocation() {
        return {
            line,
            column,
            offset
        };
    }
    
    
    
    
     
    //create token
    function makeToken(tokenType, value, startLoc, endLoc) {
        

        offset += value.length;
        column += value.length;

        const endOffset = startLoc.offset + value.length;
        var range = {
            range: [startLoc.offset, endOffset]
        }

        return {
            type: tokenType,
            value,
            loc: {
                start: startLoc,
                end: endLoc || {
                    line: startLoc.line,
                    column: startLoc.column + value.length,
                    offset: endOffset
                }
            },
            ...range
        };
    }
}


