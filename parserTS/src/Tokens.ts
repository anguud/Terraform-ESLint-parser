/**
-------------------------------------------------------------------
* IMPORTS
-------------------------------------------------------------------
*/

import { Token, Location, SourceLocation, Position } from "./types";

const Spec: [RegExp, string | null][] = [
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
    // provider

    [/^provider/, "provider"],

    // ----------------
    // variable

    [/^variable/, "variable"],

    // ----------------
    // variable

    [/^var/, "var"],

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
    // parser does not support multiplication over division.
    [/^[*\/]/, "MULTIPLICATIVE_OPERATOR"],

    // ----------------
    // Strings

    [/^"[^"]*"/, "STRING"],
    [/^'[^']*'/, "STRING"],
];


export function getTokens(code: string) {
    // starting point:
    let offset = 0; // starting point (we havent reached the first character)
    let line = 1;
    let column = 0;
    let newLine = false;

    // our list of tokens
    const tokens: Token[] = [];

    while (!isEOF() || !hasMoreTokens()) {
        const token = findTokens()
        if(token) tokens.push(token);
        else break;
    }

    return tokens;

    function findTokens(): (Token | null){
        const string = code.slice(offset);

        // When the end of the code is parsed, return null.
        if(offset >= code.length) {
            return null;
        }

        for (const [regexp, tokenType] of Spec) {
            const tokenValue = _match(regexp, string);

            // coun't match this rule, continue.
            if (tokenValue == null) {
                continue;
            }

            // Should skip token, e.g. whitespace.
            if (tokenType == null) {
                getNextToken(string);
                return findTokens();
            }
            const start = getLocation();

            // getNextToken(string)
            return makeToken(tokenType, tokenValue, start);
        }

        throw new SyntaxError(`Unexpected token: "${string[0]}"`);
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
    function _match(regexp: RegExp, string: string) {
        const matched = regexp.exec(string);
        if (matched == null) {
            return null;
        }
        return matched[0];
    }


    //get next token
    function getNextToken(tokenstring: string) {
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
    function getLocation(): Position {
        return {
            line,
            column,
            offset,
        };
    }

    //create token, 'end'-parameter can be deleted if we never use.
    function makeToken(
        tokenType: string,
        value: string,
        startLoc: Position,
        endLoc?: Position
    ): Token {
        offset += value.length;
        column += value.length;

        const endOffset = startLoc.offset + value.length;
        // const range = {
        //     range: [startLoc.offset, endOffset]
        // }

        return {
            type: tokenType,
            value,
            loc: {
                start: startLoc,
                end: endLoc ?? {
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
