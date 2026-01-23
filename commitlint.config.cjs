/**
 * CommitLint configuration.
 * Enforces Conventional Commits standard (feat, fix, docs, style, refactor, test, chore).
 */

// Configuration constants.
const RULE_SEVERITY_ERROR = 2;
const MAX_BODY_LINE_LENGTH = 100;

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Ensure the subject is in sentence case.
    'subject-case': [RULE_SEVERITY_ERROR, 'always', 'sentence-case'],
    // Ensure the body lines do not exceed the maximum allowed length.
    'body-max-line-length': [RULE_SEVERITY_ERROR, 'always', MAX_BODY_LINE_LENGTH]
  }
};
