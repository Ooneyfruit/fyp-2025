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
 */
export const fetchPracticeRoles = async (practiceId: string): Promise<PracticeRole[]> => {
  try {
    const snap = await getDocs(collection(db, `practices/${practiceId}/roles`));
    return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
      id: d.id,
      name: d.data().name as string,
      color_index: d.data().color_index as number | undefined,
      icon_id: d.data().icon_id as string | undefined
    }));
  } catch {
    return [];
  }
};

/**
 * Fetches the list of surgeries (rooms) associated with a specific practice.
 */
export const fetchPracticeSurgeries = async (practiceId: string): Promise<PracticeSurgery[]> => {
  try {
    const snap = await getDocs(collection(db, `practices/${practiceId}/surgeries`));
    return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
      id: d.id,
      name: d.data().name as string,
      is_deleted: !!d.data().is_deleted
    }));
  } catch {
    return [];
  }
};

// --- Data Fetching ---

/**
 * Fetches all shifts and filters them client-side for the given practice.
 */
export const fetchShifts = async (practiceId: string): Promise<Shift[]> => {
  try {
    const snap = await getDocs(collection(db, 'shifts'));
    return snap.docs
      .map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() }) as Shift)
      .filter((s: Shift) => s.role_id?.path?.includes(practiceId));
  } catch {
    return [];
  }
};

// --- Persistence ---

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

export const deleteShift = async (shiftId: string): Promise<void> => {
  await deleteDoc(doc(db, 'shifts', shiftId));
};
