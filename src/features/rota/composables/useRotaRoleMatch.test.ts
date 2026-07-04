/**
 * Test suite for Role validation logic.
 * verifies that staff are only assigned to shifts matching their qualifications.
 */
import { describe, expect, it } from 'vitest';

import { isRoleMatch } from './useRotaRoleMatch';

describe('useRotaRoleMatch', () => {
  it('allows exact matches', () => {
    expect(isRoleMatch('Dentist', 'Dentist')).toBe(true);
    expect(isRoleMatch('Nurse', 'Nurse')).toBe(true);
  });

  it('rejects mismatches', () => {
    expect(isRoleMatch('Dentist', 'Nurse')).toBe(false);
    expect(isRoleMatch('Hygienist', 'Dentist')).toBe(false);
  });

  it('handles case insensitivity', () => {
    expect(isRoleMatch('dentist', 'Dentist')).toBe(true);
    expect(isRoleMatch('NURSE', 'nurse')).toBe(true);
  });

  it('handles undefined or null inputs gracefully', () => {
    // The function explicitly checks for falsy values, so these are valid test cases.
    expect(isRoleMatch(undefined, 'Dentist')).toBe(false);
    expect(isRoleMatch('Dentist', null)).toBe(false);
    expect(isRoleMatch(null, null)).toBe(false);
  });
});
