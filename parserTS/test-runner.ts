import { isNullishCoalesce } from "typescript";
import { parseForESLint } from "./index";

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

// const ast = parse(some_json_string);
const ast = parseForESLint(js_string, {});
// const ast = getTokens(some_tf_string);

console.log(JSON.stringify(ast, null, 3));
