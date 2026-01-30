/**
 * Alternative export utility for extracting Firestore data.
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
  projectId: 'fyp-2025-52340'
});

const db = firestore();

/**
 * Recursively fetches all subcollections for a given document.
 * @param docRef - The document reference.
 * @returns A map of subcollection data or null.
 */
async function fetchSubcollections(
  docRef: firestore.DocumentReference
): Promise<Record<string, Record<string, firestore.DocumentData>> | null> {
  const subRefs = await docRef.listCollections();
  if (subRefs.length === 0) {
    return null;
  }

  const subs: Record<string, Record<string, firestore.DocumentData>> = {};
  for (const subRef of subRefs) {
    const subDocs: Record<string, firestore.DocumentData> = {};
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
 * @returns Resolves when the export file is written.
 */
async function runExport(): Promise<void> {
  const collections = await db.listCollections();
  const data: Record<string, Record<string, firestore.DocumentData>> = {};

  for (const collection of collections) {
    process.stdout.write(`Exporting collection: ${collection.id}\n`);

    const collectionData: Record<string, firestore.DocumentData> = {};
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
