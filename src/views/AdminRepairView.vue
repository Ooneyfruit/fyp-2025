<script setup>
/**
 * Admin view for repairing database structure.
 * Converts practice_users documents to a deterministic ID format.
 */
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { ref } from 'vue';

import BaseButton from '@/components/shared/BaseButton.vue';
import { db } from '@/services/firebase';

const logs = ref([]);
const loading = ref(false);

/**
 * Appends a message to the logs.
 * @param msg - The message to log
 */
const addLog = (msg) => {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
};

/**
 * Checks and repairs a single user document.
 * Determines if the document ID matches the required format and adds operations to the batch.
 * @param d - The document snapshot to process
 * @param batch - The write batch to populate
 * @returns True if the document was repaired, false otherwise
 */
const repairDocument = (d, batch) => {
  const data = d.data();
  // Ensure we have the necessary data to construct the ID.
  const userId = data.user?.id;
  const practiceId = data.practice?.id;

  if (!userId || !practiceId) {
    addLog(`SKIPPING: Document ${d.id} lacks valid ID fields.`);
    return false;
  }

  const correctId = `${userId}_${practiceId}`;

  if (d.id === correctId) {
    addLog(`Document ${d.id} is already correct.`);
    return false;
  }

  addLog(`Fixing: ${d.id} -> ${correctId}`);

  // Create the new document with the deterministic ID.
  const newRef = doc(db, 'practice_users', correctId);
  batch.set(
    newRef,
    {
      ...data,
      updated_at: new Date()
    },
    { merge: true }
  );

  // Delete the old document with the random ID.
  batch.delete(d.ref);

  return true;
};

/**
 * Iterates through the snapshots and populates the batch with repair operations.
 * @param snap - The snapshot of documents to process
 * @param batch - The write batch to populate
 * @returns The count of documents migrated
 */
const processSnapshots = (snap, batch) => {
  let count = 0;
  for (const d of snap.docs) {
    if (repairDocument(d, batch)) {
      count++;
    }
  }
  return count;
};

/**
 * Handles errors occurring during the repair process.
 * @param error - The caught error object
 */
const handleError = (error) => {
  if (error instanceof Error) {
    addLog(`ERROR: ${error.message}`);
  } else {
    addLog('ERROR: An unknown error occurred.');
  }
};

/**
 * Executes the repair process for practice users.
 * Orchestrates the fetching, processing, and committing of database changes.
 */
const runRepair = async () => {
  loading.value = true;
  logs.value = [];
  addLog('Starting repair process...');

  try {
    const snap = await getDocs(collection(db, 'practice_users'));
    const batch = writeBatch(db);

    const migratedCount = processSnapshots(snap, batch);

    if (migratedCount > 0) {
      await batch.commit();
      addLog(`SUCCESS: Repaired ${migratedCount} records.`);
    } else {
      addLog('All records were already in the correct format.');
    }
  } catch (error) {
    handleError(error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div style="font-family: sans-serif; margin: 0 auto; max-width: 600px; padding: 2rem">
    <h1 style="color: #2563eb">Database Structure Repair</h1>
    <p>
      This utility will convert all <code>practice_users</code> documents to the required
      deterministic ID format: <code>{userId}_{practiceId}</code>.
    </p>

    <div style="background: #f1f5f9; border-radius: 8px; margin-bottom: 1rem; padding: 1rem">
      <h3 style="margin-top: 0">Logs:</h3>
      <pre style="font-size: 0.8rem; white-space: pre-wrap">{{
        logs.join('\n') || 'Waiting to start...'
      }}</pre>
    </div>

    <BaseButton
      :label="loading ? 'Processing...' : 'Run Repair Now'"
      :processing="loading"
      @click="runRepair"
    />
  </div>
</template>
