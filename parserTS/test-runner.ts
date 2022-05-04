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

const extendingParser1 = `resource "google_bigquery_dataset" "dataset" {
  dataset_id = "terragoat__dataset"
  access {
    special_group = "allAuthenticatedUsers"
    role          = "READER"
  }
  labels = {
    git_commit           = "2bdc0871a5f4505be58244029cc6485d45d7bb8e"
    git_file             = "terraform__gcp__big_data_tf"
    git_last_modified_at = "2022-01-19-17-02-27"
    git_last_modified_by = "jameswoolfenden"
    git_modifiers        = "jameswoolfenden__nimrodkor"
    git_org              = "bridgecrewio"
    git_repo             = "terragoat"
    yor_trace            = "2560d883-bc3a-4cb6-b9fc-fb666edf626e"
  }
}
`

// const ast = parse(some_json_string);
// const ast = parseForESLint(complex_tf_string, {});
// const jsonAst = jsonParse(json_string)
// const ast = getTokens(some_tf_string);

// console.log(jsonAst)
// console.log(ast)

const ast = parseForESLint(extendingParser1, {});


console.log(JSON.stringify(ast, null, 3));