/**
 * Rota data access layer.
 * Primary responsibility: provides an abstraction for Firestore operations related to
 * practices, surgeries, and staff shifts.
 * Standardised to camelCase naming to resolve filesystem casing conflicts.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  type DocumentData,
  getDocs,
  type QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';

import type { PracticeRole, PracticeSurgery, Shift, ShiftInput } from '@/features/rota/rotaTypes';
import { db } from '@/services/firebase';

/**
 * Helper to map a Firestore document to a typed object with its ID.
 * @param d - The Firestore query document snapshot to map.
 * @returns The mapped object containing the document ID and data.
 */
const mapDoc = <T>(d: QueryDocumentSnapshot<DocumentData>): T => ({ id: d.id, ...d.data() }) as T;

// --- Configuration Fetching ---

/**
 * Fetches all professional roles configured for a specific practice.
 * @param practiceId - The unique identifier of the dental practice.
 * @returns A collection of practice roles.
 */
export const fetchPracticeRoles = async (practiceId: string): Promise<PracticeRole[]> => {
  try {
    const snap = await getDocs(collection(db, `practices/${practiceId}/roles`));
    return snap.docs.map((d) => mapDoc<PracticeRole>(d));
  } catch {
    return [];
  }
};

/**
 * Fetches all available surgeries within a specific practice.
 * @param practiceId - The unique identifier of the dental practice.
 * @returns A collection of surgery room data.
 */
export const fetchPracticeSurgeries = async (practiceId: string): Promise<PracticeSurgery[]> => {
  try {
    const snap = await getDocs(collection(db, `practices/${practiceId}/surgeries`));
    return snap.docs.map((d) => mapDoc<PracticeSurgery>(d));
  } catch {
    return [];
  }
};

// --- Data Fetching ---

/**
 * Retrieves all shifts and applies client-side filtering based on the practice identifier.
 * @param practiceId - The unique identifier of the dental practice.
 * @returns A filtered list of shifts belonging to the practice.
 */
export const fetchShifts = async (practiceId: string): Promise<Shift[]> => {
  try {
    const snap = await getDocs(collection(db, 'shifts'));
    return snap.docs
      .map((d) => mapDoc<Shift>(d))
      .filter((s) => s.role_id?.path?.includes(practiceId));
  } catch {
    return [];
  }
};

// --- Persistence ---

/**
 * Persists a new shift record to the database with initial draft status.
 * Logic: standardises the date to a Firestore Timestamp.
 * @param shiftData - The raw data representing the new shift.
 * @returns A promise that resolves when the operation is complete.
 */
export const createShift = async (shiftData: ShiftInput): Promise<void> => {
  const payload = {
    ...shiftData,
    date:
      typeof shiftData.date === 'string'
        ? Timestamp.fromDate(new Date(shiftData.date))
        : shiftData.date,
    is_resolved: false,
    roster_status: 'draft'
  };
  await addDoc(collection(db, 'shifts'), payload);
};

/**
 * Removes a specific shift record from the global shifts collection.
 * @param shiftId - The unique identifier of the shift to be deleted.
 * @returns A promise that resolves when the operation is complete.
 */
export const deleteShift = async (shiftId: string): Promise<void> => {
  await deleteDoc(doc(db, 'shifts', shiftId));
};
