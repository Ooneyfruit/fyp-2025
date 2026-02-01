/**
 * Global test setup configuration.
 */
import { afterEach, vi } from 'vitest';

import { mockAuth, mockDb, resetFirebaseMocks } from './mocks/firebase';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({}))
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(() => vi.fn())
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockDb),
  initializeFirestore: vi.fn(() => mockDb),
  persistentLocalCache: vi.fn(),
  persistentMultipleTabManager: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
  // Core mock for Rota time handling.
  Timestamp: {
    now: vi.fn(() => ({
      toDate: () => new Date(),
      toMillis: () => Date.now()
    })),
    fromDate: vi.fn((date: Date) => ({
      toDate: () => date,
      toMillis: () => date.getTime()
    }))
  }
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
  resetFirebaseMocks();
});
