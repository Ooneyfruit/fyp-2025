/**
 * Rota data access layer.
 * Primary responsibility: provides an abstraction for Firestore operations related to
 * practices, surgeries, and staff shifts.
 * Standardised to camelCase naming to resolve filesystem casing conflicts.
 */
import { addDoc, collection, deleteDoc, doc, getDocs, Timestamp } from 'firebase/firestore';

import { db } from '@/services/firebase';

/**
 * @typedef {object} PracticeRole
 * @property {string} id - The unique identifier for the role.
 * @property {string} name - Display name of the professional role.
 */

/**
 * @typedef {object} PracticeSurgery
 * @property {string} id - The unique identifier for the surgery room.
 * @property {string} name - Display name or number of the surgery.
 */

/**
 * @typedef {object} Shift
 * @property {string} id - The unique identifier for the shift.
 * @property {import('firebase/firestore').DocumentReference} [role_id] - Reference to the associated role.
 * @property {import('firebase/firestore').DocumentReference} [surgery_id] - Reference to the surgery room.
 * @property {string} [user_id] - Identifier of the assigned staff member.
 * @property {string} [user_name] - Name of the assigned staff member.
 * @property {string} [role_name] - Name of the assigned professional role.
 * @property {string} [surgery_name] - Name of the surgery room.
 * @property {any} [date] - The scheduled date for the shift (Timestamp or ISO string).
 */

/**
 * @typedef {object} ShiftData
 * @property {string | Timestamp | Date} [date] - The raw date input for the shift.
 * @property {import('firebase/firestore').DocumentReference} [role_id] - Reference to the role.
 * @property {import('firebase/firestore').DocumentReference} [surgery_id] - Reference to the surgery room.
 * @property {string} [user_id] - Identifier for the assigned staff member.
 * @property {string} [user_name] - Name of the assigned staff member.
 * @property {string} [role_name] - Display name of the role.
 * @property {string} [surgery_name] - Display name of the surgery room.
 */

// --- Configuration Fetching ---

/**
 * Fetches all professional roles configured for a specific practice.
 * @param {string} practiceId - The unique identifier of the dental practice.
 * @returns {Promise<PracticeRole[]>} A collection of practice roles.
 */
export const fetchPracticeRoles = async (practiceId) => {
  try {
    const snap = await getDocs(collection(db, `practices/${practiceId}/roles`));
    return snap.docs.map((d) => /** @type {PracticeRole} */ ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
};

/**
 * Fetches all available surgeries within a specific practice.
 * @param {string} practiceId - The unique identifier of the dental practice.
 * @returns {Promise<PracticeSurgery[]>} A collection of surgery room data.
 */
export const fetchPracticeSurgeries = async (practiceId) => {
  try {
    const snap = await getDocs(collection(db, `practices/${practiceId}/surgeries`));
    return snap.docs.map((d) => /** @type {PracticeSurgery} */ ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
};

// --- Data Fetching ---

/**
 * Retrieves all shifts and applies client-side filtering based on the practice identifier.
 * @param {string} practiceId - The unique identifier of the dental practice.
 * @returns {Promise<Shift[]>} A filtered list of shifts belonging to the practice.
 */
export const fetchShifts = async (practiceId) => {
  try {
    const snap = await getDocs(collection(db, 'shifts'));
    return snap.docs
      .map((d) => /** @type {Shift} */ ({ id: d.id, ...d.data() }))
      .filter((s) => s.role_id?.path?.includes(practiceId));
  } catch {
    return [];
  }
};

// --- Persistence ---

/**
 * Persists a new shift record to the database with initial draft status.
 * Logic: standardises the date to a Firestore Timestamp.
 * @param {ShiftData} shiftData - The raw data representing the new shift.
 * @returns {Promise<void>}
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
 * @param {string} shiftId - The unique identifier of the shift to be deleted.
 * @returns {Promise<void>}
 */
export const deleteShift = async (shiftId) => {
  await deleteDoc(doc(db, 'shifts', shiftId));
};
