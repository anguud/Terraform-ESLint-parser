import { isNullishCoalesce } from "typescript";
import { parse } from "./index";

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

// const ast = parse(some_json_string);
const ast = parse(complex_tf_string, null);
// const ast = getTokens(some_tf_string);

console.log(JSON.stringify(ast, null, 3));