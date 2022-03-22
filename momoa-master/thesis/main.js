import { parse } from "../src/parse.js";

const some_tf_string = '{resource "google_compute_ssl_policy" "vulnerable_example" { name = "production-ssl-policy";profile = "MODERN";min_tls_version = "TLS_1_0";}}'; 
const some_json_string =  '{"fruit": "Apple", "size": "Large", "color": "Red"}'; 

const ast = parse(some_json_string);

console.log(JSON.stringify(ast,null, 2));