module.exports = test => {
    test(
        `
        
        {
            42;
            
            "Hello";
        }
        
    `,
        {
            type: 'Program',
            body: [
                {
                    type: 'BlockStatement',
                    body: [
                        {
                            type: 'ExpressionStatement',
                            expression: {
                                type: 'NumericLiteral',
                                value: 42,
                            },
                        },

                        {
                            type: 'ExpressionStatemnet',
                            expression: {
                                type: 'StringLiteral',
                                value: 'Hello',
                            },
                        },
                    ],
                },
            ],
        },
    )
}