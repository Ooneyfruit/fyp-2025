import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';
import process from 'node:process';

/**
 * ESLint configuration for RotaDent.
 * Governs code quality and style for JavaScript and Vue files.
 */
export default [
  // Setup the browser environment for the source files.
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },

  // Recommended rules for JS and Vue.
  pluginJs.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  // Prettier must be last to disable formatting conflicts.
  eslintConfigPrettier,

  {
    rules: {
      // Toggle console warnings based on environment.
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      // Enforce unique component names.
      'vue/multi-word-component-names': 'error'
    }
  }
];
