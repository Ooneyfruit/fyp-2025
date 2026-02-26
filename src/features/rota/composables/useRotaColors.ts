/**
 * Manages colour logic for the application.
 * Strategy:
 * 1. Overrides (from Firestore) take absolute precedence.
 * 2. Automatic assignments use deterministic hashing (Name -\> Index).
 * 3. Collisions (with overrides or other automatics) trigger linear probing.
 */

import { reactive, watch } from 'vue';

import type { PracticeRole } from '@/features/rota/rotaTypes';

interface RoleColor {
  bg: string;
  accent: string;
}

const STORAGE_KEY = 'rd-rota-role-colors';
const DEFAULT_PALETTE_INDEX = 7;
const HASH_BIT_SHIFT = 5;
const PALETTE_SIZE = 8;

export const ROLE_PALETTE: RoleColor[] = [
  { bg: '#e2e8f0', accent: '#334155' }, // 0: Slate
  { bg: '#f3e8ff', accent: '#7e22ce' }, // 1: Purple
  { bg: '#ffe4e6', accent: '#a03f58' }, // 2: Rose
  { bg: '#e0f2fe', accent: '#0369a1' }, // 3: Sky Blue
  { bg: '#ffedd5', accent: '#c2410c' }, // 4: Orange
  { bg: '#dcfce7', accent: '#15803d' }, // 5: Green
  { bg: '#fef08a', accent: '#854d0e' }, // 6: Yellow
  { bg: '#fae8ff', accent: '#a21caf' } // 7: Fuchsia
];

// Singleton State
const globalState = reactive<{
  autoRegistry: Record<string, number>;
  overrides: Record<string, number>;
  isInitialized: boolean;
}>({
  autoRegistry: {},
  overrides: {},
  isInitialized: false
});

const ensureInitialized = () => {
  if (globalState.isInitialized) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      Object.assign(globalState.autoRegistry, JSON.parse(raw));
    }
  } catch {
    // Silent fail
  } finally {
    globalState.isInitialized = true;
  }
};

watch(
  () => globalState.autoRegistry,
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
    } catch {
      // Quota exceeded
    }
  },
  { deep: true }
);

const hashStringToIndex = (str: string): number => {
  let hash = 0;
  for (const char of str) {
    const code = char.codePointAt(0) || 0;
    hash = code + ((hash << HASH_BIT_SHIFT) - hash);
  }
  return Math.abs(hash) % PALETTE_SIZE;
};

/**
 * Checks if an index is available for assignment.
 */
const isIndexAvailable = (idx: number, currentKey: string): boolean => {
  // 1. Hard Block: Is this index used by ANY override?
  for (const overrideIdx of Object.values(globalState.overrides)) {
    if (overrideIdx === idx) return false;
  }

  // 2. Soft Block: Is this index used by another role's auto-assignment?
  for (const [key, val] of Object.entries(globalState.autoRegistry)) {
    if (key !== currentKey && val === idx) return false;
  }

  return true;
};

/**
 * Finds the next safe index using linear probing.
 */
const findSafeIndex = (preferred: number, key: string): number => {
  let idx = preferred;
  for (let i = 0; i < PALETTE_SIZE; i++) {
    if (isIndexAvailable(idx, key)) return idx;
    idx = (idx + 1) % PALETTE_SIZE;
  }
  return preferred; // Saturation fallback
};

/**
 * Retrieves the colour for a role.
 */
const getRoleColor = (roleKey?: string): RoleColor => {
  const defaultColor = ROLE_PALETTE[DEFAULT_PALETTE_INDEX]!;
  if (!roleKey) return defaultColor;

  ensureInitialized();
  const key = roleKey.trim().toLowerCase();

  // 1. Check Overrides (Highest Priority)
  const overrideIdx = globalState.overrides[key];
  if (overrideIdx !== undefined) {
    return ROLE_PALETTE[overrideIdx] || defaultColor;
  }

  // 2. Check Existing Auto-Assignment
  const autoIdx = globalState.autoRegistry[key];
  if (autoIdx !== undefined && isIndexAvailable(autoIdx, key)) {
    return ROLE_PALETTE[autoIdx] || defaultColor;
  }

  // 3. Assign New
  const preferred = hashStringToIndex(key);
  const safeIdx = findSafeIndex(preferred, key);

  globalState.autoRegistry[key] = safeIdx;
  return ROLE_PALETTE[safeIdx] || defaultColor;
};

/**
 * Syncs local state with backend overrides.
 */
const prefillRegistry = (roles: PracticeRole[]) => {
  ensureInitialized();

  // Reset overrides
  for (const key of Object.keys(globalState.overrides)) {
    delete globalState.overrides[key];
  }

  const forbiddenIndices = new Set<number>();

  // Apply new overrides
  for (const role of roles) {
    if (role.color_index !== undefined && role.color_index !== null) {
      const key = role.name.trim().toLowerCase();
      globalState.overrides[key] = role.color_index;
      forbiddenIndices.add(role.color_index);
    }
  }

  // Purge any auto-assignments that conflict with overrides
  for (const [key, idx] of Object.entries(globalState.autoRegistry)) {
    if (forbiddenIndices.has(idx)) {
      delete globalState.autoRegistry[key];
    }
  }
};

export function useRotaColors() {
  return { getRoleColor, prefillRegistry, ROLE_PALETTE };
}
