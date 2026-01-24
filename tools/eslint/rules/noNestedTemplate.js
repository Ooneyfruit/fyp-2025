/**
 * NoNestedTemplate.
 *
 * Custom ESLint rule for the RotaDent project.
 * This rule identifies and warns against the use of nested <template> tags within Vue Single File Components.
 */

/**
 * ESLint rule to detect and warn against nested template tags in Vue SFCs.
 * This rule identifies any <template> block that is a descendant of the
 * main root template, typically used for slots.
 * It targets the 'VElement' nodes specifically named 'template' and checks
 * if their parent is another 'VElement', which indicates nesting within
 * the component's structure.
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow nested template tags to encourage flatter component structures.',
      category: 'Best Practices',
      recommended: false
    },
    fixable: null,
    schema: [],
    messages: {
      nestedTemplate:
        'Nested <template> tags detected. Consider refactoring to avoid deep slot nesting.'
    }
  },

  /**
   * Creates the visitor functions for the rule.
   * @param context - The ESLint rule context.
   * @returns The visitor object.
   */
  create(context) {
    // In ESLint 9, parser services must be accessed via context.sourceCode to maintain compatibility with the flat configuration system.
    const sourceCode = context.sourceCode;
    const parserServices = sourceCode.parserServices;

    // Verify that the Vue template visitor is available before proceeding.
    // This check prevents runtime errors when the rule is executed on standard JavaScript files.
    if (!parserServices?.defineTemplateBodyVisitor) {
      return {};
    }

    // Return the visitor object that targets nodes within the Vue template body.
    return parserServices.defineTemplateBodyVisitor({
      /**
       * Checks every VElement in the template.
       * @param node - The current template element node.
       */
      VElement(node) {
        // Filter elements to only target those specifically named 'template'.
        if (node.name !== 'template') {
          return;
        }

        // The root template of an SFC has the 'VDocumentFragment' as its parent.
        // Any template tag with an element as a parent is considered nested.
        // We use optional chaining to safely traverse the parent structure.
        if (node.parent?.type === 'VElement') {
          context.report({
            node,
            messageId: 'nestedTemplate'
          });
        }
      }
    });
  }
};
