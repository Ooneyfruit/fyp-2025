<template>
  <div style="padding: 2rem; max-width: 600px; margin: 0 auto; font-family: sans-serif">
    <h1 style="color: #2563eb">Database Structure Repair</h1>
    <p>
      This utility will convert all <code>practice_users</code> documents to the required
      deterministic ID format: <code>{userId}_{practiceId}</code>.
    </p>

    <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem">
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

<script setup>
import { ref } from 'vue';
import { db } from '../services/firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';

import BaseButton from '../components/shared/BaseButton.vue';

const logs = ref([]);
const loading = ref(false);

const addLog = (msg) => {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
};

const runRepair = async () => {
  loading.value = true;
  logs.value = [];
  addLog('Starting repair process...');

  try {
    const snap = await getDocs(collection(db, 'practice_users'));
    const batch = writeBatch(db);
    let migratedCount = 0;
    //let deletedCount = 0;

    snap.forEach((d) => {
      const data = d.data();
      // Correctly access IDs from the DocumentReference objects
      const userId = data.user.id;
      const practiceId = data.practice.id;
      const correctId = `${userId}_${practiceId}`;

      if (d.id !== correctId) {
        addLog(`Fixing: ${d.id} -> ${correctId}`);

        // 1. Create the new document with the deterministic ID
        const newRef = doc(db, 'practice_users', correctId);
        batch.set(
          newRef,
          {
            ...data,
            updated_at: new Date()
          },
          { merge: true }
        );

        // 2. Delete the old document with the random ID
        batch.delete(d.ref);

        migratedCount++;
      } else {
        addLog(`Document ${d.id} is already correct.`);
      }
    });

    if (migratedCount > 0) {
      await batch.commit();
      addLog(`SUCCESS: Repaired ${migratedCount} records.`);
    } else {
      addLog('All records were already in the correct format.');
    }
  } catch (err) {
    addLog(`ERROR: ${err.message}`);
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>
