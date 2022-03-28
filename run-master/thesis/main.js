import { getTokens } from "../../parserThesis/src/tokens.js";
import { Parser } from "../../parserThesis/src/Parser.js";
// import { parse } from "../src/parse.js";

const some_tf_string = `{resource "google_compute_ssl_policy" "vulnerable_example" { 
                                name = "production-ssl-policy"
                                profile = "MODERN"
                                min_tls_version = "TLS_1_0"
                            }
                        }`;

const test_string = `{ ressource "name" "name2"}`
const some_json_string = `{"fruit": 
"Apple"
, "size": "Large", "color": "Red", "thing": {"indetedThing": "test", "Anotherone": "yes"}}`; 


let pars = new Parser()
// const ast = parse(some_json_string);
const ast = pars.parse(some_tf_string);
// const ast = getTokens(some_tf_string);


console.log(JSON.stringify(ast,null, 2));