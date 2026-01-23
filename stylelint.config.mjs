/**
 * Stylelint configuration.
 * Enforces CSS/SCSS coding standards within Vue files.
 * Updated for Stylelint v16 compatibility (stylistic rules removed).
 */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
  plugins: ['stylelint-order'],
  rules: {
    // --- Architecture & Complexity ---

    // Limit nesting depth to prevent selector explosion.
    'max-nesting-depth': 3,

    // Disallow duplicate selectors (cleanup).
    'no-duplicate-selectors': true,

    // Disallow unknown units (catches typos).
    'unit-no-unknown': true,

    // Enforce kebab-case for classes (strict consistency).
    'selector-class-pattern': String.raw`^[a-z][a-z0-9\-]+$`,

    // --- Order & Organization ---

    // Strict Alphabetical Order (via stylelint-order plugin)
    'order/properties-alphabetical-order': true,

    // --- Vue Specifics ---

    // Ensure v-bind is used correctly in CSS (ignores v-bind() function).
    'value-keyword-case': ['lower', { ignoreFunctions: ['v-bind'] }],

    // Disallow empty blocks (keeps code clean).
    'block-no-empty': true
  }
};
