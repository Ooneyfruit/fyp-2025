import process from 'node:process';

import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginJsdoc from 'eslint-plugin-jsdoc';
import pluginPromise from 'eslint-plugin-promise';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginSonar from 'eslint-plugin-sonarjs';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

// Configuration constants for quality gates.
const COGNITIVE_COMPLEXITY_LIMIT = 8;
const CYCLOMATIC_COMPLEXITY_LIMIT = 8;
const MAX_DEPTH_LIMIT = 3;
const MAX_LINES_LIMIT = 50;
const NO_MAGIC_NUMBERS_IGNORE = [-1, 0, 1];

/**
 * ESLint configuration for RotaDent.
 * Incorporates SonarJS, Unicorn, and strict architectural boundaries.
 */
export default [
  // 1. Global ignores.
  {
    ignores: ['dist/', 'coverage/', '.firebase/', 'public/', 'docs/gen/']
  },

  // 2. Setup environment.
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },

  // 3. Plugin integrations.
  pluginJs.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  pluginJsdoc.configs['flat/recommended'],
  pluginPromise.configs['flat/recommended'],
  pluginSonar.configs.recommended,
  pluginUnicorn.configs['flat/recommended'],

  // 4. Strict rules enforcement.
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    plugins: {
      'simple-import-sort': pluginSimpleImportSort
    },
    rules: {
      // --- Console & debugging ---
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',

      // --- Architectural strictness ---
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-magic-numbers': [
        'warn',
        {
          ignore: NO_MAGIC_NUMBERS_IGNORE,
          ignoreArrayIndexes: true
        }
      ],
      eqeqeq: ['error', 'always'],

      // --- Code complexity ---
      complexity: ['error', { max: CYCLOMATIC_COMPLEXITY_LIMIT }],
      'max-depth': ['error', { max: MAX_DEPTH_LIMIT }],
      'max-lines-per-function': [
        'warn',
        {
          max: MAX_LINES_LIMIT,
          skipBlankLines: true,
          skipComments: true
        }
      ],
      'sonarjs/cognitive-complexity': ['error', COGNITIVE_COMPLEXITY_LIMIT],

      // --- Vue specifics ---
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/attributes-order': ['error', { alphabetical: true }],
      'vue/require-default-prop': 'error',
      'vue/html-self-closing': [
        'error',
        {
          html: { void: 'always', normal: 'always', component: 'always' }
        }
      ],

      // --- Unicorn (modern JS) ---
      'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',

      // --- JSDoc strictness ---
      'jsdoc/require-description': 'error',
      'jsdoc/require-param-type': 'error',
      'jsdoc/require-returns-type': 'error',
      'jsdoc/check-types': 'error'
    }
  },

  // Prettier must be last.
  eslintConfigPrettier
];
