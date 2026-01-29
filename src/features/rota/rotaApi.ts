/**
 * Service module for managing rota data, including fetching practice
 * resources and persisting shift operations to Firestore.
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

import { db } from '@/services/firebase';

import type { PracticeRole, PracticeSurgery, Shift, ShiftInput } from './rotaTypes';

// --- Configuration Fetching ---

/**
 * Fetches the list of roles associated with a specific practice.
 * @param practiceId - The ID of the practice to fetch roles for.
 * @returns A promise resolving to an array of practice roles.
 */
export const fetchPracticeRoles = async (practiceId: string): Promise<PracticeRole[]> => {
  try {
    const snap = await getDocs(collection(db, `practices/${practiceId}/roles`));
    return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
      id: d.id,
      name: d.data().name as string
    }));
  } catch {
    return [];
  }
};

/**
 * Fetches the list of surgeries (rooms) associated with a specific practice.
 * @param practiceId - The ID of the practice to fetch surgeries for.
 * @returns A promise resolving to an array of practice surgeries.
 */
export const fetchPracticeSurgeries = async (practiceId: string): Promise<PracticeSurgery[]> => {
  try {
    const snap = await getDocs(collection(db, `practices/${practiceId}/surgeries`));
    return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
      id: d.id,
      name: d.data().name as string
    }));
  } catch {
    return [];
  }
};

// --- Data Fetching ---

/**
 * Fetches all shifts and filters them client-side for the given practice.
 * @param practiceId - The ID of the practice to filter shifts for.
 * @returns A promise resolving to an array of shifts.
 */
export const fetchShifts = async (practiceId: string): Promise<Shift[]> => {
  try {
    const snap = await getDocs(collection(db, 'shifts'));
    // Prototype: Client-side filtering by path reference string.
    return snap.docs
      .map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() }) as Shift)
      .filter((s: Shift) => s.role_id?.path?.includes(practiceId));
  } catch {
    return [];
  }
};

// Note: Staff fetching is now handled by usePracticeUsers composable.

// --- Persistence ---

/**
 * Creates a new shift document in the database.
 * @param shiftData - The data for the new shift.
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
 * Deletes a shift document from the database.
 * @param shiftId - The unique identifier of the shift to delete.
 * @returns A promise that resolves when the operation is complete.
 */
export const deleteShift = async (shiftId: string): Promise<void> => {
  await deleteDoc(doc(db, 'shifts', shiftId));
};
