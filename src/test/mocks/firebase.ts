/**
 * Centralised Firebase mock definitions.
 * acts as the single source of truth for all Firebase interactions during testing.
 * utilising 'vitest-mock-extended' ensures type safety across SDK updates.
 */
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { mockDeep, type MockProxy } from 'vitest-mock-extended';

// Authentication Mocks

/**
 * A deep mock of the Firebase Auth service.
 * controls authentication state, user sessions, and sign-in methods.
 */
export const mockAuth: MockProxy<Auth> = mockDeep<Auth>();

// Firestore Mocks

/**
 * A deep mock of the Firestore database instance.
 * intercepts all database reads/writes to prevent network requests.
 */
export const mockDb: MockProxy<Firestore> = mockDeep<Firestore>();

/**
 * Helper to write to readonly properties in mocks.
 */
const writable = <T extends object>(obj: T): Record<string, unknown> => {
  return obj as unknown as Record<string, unknown>;
};

/**
 * Resets all mocks to their initial state.
 * this ensures that tests do not leak state or side effects into one another.
 */
export const resetFirebaseMocks = (): void => {
  // Clear recorded calls and return values.
  writable(mockAuth).currentUser = null;
  writable(mockDb).type = 'firestore'; // maintain internal type checks if necessary.
};
