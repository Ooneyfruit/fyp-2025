/**
 * Custom ESLint rule to enforce a mandatory TSDoc file header.
 * Checks for a top-level block comment with summary text, avoiding JSDoc tags.
 */

/**
 * Finds the script block in a Vue SFC AST.
 *
 * @param node - The Program node.
 * @returns The script element node or undefined.
 */
function findVueScriptBlock(node) {
  const children = node.templateBody ? node.templateBody.parent.children : node.body;
  return children.find((child) => child.type === 'VElement' && child.name === 'script');
}

/**
 * Validates if a comment is a valid TSDoc header.
 *
 * @param comment - The comment node to check.
 * @returns True if valid TSDoc, false otherwise.
 */
function isValidTSDocHeader(comment) {
  if (!comment || !comment.value.startsWith('*')) {
    return false;
  }
  // Check for content (ignoring * and whitespace)
  const hasContent = comment.value.replaceAll(/\*|\s/g, '').length > 0;
  // Check for forbidden legacy tags
  const hasLegacyTags = comment.value.includes('@file') || comment.value.includes('@description');

  return hasContent && !hasLegacyTags;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce a mandatory TSDoc block comment header.',
      category: 'Best Practices',
      recommended: true
    },
    fixable: 'code',
    schema: []
  },
  create(context) {
    return {
      Program(node) {
        const sourceCode = context.sourceCode;
        const isVue = context.filename.endsWith('.vue');
        let expectedLine = 1;

        if (isVue) {
          const scriptBlock = findVueScriptBlock(node);
          if (scriptBlock) {
            expectedLine = scriptBlock.loc.start.line + 1;
          }
        }

        const headerComment = sourceCode
          .getAllComments()
          .find((c) => c.type === 'Block' && c.loc.start.line === expectedLine);

        if (isValidTSDocHeader(headerComment)) {
          return;
        }

        context.report({
          node,
          loc: { line: expectedLine, column: 0 },
          message: isVue
            ? 'Vue component is missing a valid TSDoc header inside the <script> tag.'
            : 'File is missing a valid TSDoc header at the top.',
          fix(fixer) {
            const headerTemplate = `/**\n * (needs description).\n */\n`;

            if (isVue) {
              const scriptBlock = findVueScriptBlock(node);
              if (scriptBlock && scriptBlock.startTag) {
                return fixer.insertTextAfter(scriptBlock.startTag, '\n' + headerTemplate);
              }
              return null;
            }

            // For standard files, prepend to the file
            if (!headerComment) {
              return fixer.insertTextBeforeRange([0, 0], headerTemplate + '\n');
            }
            return null;
          }
        });
      }
    };
  }
};
