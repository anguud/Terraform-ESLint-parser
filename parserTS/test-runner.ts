import { parseForESLint } from "./index";
import { parseForESLint  as jsonParse } from 'jsonc-eslint-parser'

const some_tf_string = `resource "google_compute_ssl_policy" "vulnerable_example" { 
                                name = "production-ssl-policy"
                                profile = "MODERN"
                                min_tls_version = "TLS_1_0"
                            }
                        `;

const complex_tf_string = 
                        `resource "google_compute_ssl_policy" "vulnerable_example" { 
                            name = "production-ssl-policy"
                            profile = "MODERN"
                            min_tls_version = "TLS_1_0"
                        }

                        resource "google_compute_ssl_policy" "SECOND_EXAMPLE" { 
                            name = "production-ssl-policy"
                            profile = "MODERN"
                            min_tls_version = "TLS_1_0"
                        }
`;

const emptyString = `;`

const test_string = `{ resource "name" "name2"}`;

const js_string = `
const testRule = {
    create(_context: any) {
      return {
        Identifier(node: any) {
          console.log(node);
          _context.report(node, 'This is unexpected!');
        }
      };
    },
  }

;

export {testRule}`

const json_string = `{
  "glossary": {
      "title": "example glossary",
  "GlossDiv": {
          "title": "S",
    "GlossList": {
              "GlossEntry": {
                  "ID": "SGML",
        "SortAs": "SGML",
        "GlossTerm": "Standard Generalized Markup Language",
        "Acronym": "SGML",
        "Abbrev": "ISO 8879:1986",
        "GlossDef": {
                      "para": "A meta-markup language, used to create markup languages such as DocBook.",
          "GlossSeeAlso": ["GML", "XML"]
                  },
        "GlossSee": "markup"
              }
          }
      }
  }
}`

// const ast = parse(some_json_string);
const ast = parseForESLint(complex_tf_string, {});
const jsonAst = jsonParse(json_string)
// const ast = getTokens(some_tf_string);

// console.log(JSON.stringify(ast, null, 3));
// console.log(jsonAst)
console.log(ast)
