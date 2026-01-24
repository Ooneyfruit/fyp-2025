/**
 * Manages colour logic for the Rota view.
 * Primary responsibility: generates consistent, accessible colours for Job Roles based on their ID
 * to ensure visual distinction across the interface.
 * Refactored to resolve strict TypeScript index checks and function scoping requirements.
 */

/**
 * bg - Hex code for the background colour.
 * accent - Hex code for the accent/text colour.
 */

const globalRoleRegistry = new Map();

let nextAvailableIndex = 0;

const DEFAULT_PALETTE_INDEX = 7;

/**
 * A palette of accessible tones.
 * Logic: tones are selected to ensure high contrast and maximum visual distinction.
 */
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
 * Deterministically assigns a colour palette to a Role ID.
 * Logic: checks the global registry first; if the ID is new, assigns the next
 * available colour in the sequence to minimise collisions.
 * @param [roleId] - The unique identifier for the job role.
 * @returns The colour object containing background and accent hex codes.
 */
const getRoleColor = (roleId) => {
  if (!roleId) {
    return ROLE_PALETTE[DEFAULT_PALETTE_INDEX];
  }

  if (globalRoleRegistry.has(roleId)) {
    const index = globalRoleRegistry.get(roleId) ?? DEFAULT_PALETTE_INDEX;
    return ROLE_PALETTE[index];
  }

  const index = nextAvailableIndex;
  globalRoleRegistry.set(roleId, index);

  nextAvailableIndex = (nextAvailableIndex + 1) % ROLE_PALETTE.length;

  return ROLE_PALETTE[index];
};

/**
 * Composable providing colour assignment logic.
 * @returns The colour utility methods.
 */
export function useRotaColors() {
  return { getRoleColor };
}
