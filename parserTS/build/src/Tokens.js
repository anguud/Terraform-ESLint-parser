"use strict";
/**
-------------------------------------------------------------------
* IMPORTS
-------------------------------------------------------------------
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokens = void 0;
var Spec = [
    // ----------------
    // Whitespace
    [/^\s/, null],
    // ----------------
    // Comments:
    // Single line:
    [/^\/\/.*/, "comment"],
    // multi-line comments:
    [/^\/\*[\s\S]*?\*\//, "comment"],
    // ----------------
    // Symbol, delimiters:
    [/^:/, ":"],
    [/^;/, ";"],
    [/^\{/, "{"],
    [/^\}/, "}"],
    [/^\(/, "("],
    [/^\)/, ")"],
    [/^\,/, ","],
    [/^\./, "."],
    [/^\[/, "["],
    [/^\]/, "]"],
    // ----------------
    //Numbers:
    // Numbers should be before identifiers
    // since the w+ in identifiers also will match on numbers
    [/^\d+/, "NUMBER"],
    // ----------------
    // Resource
    [/^resource/, "resource"],
    // ----------------
    // Identifiers:
    [/^\w+[(\w\-]+/, "Identifier"],
    // ----------------
    // Assignment operators =, *=, /=, +=, -=,
    [/^=/, "SIMPLE_ASSIGN"],
    [/^[\*\/\+\-]=/, "COMPLESX_ASSIGN"],
    // ----------------
    // Math operators: +, -, * /
    [/^[+\-]/, "ADDITIVE_OPERATOR"],
    // TODO: parser does not support multiplication over division.
    [/^[*\/]/, "MULTIPLICATIVE_OPERATOR"],
    // ----------------
    // Strings
    [/^"[^"]*"/, "STRING"],
    [/^'[^']*'/, "STRING"],
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
function getTokens(code) {
    // starting point:
    var offset = 0; // starting point (we havent reached the first character)
    var line = 1;
    var column = 0;
    var newLine = false;
    // our list of tokens
    var tokens = [];
    while (!isEOF() || !hasMoreTokens()) {
        var token = findTokens();
        if (token)
            tokens.push(token);
        else
            break;
    }
    return tokens;
    function findTokens() {
        var string = code.slice(offset);
        // When the end of the code is parsed, return null.
        if (offset >= code.length) {
            return null;
        }
        for (var _i = 0, Spec_1 = Spec; _i < Spec_1.length; _i++) {
            var _a = Spec_1[_i], regexp = _a[0], tokenType = _a[1];
            var tokenValue = _match(regexp, string);
            // coun't match this rule, continue.
            if (tokenValue == null) {
                continue;
            }
            // Should skip token, e.g. whitespace.
            if (tokenType == null) {
                getNextToken(string);
                return findTokens();
            }
            var start = getLocation();
            // getNextToken(string)
            return makeToken(tokenType, tokenValue, start);
        }
        throw new SyntaxError("Unexpected token: \"".concat(string[0], "\""));
    }
    function hasMoreTokens() {
        return offset < code.length;
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
        var matched = regexp.exec(string);
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
        }
        else {
            column++;
        }
        if (/^\r/.test(tokenstring)) {
            newLine = true;
            // if we already see a \r, just ignore upcoming \n
            if (/^\n/.test(tokenstring + 1)) {
                offset++;
            }
        }
        else if (/^\n/.test(tokenstring)) {
            newLine = true;
        }
    }
    // get position of token
    function getLocation() {
        return {
            line: line,
            column: column,
            offset: offset,
        };
    }
    //create token, 'end'-parameter can be deleted if we never use.
    function makeToken(tokenType, value, startLoc, endLoc) {
        offset += value.length;
        column += value.length;
        var endOffset = startLoc.offset + value.length;
        // const range = {
        //     range: [startLoc.offset, endOffset]
        // }
        return {
            type: tokenType,
            value: value,
            loc: {
                start: startLoc,
                end: endLoc !== null && endLoc !== void 0 ? endLoc : {
                    line: startLoc.line,
                    column: startLoc.column + value.length,
                    offset: endOffset,
                },
            },
            range: [startLoc.offset, endOffset],
            parent: null,
        };
    }
}
exports.getTokens = getTokens;
