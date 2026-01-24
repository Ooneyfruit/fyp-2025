/**
 * Rota data access layer.
 * Primary responsibility: provides an abstraction for Firestore operations related to
 * practices, surgeries, and staff shifts.
 * Standardised to camelCase naming to resolve filesystem casing conflicts.
 */
import { addDoc, collection, deleteDoc, doc, getDocs, Timestamp } from 'firebase/firestore';

import { db } from '@/services/firebase';

/**
 * id - The unique identifier for the role.
 * name - Display name of the professional role.
 */

/**
 * id - The unique identifier for the surgery room.
 * name - Display name or number of the surgery.
 */

/**
 * id - The unique identifier for the shift.
 * [role_id] - Reference to the associated role.
 * [surgery_id] - Reference to the surgery room.
 * [user_id] - Identifier of the assigned staff member.
 * [user_name] - Name of the assigned staff member.
 * [role_name] - Name of the assigned professional role.
 * [surgery_name] - Name of the surgery room.
 * [date] - The scheduled date for the shift (Timestamp or ISO string).
 */

/**
 * [date] - The raw date input for the shift.
 * [role_id] - Reference to the role.
 * [surgery_id] - Reference to the surgery room.
 * [user_id] - Identifier for the assigned staff member.
 * [user_name] - Name of the assigned staff member.
 * [role_name] - Display name of the role.
 * [surgery_name] - Display name of the surgery room.
 */

// --- Configuration Fetching ---

/**
 * Fetches all professional roles configured for a specific practice.
 * @param practiceId - The unique identifier of the dental practice.
 * @returns A collection of practice roles.
 */
export const fetchPracticeRoles = async (practiceId) => {
  try {
    const snap = await getDocs(collection(db, `practices/${practiceId}/roles`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
};

/**
 * Fetches all available surgeries within a specific practice.
 * @param practiceId - The unique identifier of the dental practice.
 * @returns A collection of surgery room data.
 */
export const fetchPracticeSurgeries = async (practiceId) => {
  try {
    const snap = await getDocs(collection(db, `practices/${practiceId}/surgeries`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
export const fetchShifts = async (practiceId) => {
  try {
    const snap = await getDocs(collection(db, 'shifts'));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
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
 * @returns
 */
export const createShift = async (shiftData) => {
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
 * @returns
 */
export const deleteShift = async (shiftId) => {
  await deleteDoc(doc(db, 'shifts', shiftId));
};
