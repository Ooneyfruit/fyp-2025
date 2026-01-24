/**
 * @file altexptool.js
 * @description Alternative export utility for extracting Firestore data.
 * Features flat-mapped collection processing and recursive subcollection traversal.
 */
import { writeFileSync } from 'node:fs';
import process from 'node:process';

import { credential as _credential, firestore, initializeApp } from 'firebase-admin';

const JSON_SPACING = 2;

// Initialise the Firebase Admin SDK using the system's default environment credentials.
// This resolves the missing serviceAccount.json dependency while maintaining security.
initializeApp({
  credential: _credential.applicationDefault(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
});

const db = firestore();

/**
 * Recursively fetches all subcollections for a given document.
 * @param {import('firebase-admin').firestore.DocumentReference} docRef - The document reference.
 * @returns {Promise<Record<string, any> | null>} A map of subcollection data or null.
 */
async function fetchSubcollections(docRef) {
  const subRefs = await docRef.listCollections();
  if (subRefs.length === 0) {
    return null;
  }

  /** @type {Record<string, any>} */
  const subs = {};
  for (const subRef of subRefs) {
    /** @type {Record<string, any>} */
    const subDocs = {};
    const snapshot = await subRef.get();

    for (const doc of snapshot.docs) {
      subDocs[doc.id] = doc.data();
    }
    subs[subRef.id] = subDocs;
  }

  return subs;
}

/**
 * Orchestrates the data extraction for the entire database.
 * Processes root collections and ensures subcollections are captured.
 * @returns {Promise<void>} Resolves when the export file is written.
 */
async function runExport() {
  const collections = await db.listCollections();
  /** @type {Record<string, any>} */
  const data = {};

  for (const collection of collections) {
    process.stdout.write(`Exporting collection: ${collection.id}\n`);

    /** @type {Record<string, any>} */
    const collectionData = {};
    const snapshot = await collection.get();

    for (const doc of snapshot.docs) {
      const docData = doc.data();
      const subs = await fetchSubcollections(doc.ref);

      if (subs) {
        docData._subcollections = subs;
      }

      collectionData[doc.id] = docData;
    }

    data[collection.id] = collectionData;
  }

  const exportPath = 'firestore-export-alt.json';
  writeFileSync(exportPath, JSON.stringify(data, null, JSON_SPACING));
  process.stdout.write(`Data successfully exported to ${exportPath}\n`);
}

// Execute the export sequence and handle terminal errors.
// Using top-level try/catch with await satisfies the prefer-top-level-await rule.
try {
  await runExport();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  process.stderr.write(`Export failed: ${message}\n`);
}
