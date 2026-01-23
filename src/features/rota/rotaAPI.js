import { addDoc, collection, deleteDoc, doc, getDocs, Timestamp } from 'firebase/firestore';

import { db } from '../../services/firebase';

// --- Configuration Fetching ---

export const fetchPracticeRoles = async (practiceId) => {
  try {
    const snap = await getDocs(collection(db, `practices/${practiceId}/roles`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('[RotaAPI] Failed to fetch roles:', error);
    return [];
  }
};

export const fetchPracticeSurgeries = async (practiceId) => {
  try {
    const snap = await getDocs(collection(db, `practices/${practiceId}/surgeries`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('[RotaAPI] Failed to fetch surgeries:', error);
    return [];
  }
};

// --- Data Fetching ---

export const fetchShifts = async (practiceId) => {
  try {
    const snap = await getDocs(collection(db, 'shifts'));
    // Prototype: Client-side filtering by path reference string
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((s) => s.role_id?.path?.includes(practiceId));
  } catch (error) {
    console.error('[RotaAPI] Failed to fetch shifts:', error);
    return [];
  }
};

// Note: Staff fetching is now handled by usePracticeUsers composable

// --- Persistence ---

export const createShift = async (shiftData) => {
  try {
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
  } catch (error) {
    console.error('[RotaAPI] Create failed:', error);
    throw error;
  }
};

export const deleteShift = async (shiftId) => {
  try {
    await deleteDoc(doc(db, 'shifts', shiftId));
  } catch (error) {
    console.error('[RotaAPI] Delete failed:', error);
    throw error;
  }
};
