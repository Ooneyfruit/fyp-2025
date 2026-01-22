import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import process from 'node:process';

/**
 * ESLint configuration file.
 * Defines the linting rules and environments for the project.
 */
export default [
  // Define global variables for browser environments.
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    languageOptions: {
      globals: globals.browser
    }
  },

  // Incorporate recommended JavaScript rules.
  pluginJs.configs.recommended,

  // Incorporate recommended Vue.js rules.
  ...pluginVue.configs['flat/recommended'],

  // Custom rules specific to this project.
  {
    rules: {
      // Allow console logging during development.
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

      // Enforce multi-word component names to prevent HTML conflicts.
      'vue/multi-word-component-names': 'error'
    }
  }
];