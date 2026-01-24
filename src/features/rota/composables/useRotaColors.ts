/**
 * Manages colour logic for the Rota view.
 * Primary responsibility: generates consistent, accessible colours for job roles based on their ID
 * to ensure visual distinction across the interface.
 * Implements module-level state to persist assignments across component lifecycles.
 */

/**
 * Defines the structure for the colour pairs used in the user interface.
 */
interface ColourPalette {
  bg: string;
  accent: string;
}

// Global registry to persist colour assignments across component lifecycles.
const globalRoleRegistry = new Map<string, number>();

// Tracks the next available index in the palette to ensure unique assignments.
let nextAvailableIndex = 0;

// Fallback index used for missing or invalid role identifiers.
const DEFAULT_PALETTE_INDEX = 7;

/**
 * A palette of accessible tones.
 * Logic: tones are selected to ensure high contrast and maximum visual distinction.
 */
const ROLE_PALETTE: ColourPalette[] = [
  // Sky blue.
  { bg: '#e0f2fe', accent: '#0369a1' },
  // Purple.
  { bg: '#f3e8ff', accent: '#7e22ce' },
  // Green.
  { bg: '#dcfce7', accent: '#15803d' },
  // Orange.
  { bg: '#ffedd5', accent: '#c2410c' },
  // Fuchsia.
  { bg: '#fae8ff', accent: '#a21caf' },
  // Yellow.
  { bg: '#fef08a', accent: '#854d0e' },
  // Rose.
  { bg: '#ffe4e6', accent: '#a03f58' },
  // Slate.
  { bg: '#e2e8f0', accent: '#334155' }
];

/**
 * Deterministically assigns a colour palette to a Role ID.
 * Logic: checks the global registry first; if the ID is new, assigns the next
 * available colour in the sequence to minimise collisions.
 * @param roleId - The unique identifier for the job role.
 * @returns The colour object containing background and accent hex codes.
 */
const getRoleColor = (roleId?: string | null): ColourPalette => {
  if (!roleId) {
    return ROLE_PALETTE[DEFAULT_PALETTE_INDEX];
  }

  // Retrieve the existing assignment if the role has been processed before.
  if (globalRoleRegistry.has(roleId)) {
    const index = globalRoleRegistry.get(roleId) ?? DEFAULT_PALETTE_INDEX;
    return ROLE_PALETTE[index];
  }

  // Assign a new colour from the sequence for fresh identifiers.
  const index = nextAvailableIndex;
  globalRoleRegistry.set(roleId, index);

  // Increment and wrap the index to cycle through the palette.
  nextAvailableIndex = (nextAvailableIndex + 1) % ROLE_PALETTE.length;

  return ROLE_PALETTE[index];
};

/**
 * Composable providing colour assignment logic.
 * @returns An object containing the colour utility methods.
 */
export function useRotaColors() {
  return { getRoleColor };
}
