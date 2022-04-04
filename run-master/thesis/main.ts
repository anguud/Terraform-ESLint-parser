import { Parser } from "../../parserTS/src/Parser";
// import { parse } from "../../parserThesis/src/Parser.js";
// import { parse } from "../src/parse.js";

const some_tf_string = `resource "google_compute_ssl_policy" "vulnerable_example" { 
                                name = "production-ssl-policy"
                                profile = "MODERN"
                                min_tls_version = "TLS_1_0"
                            }
                        `;

const test_string = `{ resource "name" "name2"}`



const pars = new Parser()
// const ast = parse(some_json_string);
const ast = pars.parse(some_tf_string);
// const ast = getTokens(some_tf_string);


console.log(JSON.stringify(ast,null, 3));