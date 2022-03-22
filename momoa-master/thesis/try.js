/* eslint-disable no-console */
import { parse} from "../src/parse.js";

const some_json_string = "{}";

const ast = parse(some_json_string);

console.log(JSON.stringify(ast, null, 2))