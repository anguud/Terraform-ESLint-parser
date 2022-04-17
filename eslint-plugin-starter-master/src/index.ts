import { myRule } from "./rules/my-prefix/my-rule/_rule";

export const rules = {
  "my-prefix/my-rule": myRule,
};

export const configs = {
  recommended: {
    extends: ["plugin:starter/my-prefix"],
    plugins: ["starter"],
  },
  ["my-prefix"]: {
    plugins: ["starter"],
    rules: {
      "starter/my-prefix/my-rule": ["error"],
    },
  },
};
