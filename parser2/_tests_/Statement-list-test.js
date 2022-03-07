module.exports = test => {
    test(
        `
        "Hello;

        42;

    `,
        {
            type: 'Program',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'StringLiteral',
                  value: 'Hello',
                },
              },
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'NumericLiteral',
                  value: 42,
                },
              },
            ],
        },
    );
};