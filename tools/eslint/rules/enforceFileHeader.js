/**
 * Custom ESLint rule to enforce a mandatory TSDoc file header.
 * Checks for a top-level block comment with summary text, avoiding JSDoc tags.
 */

/**
 * Finds the line number where the script content begins in a Vue SFC.
 * Uses text matching to be robust against parser AST differences (e.g., missing templates).
 *
 * @param sourceCode - The ESLint source code object.
 * @returns The expected line number for the header (line after <script> tag), or 1.
 */
function getVueScriptStartLine(sourceCode) {
  const text = sourceCode.getText();
  // Matches the first <script> opening tag, handling attributes and multiline tags.
  const scriptRegex = /<script[^>]*>/;
  const match = text.match(scriptRegex);

  if (match) {
    // Find the end index of the opening tag (">")
    const endIndex = match.index + match[0].length;
    // Get the line number of that closing bracket
    const loc = sourceCode.getLocFromIndex(endIndex);
    // Expect the comment to start on the next line
    return loc.line + 1;
  }

  // Fallback for non-SFC or parse errors
  return 1;
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
          expectedLine = getVueScriptStartLine(sourceCode);
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
              // For Vue, we need to insert after the script tag.
              // We rely on the text match again to find the insertion point.
              const text = sourceCode.getText();
              const match = text.match(/<script[^>]*>/);
              if (match) {
                const endIndex = match.index + match[0].length;
                return fixer.insertTextAfterRange([match.index, endIndex], '\n' + headerTemplate);
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
