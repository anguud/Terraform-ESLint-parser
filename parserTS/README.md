<h1 align="center">Terraform-ESLint-parser</h1>

Parser for parsing Terraforms HCL syntaxr to ESlint's ESTree format

This project was written as part of a master thesis at the IT University of Copenhagen.
This should be considered a work in progress and is not meant for commercial use.


## Installation

- Requires Node.js `>=14.17.0`
- Requires ESLint `>=8`

## Installation and usage 

**NB:** This parser is mean to be used with the set of rules that can be found in another repo: https://github.com/anguud/eslint-plugin-terraform-rules

As this is not package is not published, installation through yarn or npm is not possible. 
Instead to include this `terraform-ESLint-parser`package in a project it should be cloned or downloaded and added to the dependencies inside the `package.json` manually. 

Fist clone this repo to you local machine 
Then add the path for this repo to the dependencies in your `package.json` file 

```JSONC

 "dependencies": {
    "terraform-ESLint-parser": "file:../Terraform-ESLint-parser/parserTS"
  },
```

It is recommended to add this to the an overrides configuration to the `.eslintrc` configuration: 

```JSONC
"overrides": [
    {
      "files": [
        "*.tf"
      ], 
      "parser": "terraform-ESLint-parser", // Set this parser.
      "extends": "plugin:terraform-rules/terraform" // rules plugin
    }
  ],
```

This ensures that the parser is only used on Terraform files (`.tf`)

Note that in the above example configuration the rules plugin mentioned above has been used. 

