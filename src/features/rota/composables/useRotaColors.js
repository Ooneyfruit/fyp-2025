/**
 * Manages color logic for the Rota view.
 * - Generates consistent, accessible colors for Job Roles based on their ID.
 * - Uses a global registry to prevent color collisions between distinct roles.
 */

// Global state acts as the source of truth, ensuring consistent colouring
// across the application regardless of where useRotaColors is called.
const globalRoleRegistry = new Map();
let nextAvailableIndex = 0;

// A palette of accessible tones.
// Duplicates have been removed to ensure maximum visual distinction.
const ROLE_PALETTE = [
  { bg: '#e0f2fe', accent: '#0369a1' }, // Sky Blue
  { bg: '#f3e8ff', accent: '#7e22ce' }, // Purple
  { bg: '#dcfce7', accent: '#15803d' }, // Green
  { bg: '#ffedd5', accent: '#c2410c' }, // Orange
  { bg: '#fae8ff', accent: '#a21caf' }, // Fuchsia
  { bg: '#fef08a', accent: '#854d0e' }, // Yellow
  { bg: '#ffe4e6', accent: '#a03f58' }, // Rose
  { bg: '#e2e8f0', accent: '#334155' } // Slate
];

/**
 * Composable providing color assignment logic.
 * @returns {object} The color utility methods.
 */
export function useRotaColors() {
  /**
   * Deterministically assigns a color palette to a Role ID.
   * Checks the global registry first; if the ID is new, assigns the next
   * available color in the sequence to minimize collisions.
   * @param {string} roleId - The unique identifier for the job role.
   * @returns {object} The color object containing background and accent hex codes.
   */
  const getRoleColor = (roleId) => {
    if (!roleId) return ROLE_PALETTE[7]; // Default Slate

    if (globalRoleRegistry.has(roleId)) {
      const index = globalRoleRegistry.get(roleId);
      return ROLE_PALETTE[index];
    }

    // Assign new color
    const index = nextAvailableIndex;
    globalRoleRegistry.set(roleId, index);

    // Cycle to the next color for the next unique role
    nextAvailableIndex = (nextAvailableIndex + 1) % ROLE_PALETTE.length;

    return ROLE_PALETTE[index];
  };

  return { getRoleColor };
}
