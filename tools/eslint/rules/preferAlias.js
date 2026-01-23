/**
 * PreferAlias.
 *
 * Custom ESLint rule for the RotaDent project.
 * Automatically detects relative imports that traverse up the directory tree
 * and suggests replacing them with the project's '@' alias.
 */

import path from 'node:path';
import process from 'node:process';

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce the use of the "@" alias instead of relative parent imports.',
      category: 'Best Practices',
      recommended: true
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          alias: { type: 'string' },
          root: { type: 'string' }
        },
        additionalProperties: false
      }
    ],
    messages: {
      preferAlias: 'Use the "@" alias instead of relative parent imports.'
    }
  },

  /**
   * Creates the visitor functions for the rule.
   * @param {object} context - The ESLint rule context.
   * @returns {object} The visitor object.
   */
  create(context) {
    // Configuration defaults based on RotaDent's structure.
    const ALIAS_SYMBOL = '@';
    const ROOT_DIR_NAME = 'src';

    return {
      /**
       * Checks import declarations for relative parent paths.
       * @param {object} node - The import declaration node.
       */
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Only target relative imports that go up the tree (start with ..).
        if (!importPath.startsWith('../')) {
          return;
        }

        const filename = context.filename || context.getFilename();
        const absoluteImportPath = path.resolve(path.dirname(filename), importPath);

        // Determine the project root.
        // We use context.cwd as the primary source, falling back to the process working directory.
        const cwd = context.cwd || process.cwd();
        const srcPath = path.join(cwd, ROOT_DIR_NAME);

        // Check if the resolved file is actually inside the 'src' directory.
        if (!absoluteImportPath.startsWith(srcPath)) {
          return;
        }

        // Construct the aliased path.
        // Remove the absolute 'src' prefix and replace it with the alias symbol.
        const relativeToSrc = absoluteImportPath.slice(srcPath.length + 1);

        // Ensure we use forward slashes for imports, even on Windows environments.
        const normalizedPath = relativeToSrc.split(path.sep).join('/');
        const aliasedPath = `${ALIAS_SYMBOL}/${normalizedPath}`;

        context.report({
          node: node.source,
          messageId: 'preferAlias',
          /**
           * Fixes the import path by replacing it with the aliased version.
           * @param {object} fixer - The ESLint fixer object.
           * @returns {object} The fix instruction.
           */
          fix(fixer) {
            return fixer.replaceText(node.source, `'${aliasedPath}'`);
          }
        });
      }
    };
  }
};
