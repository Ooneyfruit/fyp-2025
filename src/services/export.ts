/**
 * @file export.js
 * @description Handles the extraction of data from Firestore into a local JSON format.
 * Extracts all collections and their first-level subcollections for backup purposes.
 */
import { writeFileSync } from 'node:fs';
import process from 'node:process';

import { credential as _credential, firestore, initializeApp } from 'firebase-admin';

const JSON_SPACING = 2;

// Initialise the Firebase Admin SDK to allow privileged database access.
initializeApp({
  credential: _credential.applicationDefault(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
});

const db = firestore();

/**
 * Retrieves all documents within a specific subcollection.
 * @param {import('firebase-admin').firestore.CollectionReference} collectionRef - The subcollection reference.
 * @returns {Promise<Record<string, any>>} A map of document IDs to their data.
 */
async function getSubcollectionData(collectionRef) {
  /** @type {Record<string, any>} */
  const subData = {};
  const snapshot = await collectionRef.get();

  // Iterate over the docs array to satisfy iterator requirements.
  for (const doc of snapshot.docs) {
    subData[doc.id] = doc.data();
  }

  return subData;
}

/**
 * Processes a single document to extract its fields and any nested subcollections.
 * @param {import('firebase-admin').firestore.QueryDocumentSnapshot} doc - The Firestore document snapshot.
 * @returns {Promise<Record<string, any>>} The combined document data and subcollections.
 */
async function getDocumentData(doc) {
  const docData = doc.data();
  const subcollections = await doc.ref.listCollections();

  if (subcollections.length === 0) {
    return docData;
  }

  /** @type {Record<string, any>} */
  const subTrees = {};
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
 * @returns {Promise<void>} Resolves when the export file has been written.
 */
async function exportData() {
  const collections = await db.listCollections();
  /** @type {Record<string, any>} */
  const output = {};

  for (const collection of collections) {
    /** @type {Record<string, any>} */
    const collectionData = {};
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
