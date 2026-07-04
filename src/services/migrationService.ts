/**
 * Service for handling Firestore database migrations and repairs.
 *
 * This service provides utilities to iterate through Firestore collections
 * and apply necessary data transformations. It is currently configured to
 * handle a specific migration for `practice_users` documents, converting
 * random auto-generated IDs to deterministic IDs based on the user and practice IDs.
 * The service maintains reactive logs and loading states to be consumed by UI components.
 */

import {
  collection,
  doc,
  type DocumentData,
  getDocs,
  type QueryDocumentSnapshot,
  type WriteBatch,
  writeBatch
} from 'firebase/firestore';
import { type Ref, ref } from 'vue';

import { db } from './firebase';

/**
 * Reactive list of log messages.
 * Shared state that can be imported by components.
 */
export const logs: Ref<string[]> = ref([]);

/**
 * Reactive loading state.
 */
export const loading = ref(false);

/**
 * Appends a message to the logs with a timestamp.
 * @param msg - The message to record.
 */
const addLog = (msg: string) => {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
};

/**
 * Processes a single document for migration.
 * Determines if the document needs to be moved to a deterministic ID.
 * @param d - The document snapshot.
 * @param batch - The Firestore write batch.
 * @returns - True if the document was migrated (added to batch), false otherwise.
 */
const processDocument = (d: QueryDocumentSnapshot<DocumentData>, batch: WriteBatch) => {
  const data = d.data();

  // Safely access IDs with optional chaining
  const userId = data.user?.id;
  const practiceId = data.practice?.id;

  if (!userId || !practiceId) {
    addLog(`SKIPPING: Document ${d.id} missing user or practice ID.`);
    return false;
  }

  const correctId = `${userId}_${practiceId}`;

  if (d.id === correctId) {
    addLog(`Document ${d.id} is already correct.`);
    return false;
  }

  addLog(`Fixing: ${d.id} -> ${correctId}`);

  // Create the new document with the deterministic ID
  const newRef = doc(db, 'practice_users', correctId);

  // Use batch.set to create or overwrite the new document
  batch.set(
    newRef,
    {
      ...data,
      updated_at: new Date()
    },
    { merge: true }
  );

  // Delete the old document with the random ID
  batch.delete(d.ref);

  return true;
};

/**
 * Executes the database repair migration.
 * Converts practice_users documents to deterministic IDs.
 * @returns Promise that resolves when repair is complete.
 */
export const runRepair = async () => {
  loading.value = true;
  logs.value = [];
  addLog('Starting repair process...');

  try {
    const snap = await getDocs(collection(db, 'practice_users'));
    const batch = writeBatch(db);
    let migratedCount = 0;

    // Iterate through the document snapshots array
    for (const d of snap.docs) {
      if (processDocument(d, batch)) {
        migratedCount++;
      }
    }

    if (migratedCount > 0) {
      // Commit all changes atomically
      await batch.commit();
      addLog(`SUCCESS: Repaired ${migratedCount} records.`);
    } else {
      addLog('All records were already in the correct format.');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    addLog(`ERROR: ${message}`);
  } finally {
    loading.value = false;
  }
};
