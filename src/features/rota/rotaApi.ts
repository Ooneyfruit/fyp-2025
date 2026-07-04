/**
 * Service module for managing rota data, including fetching practice
 * resources and persisting shift operations to Firestore.
 */

import { addDoc, collection, deleteDoc, doc, Timestamp } from 'firebase/firestore';

import { db } from '@/services/firebase';

import type { ShiftInput } from './rotaTypes';

// Persistence

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
