/**
 * Export Service
 * Handles the extraction of data from Firestore into a local JSON format.
 * Intended for creating backups or snapshots of the current database state.
 */
import { writeFileSync } from 'node:fs';

import { credential as _credential, firestore,initializeApp } from 'firebase-admin';

initializeApp({
  credential: _credential.applicationDefault(),
  projectId: 'fyp-2025-52340'
});

const db = firestore();
const data = {};

/**
 * Exports all Firestore collections and subcollections to a local JSON file.
 * Iterates through root collections, documents, and their subcollections to build
 * a complete hierarchical data tree.
 * @returns {Promise<void>} Resolves when the file has been written.
 */
async function exportData() {
  const collections = await db.listCollections();

  for (const collection of collections) {
    const collectionId = collection.id;
    data[collectionId] = {};

    const documents = await collection.get();

    for (const doc of documents.docs) {
      const docData = doc.data();
      data[collectionId][doc.id] = docData;

      // Check for subcollections at the document level.
      const subcollections = await doc.ref.listCollections();

      if (subcollections.length > 0) {
        data[collectionId][doc.id]._subcollections = {};

        for (const subcollection of subcollections) {
          const subcollectionId = subcollection.id;
          data[collectionId][doc.id]._subcollections[subcollectionId] = {};

          const subdocuments = await subcollection.get();
          for (const subdocument of subdocuments) {
            data[collectionId][doc.id]._subcollections[subcollectionId][subdocument.id] =
              subdocument.data();
          }
        }
      }
    }
  }

  // Write the accumulated data structure to a formatted JSON file.
  writeFileSync('firestore-export.json', JSON.stringify(data, null, 2));
  console.log('Firestore data exported to firestore-export.json');
}

exportData().catch(console.error);
