"use strict";
exports.__esModule = true;
var Parser_1 = require("../../parserTS/src/Parser");

var some_tf_string = "resource \"google_compute_ssl_policy\" \"vulnerable_example\" { \n                                name = \"production-ssl-policy\"\n                                profile = \"MODERN\"\n                                min_tls_version = \"TLS_1_0\"\n                            }\n                        ";
var test_string = "{ resource \"name\" \"name2\"}";
var pars = new Parser_1.Parser();
// const ast = parse(some_json_string);
var ast = pars.parse(some_tf_string);
// const ast = getTokens(some_tf_string);
console.log(JSON.stringify(ast, null, 3));
