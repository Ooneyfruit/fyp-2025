/**
 * Shared utility functions for Rota logic.
 */

/**
 * Checks if a user's role matches the target role for a shift.
 * Performs a case-insensitive comparison to handle data inconsistencies.
 *
 * @param userRole - The role defined on the user's profile (e.g., "Hygienist").
 * @param targetRole - The role required by the shift/column (e.g., "Dentist").
 * @returns True if the roles match.
 */
export const isRoleMatch = (
  userRole: string | undefined | null,
  targetRole: string | undefined | null
): boolean => {
  if (!userRole || !targetRole) return false;
  return userRole.trim().toLowerCase() === targetRole.trim().toLowerCase();
};
