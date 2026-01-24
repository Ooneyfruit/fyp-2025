/**
 * Rota data access layer.
 * Primary responsibility: provides an abstraction for Firestore operations related to
 * practices, surgeries, and staff shifts.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  type DocumentData,
  getDocs,
  type QuerySnapshot,
  Timestamp} from 'firebase/firestore';

import { db } from '@/services/firebase';

import {
  type PracticeRole,
  type PracticeSurgery,
  type Shift,
  type ShiftInput,
  ShiftSchema
} from './rotaTypes';

// --- Configuration Fetching ---

/**
 * Fetches all professional roles configured for a specific practice.
 * @param practiceId - The unique identifier of the dental practice.
 * @returns A promise resolving to a collection of practice roles.
 */
export const fetchPracticeRoles = async (practiceId: string): Promise<PracticeRole[]> => {
  try {
    const snap = await getDocs(collection(db, `practices/${practiceId}/roles`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PracticeRole);
  } catch (error) {
    console.error('Failed to fetch practice roles:', error);
    return [];
  }
};

/**
 * Fetches all available surgeries within a specific practice.
 * @param practiceId - The unique identifier of the dental practice.
 * @returns A promise resolving to a collection of surgery room data.
 */
export const fetchPracticeSurgeries = async (practiceId: string): Promise<PracticeSurgery[]> => {
  try {
    const snap = await getDocs(collection(db, `practices/${practiceId}/surgeries`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PracticeSurgery);
  } catch (error) {
    console.error('Failed to fetch practice surgeries:', error);
    return [];
  }
};

// --- Data Fetching ---

/**
 * Helper to safely parse a Firestore snapshot into typed Shift objects.
 * Silently ignores documents that fail Zod validation to prevent app crashes.
 * @param snap
 */
const mapShiftSnapshot = (snap: QuerySnapshot<DocumentData, DocumentData>): Shift[] => {
  return snap.docs
    .map((d) => {
      const data = { id: d.id, ...d.data() };
      const result = ShiftSchema.safeParse(data);
      if (!result.success) {
        console.warn(`Skipping invalid shift document ${d.id}:`, result.error);
        return null;
      }
      return result.data;
    })
    .filter((s): s is Shift => s !== null);
};

/**
 * Retrieves all shifts and applies client-side filtering based on the practice identifier.
 * @param practiceId - The unique identifier of the dental practice.
 * @returns A filtered list of shifts belonging to the practice.
 */
export const fetchShifts = async (practiceId: string): Promise<Shift[]> => {
  try {
    const snap = await getDocs(collection(db, 'shifts'));
    const allShifts = mapShiftSnapshot(snap);

    // Client-side filtering: check if the shift's role reference path contains the practice ID.
    return allShifts.filter((s) => s.role_id?.path?.includes(practiceId));
  } catch (error) {
    console.error('Failed to fetch shifts:', error);
    return [];
  }
};

// --- Persistence ---

/**
 * Persists a new shift record to the database with initial draft status.
 * Logic: standardises the date to a Firestore Timestamp.
 * @param shiftData - The raw data representing the new shift.
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
 */
export const deleteShift = async (shiftId: string): Promise<void> => {
  await deleteDoc(doc(db, 'shifts', shiftId));
};
