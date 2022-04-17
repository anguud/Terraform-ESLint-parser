import { RuleCreator } from "@typescript-eslint/utils/dist/eslint-utils";

import { isIdentifier } from "../../../utils/ast/guards";
import { resolveDocsRoute } from "../../../utils/resolve-docs-route";

/**
 * Progress
 *  [X] Detection
 *  [X] Automatic fix / Suggestions
 *  [X] Reduction of false positives
 *  [-] Fulfilling unit testing
 *  [X] Extensive documentation
 *  [X] Fulfilling configuration options
 */

type MyRuleOptions = [{ variableName: string }];

export enum MessageIds {
  FOUND_VARIABLE = "found-variable",
  FIX_VARIABLE = "fix-variable",
}

const createRule = RuleCreator(resolveDocsRoute);

/**
 * Detects and reports if any expressions assign unsafe values to known vanilla
 * XSS injection sinks.
 */
export const myRule = createRule<MyRuleOptions, MessageIds>({
  name: "my-rule",
  defaultOptions: [{ variableName: "helloWorld" }],
  meta: {
    type: "problem",
    fixable: "code",
    messages: {
      [MessageIds.FOUND_VARIABLE]: `Variable "{{ variableName }}" is not named correctly.`,
      [MessageIds.FIX_VARIABLE]: `Rename "{{ orgName }}" to "{{ newName }}"`,
    },
    docs: {
      description: "Detects DOM-based XSS vulnerabilities",
      recommended: "error",
      suggestion: true,
    },
    hasSuggestions: true,
    schema: [
      {
        type: "object",
        items: {
          variableName: { type: "string", required: true },
        },
      },
    ],
  },
  create: (context, [{ variableName }]) => {
    return {
      Identifier: (node) => {
        console.log(node);
      },

      VariableDeclarator: (node) => {
        // In case the variable does not have an id that is an identifier
        // (defensive programming) or if the variable already has the correct
        // name, then we can bail out early.
        if (!isIdentifier(node.id) || node.id.name === variableName) {
          return;
        }

        context.report({
          node: node,
          messageId: MessageIds.FOUND_VARIABLE,
          data: {
            variableName: node.id.name,
          },
          suggest: [
            {
              messageId: MessageIds.FIX_VARIABLE,
              data: {
                orgName: node.id.name,
                newName: variableName,
              },
              fix(fixer) {
                return fixer.replaceText(node.id, variableName);
              },
            },
          ],
        });
      },
    };
  },
});
