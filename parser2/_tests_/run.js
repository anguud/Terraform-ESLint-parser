const { Parser } = require('../src/Parser');
const assert = require('assert');

const parser = new Parser();

/**
 * List of tests
 */
const tests = [
    require('./literal-test.js'),
    require('./statement-list-test.js'),
    require('./block-test.js'),
];

/**
 * For Manual tests
 */
function exec() {
    const program = `
    {
        42;
        "Hello";
    }
`;

    const ast = parser.parse(program);
    
    console.log(JSON.stringify(ast, null, 2));
}

// Manual test:
exec()

/**
 * Test function.
 */
function test(program, expected) {
    const ast = parser.parse(program);
    assert.deepEqual(ast, expected);
}

// Run all tests:

tests.forEach(testRun => testRun(test));

console.log('All assertions passed!');