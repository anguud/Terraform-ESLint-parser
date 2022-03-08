const Spec = [
    // ----------------
    // Whitespace

    [/^\s+/, null],
    
    // ----------------
    // Comments:

    // Single line: 
    [/^\/\/.*/, null],

    // multi-line comments:
    [/^\/\*[\s\S]*?\*\//, null],

    // ----------------
    // Symbol, delimiters:
    [/^;/, ';'],
    [/^\{/, '{'],
    [/^\}/, '}'],
    [/^\(/, '('],
    [/^\)/, ')'],

    // ----------------
    // Math operators: +, -, * /
    [/^[+\-]/, 'ADDITIVE_OPERATOR'],
    [/^[*\/]/, 'MULTIPLICATIVE_OPERATOR'],


    // ----------------
    //Assignments:
    [/^[*\=]/, 'ASSIGNMENT_OPERATOR'],

    // ----------------
    //Numbers:

    [/^\d+/, 'NUMBER'],

    // ----------------
    // Strings

    [/^"[^"]*"/, 'STRING'],
    [/^'[^']*'/, 'STRING'],


    // ----------------
    // Resource

    [/resource/,'resource'],

    // ----------------
    // Identifier

    [/^\W+/, 'IDENTIFIER'],


];


class Tokenizer {
    init (string) {
        this._string = string;
        this._cursor = 0;
    }

    isEOF() {
        return this._cursor === this._string.length;
    }

    hasMoreTokens() {
        return (this._cursor < this._string.length);
    }

    getNextToken() {
        if (!this.hasMoreTokens()) {
            return null
        }
        
        const string = this._string.slice(this._cursor);
        
        for(const [regexp, tokenType] of Spec) {
            const tokenValue = this._match(regexp, string);

            // coun't match this rule, continue.
            if (tokenValue == null) {
                continue
            }

            // Should skip token, e.g. whitespace.
            if (tokenType == null){
                return this.getNextToken();
            }

            return {
                type: tokenType,
                value: tokenValue,
            };
        }
        
        
        throw new SyntaxError(`Unexpected token: "${string[0]}"`)
     }

     /**
      * Matches a token for a regular expression,
      * 
      * @param {regex to be matched} regexp 
      * @param {string to be lookad at} string 
      * @returns 
      */
     _match(regexp, string) {
        const matched = regexp.exec(string);
        if (matched == null) {
            return null;
        }
        this._cursor += matched[0].length;
        return matched[0];
     }
}

module.exports = {
    Tokenizer,
}