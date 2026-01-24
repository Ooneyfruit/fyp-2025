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
    // Enforce sentence case for the commit subject.
    // This maintains a consistent and professional appearance in the project history.
    'subject-case': [RULE_SEVERITY_ERROR, 'always', 'sentence-case'],

    // Limit the maximum line length for the commit body.
    // This ensures readability across different terminals and git tools.
    'body-max-line-length': [RULE_SEVERITY_ERROR, 'always', MAX_BODY_LINE_LENGTH]
  }
};
