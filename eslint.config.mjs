import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import pluginJsdoc from 'eslint-plugin-jsdoc';
import eslintConfigPrettier from 'eslint-config-prettier';
import process from 'node:process';

/**
 * ESLint configuration for RotaDent.
 * Governs code quality and style for JavaScript and Vue files.
 * Enforces strict mode and JSDoc requirements.
 */
export default [
  // 1. Global Ignores: Must be the first object and strictly separated.
  {
    ignores: ['dist/', 'coverage/', '.firebase/', 'public/']
  },

  // 2. Setup the browser environment for the source files.
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },

  // 3. Recommended rules for JS and Vue.
  pluginJs.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  // 4. JSDoc plugin setup to enforce comment-style-guide.txt.
  pluginJsdoc.configs['flat/recommended'],

  // 5. Strict rule enforcement.
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    plugins: {
      jsdoc: pluginJsdoc
    },
    rules: {
      // Toggle console warnings based on environment.
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

      // Vue specific strictness.
      'vue/multi-word-component-names': 'error',
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style']
        }
      ],
      'vue/component-api-style': ['error', ['script-setup', 'composition']],
      'vue/define-macros-order': [
        'error',
        {
          order: ['defineProps', 'defineEmits']
        }
      ],

      // JavaScript strictness (Pure-Upside additions).
      eqeqeq: ['error', 'always'], // Enforce strict equality (===).
      curly: ['error', 'all'], // Require braces for all control statements.
      'no-var': 'error', // Disallow var, enforce let/const.
      'prefer-const': 'error', // Prefer const if variable is not reassigned.
      'no-alert': 'error', // Disallow window.alert debugging.
      complexity: ['warn', { max: 10 }], // Warn if cyclomatic complexity is too high.
      'max-depth': ['warn', { max: 4 }], // Warn if nesting is too deep.

      // JSDoc enforcement based on docs/comment-style-guide.txt.
      'jsdoc/require-description': 'warn',
      'jsdoc/require-jsdoc': [
        'warn',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: true
          }
        }
      ],
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns-description': 'warn',

      // Allow JSDoc to work seamlessly with Vue files
      'jsdoc/check-tag-names': ['warn', { definedTags: ['emits', 'props'] }]
    }
  },

  // Prettier must be last to disable formatting conflicts.
  eslintConfigPrettier
];
