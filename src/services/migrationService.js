import { ref } from 'vue';
import { db } from './firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';

const logs = ref([]);
const loading = ref(false);

const addLog = (msg) => {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
};

export const runRepair = async () => {
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
