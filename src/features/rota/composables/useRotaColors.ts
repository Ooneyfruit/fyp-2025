/**
 * Manages colour logic for the application.
 * Implements a Singleton, Persistent, and Deterministic strategy for Role colours.
 *
 * Architecture:
 * 1. Singleton: State is defined in module scope, shared by all importers.
 * 2. Persistent: Syncs with 'rd-rota-role-colors' in localStorage.
 * 3. Name-Based: Uses role NAME as the universal key to bridge Rota and User domains.
 */

import { reactive, watch } from 'vue';

interface RoleColor {
  bg: string;
  accent: string;
}

const STORAGE_KEY = 'rd-rota-role-colors';
const DEFAULT_PALETTE_INDEX = 7;

/**
 * A curated palette of accessible, distinct tones.
 */
const ROLE_PALETTE: RoleColor[] = [
  { bg: '#e2e8f0', accent: '#334155' }, // Slate
  { bg: '#f3e8ff', accent: '#7e22ce' }, // Purple
  { bg: '#ffe4e6', accent: '#a03f58' }, // Rose
  { bg: '#e0f2fe', accent: '#0369a1' }, // Sky Blue
  { bg: '#ffedd5', accent: '#c2410c' }, // Orange
  { bg: '#dcfce7', accent: '#15803d' }, // Green
  { bg: '#fef08a', accent: '#854d0e' }, // Yellow
  { bg: '#fae8ff', accent: '#a21caf' } // Fuchsia
];

// --- Singleton State ---
// Defined outside the function to ensure all components share the same memory reference.
const globalState = reactive<{
  registry: Record<string, number>;
  isInitialized: boolean;
}>({
  registry: {},
  isInitialized: false
});

/**
 * Internal: Loads registry from LocalStorage.
 * Safe to call multiple times; only runs once per app lifecycle.
 */
const ensureInitialized = () => {
  if (globalState.isInitialized) return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(globalState.registry, parsed);
    }
  } catch {
    // Silent failure: LocalStorage is likely unavailable or corrupt.
    // We fall back to the empty in-memory registry.
  } finally {
    globalState.isInitialized = true;
  }
};

/**
 * Internal: Saves registry to LocalStorage.
 * Triggered automatically by the watcher.
 */
const persistState = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState.registry));
  } catch {
    // Silent failure: Quota exceeded or storage restricted.
    // Data remains consistent in memory for the session.
  }
};

// Set up persistence watcher immediately
watch(() => globalState.registry, persistState, { deep: true });

/**
 * Determines the next available color index.
 * Priority:
 * 1. First index strictly NOT in use.
 * 2. If all used, cycle using modulo (Keys Count % Palette Size).
 */
const assignColorIndex = (): number => {
  const usedIndices = new Set(Object.values(globalState.registry));

  // 1. Search for holes in the usage
  for (let i = 0; i < ROLE_PALETTE.length; i++) {
    if (!usedIndices.has(i)) {
      return i;
    }
  }

  // 2. Fallback to cycling
  return Object.keys(globalState.registry).length % ROLE_PALETTE.length;
};

/**
 * Retrieves the colour for a role.
 * Automatically assigns and persists a new colour if the role is unknown.
 *
 * @param roleKey - The role name (e.g., "Dentist").
 */
const getRoleColor = (roleKey?: string): RoleColor => {
  if (!roleKey) return ROLE_PALETTE[DEFAULT_PALETTE_INDEX];

  ensureInitialized();

  const key = roleKey.trim().toLowerCase();

  // Return existing
  if (globalState.registry[key] !== undefined) {
    const idx = globalState.registry[key];
    return ROLE_PALETTE[idx] || ROLE_PALETTE[DEFAULT_PALETTE_INDEX];
  }

  // Assign new
  const newIdx = assignColorIndex();
  globalState.registry[key] = newIdx; // Triggers watch -> persistState

  return ROLE_PALETTE[newIdx];
};

export function useRotaColors() {
  return { getRoleColor };
}
