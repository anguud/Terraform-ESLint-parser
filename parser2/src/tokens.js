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
    [/^\/\/.*/, null],

    // multi-line comments:
    [/^\/\*[\s\S]*?\*\//, null],

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

    [/^\w+/, 'IDENTIFIER'],

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
    var lineNumber = 1;
    var columnNumber = 0;
    var newLine = false;
    

    // our list of tokens 
    const tokens = []; 
    var index = 0;
    while (!isEOF()) {
        tokens.push(findTokens());
    }

   
    return tokens;

    function findTokens() {
        if(!hasMoreTokens()) {
            return null
        }

        var string = code.slice(offset);
        getNextToken(string)
        const start = getLocation()
        
        
        for(const [regexp, tokenType] of Spec) {
            const tokenValue = _match(regexp, string);

            // coun't match this rule, continue.
            if (tokenValue == null) {
                continue
            }

            // Should skip token, e.g. whitespace.
            if (tokenType == null){
                return findTokens();
            }

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
      offset += matched[0].length;
      return matched[0];
    }
    
    //get next token
    function getNextToken(tokenstring) {
        // offset++;
    
        if (newLine) {
            lineNumber++;
            columnNumber = 1;
            newLine = false;
        } else {
            columnNumber++;
        }
    
        if (tokenstring === "^\r") {
            newLine = true;
    
            // if we already see a \r, just ignore upcoming \n
            if (code.charAt(offset + 1) === "\n") {
                offset++;
            }
        } else if (tokenstring === "^\n") {
            newLine = true;
        }
    
    }
    
    // get position of token
    function getLocation() {
        return {
            lineNumber,
            columnNumber,
            offset
        };
    }
    
    
    
    
     
    //create token
    function makeToken(tokenType, value, startLoc, endLoc) {
        
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
                    line: startLoc.lineNumber,
                    column: startLoc.columnNumber + value.length,
                    offset: endOffset
                }
            },
            ...range
        };
    }
}





function readKeyword(character) {

    // get the expected keyword
    var value = expectedKeywords.get(c);

    // check to see if it actually exists
    if (text.slice(offset, offset + value.length) === value) {
        offset += value.length - 1;
        columnNumber += value.length - 1;
        return { value, character: next() };
    }

    // find the first unexpected character
    for (var j = 1; j < value.length; j++) {
        if (value[j] !== text.charAt(offset + j)) {
            unexpected(next());
        }
    }

}

function readString(character) {
    var value = character;
    c = next();

    while (character && character !== QUOTE) {

        // escapes
        if (c === "\\") {
            value += character;
            c = next();

            if (escapeToChar.has(c)) {
                value += character;
            } else if (character === "u") {
                value += character;
                for (var i = 0; i < 4; i++) {
                    character = next();
                    if (isHexDigit(character)) {
                        value += character;
                    } else {
                        unexpected(character);
                    }
                }
            } else {
                unexpected(character);
            }
        } else {
            value += character;
        }

        character = next();
    }

    if (!character) {
        unexpectedEOF();
    }
    
    value += character;

    return { value, character: next() };
}


function readNumber(character) {

    var value = "";

    // Number may start with a minus but not a plus
    if (character === "-") {

        value += character;

        character = next();

        // Next digit cannot be zero
        if (!isDigit(character)) {
            unexpected(character);
        }

    }

    // Zero must be followed by a decimal point or nothing
    if (character === "0") {

        value += character;

        c = next();
        if (isDigit(character)) {
            unexpected(character);
        }

    } else {
        if (!isPositiveDigit(character)) {
            unexpected(character);
        }

        do {
            value += character;
            c = next();
        } while (isDigit(character));
    }

    // Decimal point may be followed by any number of digits
    if (character === ".") {

        do {
            value += character;
            c = next();
        } while (isDigit(character));
    }

    // Exponent is always last
    if (character === "e" || c === "E") {

        value += character;
        character = next();

        if (character === "+" || character === "-") {
            value += ccharacter;
            character = next();
        }

        while (isDigit(character)) {
            value += character;
            character = next();
        }
    }


    return { value, character };
}

/**
 * Reads in either a single-line or multi-line comment.
 * @param {string} character The first character of the comment.
 * @returns {string} The comment string.
 * @throws {UnexpectedChar} when the comment cannot be read.
 * @throws {UnexpectedEOF} when EOF is reached before the comment is
 *      finalized.
 */
function readComment(character) {

    var value = character;

    // next character determines single- or multi-line
    character = next();

    // single-line comments
    if (character === "/") {
        
        do {
            value += character;
            character = next();
        } while (character && character !== "\r" && character !== "\n");

        return { value, character };
    }

    // multi-line comments
    if (character === STAR) {

        while (character) {
            value += character;
            character = next();

            // check for end of comment
            if (character === STAR) {
                value += character;
                character = next();
                
                //end of comment
                if (character === SLASH) {
                    value += character;

                    /*
                        * The single-line comment functionality cues up the
                        * next character, so we do the same here to avoid
                        * splitting logic later.
                        */
                    c = next();
                    return { value, character };
                }
            }
        }

        unexpectedEOF();
        
    }

    // if we've made it here, there's an invalid character
    unexpected(character);        
}


/**
 * Convenience function for throwing unexpected character errors.
 * @param {string} c The unexpected character.
 * @returns {void}
 * @throws {UnexpectedChar} always.
 */
function unexpected(character) {
    throw new UnexpectedChar(character, locate());
}

/**
 * Convenience function for throwing unexpected EOF errors.
 * @returns {void}
 * @throws {UnexpectedEOF} always.
 */
function unexpectedEOF() {
    throw new UnexpectedEOF(locate());
}



