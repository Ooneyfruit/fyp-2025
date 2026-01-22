/**
 * Alternative Export Tool
 * Provides a recursive approach to exporting Firestore data.
 * Useful for deep trees where the standard export might miss nested subcollections.
 */
import { initializeApp, credential as _credential, firestore } from 'firebase-admin';
import { writeFileSync } from 'fs';

// Path to your service account key file.
// Ensure this file exists in the same directory or update the path.
import serviceAccount from './serviceAccount.json';

initializeApp({
  credential: _credential.cert(serviceAccount)
});

const db = firestore();

/**
 * Recursively exports a collection and its nested subcollections.
 * traverses the document tree to capture data at any depth.
 * @param {object} collectionRef - The Firestore collection reference to export.
 * @returns {Promise<Array<object>>} A promise resolving to an array of document objects.
 */
async function exportCollection(collectionRef) {
  const snapshot = await collectionRef.get();
  const data = [];

  for (const doc of snapshot.docs) {
    const docData = doc.data();
    const subcollections = await doc.ref.listCollections();
    const subs = {};

    // Recursively fetch subcollections (like roles/surgeries inside practices).
    for (const sub of subcollections) {
      subs[sub.id] = await exportCollection(sub);
    }

    // Construct the document object, optionally including subcollections.
    data.push({
      id: doc.id,
      ...docData,
      _subcollections: Object.keys(subs).length > 0 ? subs : undefined
    });
  }
  return data;
}

/**
 * Orchestrates the full database export process.
 * Fetches all root collections and writes the result to a JSON file.
 * @returns {Promise<void>} Resolves when the export is complete.
 */
async function runExport() {
  console.log('Starting full database export...');
  const exportData = {};

  try {
    const collections = await db.listCollections();

    for (const collection of collections) {
      console.log(`Exporting collection: ${collection.id}...`);
      exportData[collection.id] = await exportCollection(collection);
    }

    writeFileSync('firestore-export.json', JSON.stringify(exportData, null, 2));
    console.log('Success! File saved as firestore-export.json');
  } catch (error) {
    console.error('Export failed:', error);
  }
}

runExport();
