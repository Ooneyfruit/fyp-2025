/**
 * Centralised ESLint configuration for the RotaDent project.
 * Enforces strict architectural boundaries, code complexity limits, and TSDoc standards.
 */

import process from 'node:process';

import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';
import pluginPromise from 'eslint-plugin-promise';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginSonar from 'eslint-plugin-sonarjs';
import pluginTsdoc from 'eslint-plugin-tsdoc';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginVitest from 'eslint-plugin-vitest';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Import custom local rules
import enforceFileHeader from './tools/eslint/rules/enforceFileHeader.js';
import noNestedTemplate from './tools/eslint/rules/noNestedTemplate.js';
import preferAlias from './tools/eslint/rules/preferAlias.js';

/**
 * Configuration constants for quality gates.
 */
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
    ignores: ['dist/', 'coverage/', '.firebase/', 'public/', 'docs/gen/**']
  },

  // 2. Setup environment and shared settings.
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      import: pluginImport
    },
    settings: {
      // Fix: Explicitly tell import plugin how to parse TS files
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx', '.vue']
      },
      // Fix: Configure the TypeScript resolver to always look for definitions
      'import/resolver': {
        typescript: {
          project: './tsconfig.app.json',
          alwaysTryTypes: true
        }
      },
      // Register virtual modules to prevent unresolvable path errors for Vite plugins.
      'import/core-modules': ['virtual:pwa-register/vue']
    }
  },

  // 3. Plugin integrations (Base configs).
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  pluginPromise.configs['flat/recommended'],
  pluginSonar.configs.recommended,
  pluginUnicorn.configs['flat/recommended'],

  // 4. Vue & TypeScript Parser Configuration.
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: pluginVue.parser,
      parserOptions: {
        parser: tseslint.parser,
        sourceType: 'module',
        ecmaVersion: 'latest',
        extraFileExtensions: ['.vue']
      }
    }
  },

  // 5. Strict rules enforcement.
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    plugins: {
      'simple-import-sort': pluginSimpleImportSort,
      tsdoc: pluginTsdoc
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

      // --- Import resolution ---
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'error',

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
      // FIXED: Rule expects the casing string directly as the second argument
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/attributes-order': ['error', { alphabetical: true }],
      'vue/require-default-prop': 'error',
      'vue/html-self-closing': [
        'error',
        {
          html: { void: 'always', normal: 'always', component: 'always' }
        }
      ],
      'vue/multi-word-component-names': 'off', // Often conflicts with domain-driven file naming.

      // --- Unicorn (modern JS) ---
      'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',

      // --- TSDoc strictness ---
      'tsdoc/syntax': 'warn',

      // --- TypeScript Specific Overrides ---
      // Disable the base JS rule to prevent false positives, enable the TS version.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off', // Inference is preferred in modern TS.
      '@typescript-eslint/no-explicit-any': 'warn' // Discourage 'any', but allow with warning during migration.
    }
  },

  // 6. Project-specific RotaDent constraints.
  {
    files: ['**/*.{js,ts,vue}'],
    plugins: {
      rotadent: {
        rules: {
          'enforce-file-header': enforceFileHeader,
          'no-nested-template': noNestedTemplate,
          'prefer-alias': preferAlias
        }
      }
    },
    rules: {
      'rotadent/enforce-file-header': 'error',
      'rotadent/no-nested-template': 'warn',
      'rotadent/prefer-alias': 'error'
    }
  },

  // 7. Testing specific configuration (Vitest).
  {
    files: ['**/*.{test,spec}.{js,ts,vue}'],
    plugins: {
      vitest: pluginVitest
    },
    rules: {
      ...pluginVitest.configs.recommended.rules,
      'vitest/expect-expect': 'error', // Ensures no tests are empty assertions.
      'vitest/no-disabled-tests': 'warn', // Discourage committing .skip
      'vitest/consistent-test-it': ['error', { fn: 'it' }], // Enforce 'it' over 'test' for consistency.
      // Relax complexity rules for tests, as setup code can be verbose.
      'max-lines-per-function': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'no-magic-numbers': 'off'
    }
  },

  // Prettier must be last.
  eslintConfigPrettier
];
