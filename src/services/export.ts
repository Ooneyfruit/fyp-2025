/**
 * Handles the extraction of data from Firestore into a local JSON format.
 * Extracts all collections and their first-level subcollections for backup purposes.
 */
import { writeFileSync } from 'node:fs';
import process from 'node:process';

import { credential as _credential, firestore, initializeApp } from 'firebase-admin';

const JSON_SPACING = 2;

// Initialise the Firebase Admin SDK to allow privileged database access.
initializeApp({
  credential: _credential.applicationDefault(),
  projectId: 'fyp-2025-52340'
});

const db = firestore();

/**
 * Retrieves all documents within a specific subcollection.
 * @param collectionRef - The subcollection reference.
 * @returns A map of document IDs to their data.
 */
async function getSubcollectionData(
  collectionRef: firestore.CollectionReference | firestore.Query
): Promise<Record<string, firestore.DocumentData>> {
  const subData: Record<string, firestore.DocumentData> = {};
  const snapshot = await collectionRef.get();

  // Iterate over the docs array to satisfy iterator requirements.
  for (const doc of snapshot.docs) {
    subData[doc.id] = doc.data();
  }

  return subData;
}

/**
 * Processes a single document to extract its fields and any nested subcollections.
 * @param doc - The Firestore document snapshot.
 * @returns The combined document data and subcollections.
 */
async function getDocumentData(
  doc: firestore.QueryDocumentSnapshot
): Promise<firestore.DocumentData> {
  const docData = doc.data();
  const subcollections = await doc.ref.listCollections();

  if (subcollections.length === 0) {
    return docData;
  }

  const subTrees: Record<string, Record<string, firestore.DocumentData>> = {};
  for (const sub of subcollections) {
    subTrees[sub.id] = await getSubcollectionData(sub);
  }

  return {
    ...docData,
    _subcollections: subTrees
  };
}

/**
 * Exports all Firestore collections and subcollections to a local JSON file.
 * Organises data into a hierarchical tree structure compatible with the import service.
 * @returns Resolves when the export file has been written.
 */
async function exportData() {
  const collections = await db.listCollections();
  const output: Record<string, Record<string, firestore.DocumentData>> = {};

  for (const collection of collections) {
    const collectionData: Record<string, firestore.DocumentData> = {};
    const documents = await collection.get();

    for (const doc of documents.docs) {
      collectionData[doc.id] = await getDocumentData(doc);
    }

    output[collection.id] = collectionData;
  }

  writeFileSync('firestore-export.json', JSON.stringify(output, null, JSON_SPACING));
  process.stdout.write('Firestore data exported to firestore-export.json\n');
}

// Execute the export sequence and manage the global promise state.
try {
  await exportData();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  process.stderr.write(`Export failed: ${message}\n`);
}
