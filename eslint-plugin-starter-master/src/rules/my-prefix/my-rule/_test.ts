import path from "path";

import { ESLintUtils } from "@typescript-eslint/utils";

import { getCode } from "../../../utils/testing/get-code";

import { MessageIds, myRule } from "./_rule";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: path.resolve(__dirname, "..", "..", "..", ".."),
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run("my-prefix/my-rule", myRule, {
  valid: [getCode(__dirname, "allow-correct-name")],
  invalid: [
    {
      ...getCode(__dirname, "error-incorrect-name"),
      errors: [{ messageId: MessageIds.FOUND_VARIABLE }],
    },
  ],
});
