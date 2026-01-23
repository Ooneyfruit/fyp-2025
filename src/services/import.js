/**
 * @file import.js
 * @description Handles the importation of data from a JSON file into the Firestore database.
 * Reconstructs Firestore-specific types (Timestamps, DocumentReferences) from the raw JSON data.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { credential as _credential, firestore, initializeApp } from 'firebase-admin';

// Establish the directory name manually since __dirname is not available in ES modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialise the Firebase Admin SDK to allow privileged database access.
initializeApp({
  credential: _credential.applicationDefault(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
});

const db = firestore();

/**
 * Checks if an object structure matches a Firestore Timestamp.
 * Verifies the presence of internal seconds and nanoseconds properties.
 * @param {any} obj - The object to check.
 * @returns {boolean} True if the object is a timestamp.
 */
function isTimestamp(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj._seconds === 'number' &&
    typeof obj._nanoseconds === 'number'
  );
}

/**
 * Checks if an object structure matches a Firestore DocumentReference.
 * Evaluates the path structure and segments array.
 * @param {any} obj - The object to check.
 * @returns {boolean} True if the object is a reference.
 */
function isDocumentReference(obj) {
  return obj && typeof obj === 'object' && obj._path && Array.isArray(obj._path.segments);
}

/**
 * Processes a single value to determine if it needs Firestore type revival.
 * Converts serialised JSON structures back into native Firestore object instances.
 * @param {string} key - The current key being processed.
 * @param {any} value - The value to check and potentially convert.
 * @returns {any} The original value, a revived Firestore object, or a recursed object.
 */
function processValue(key, value) {
  // Skip nulls or non-objects immediately.
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (isTimestamp(value)) {
    return new firestore.Timestamp(value._seconds, value._nanoseconds);
  }

  if (isDocumentReference(value)) {
    return db.doc(value._path.segments.join('/'));
  }

  if (key !== '_subcollections') {
    // Continue deep traversal only if this is not a subcollection container.
    return reviveFirestoreTypes(value);
  }

  return value;
}

/**
 * Traverses a data object to convert JSON representations back into Firestore types.
 * Recursively handles nested objects but skips strict subcollection structures.
 * @param {Record<string, any>} data - The raw JSON data object.
 * @returns {Record<string, any>} The data object with Firestore types restored.
 */
function reviveFirestoreTypes(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  for (const [key, value] of Object.entries(data)) {
    data[key] = processValue(key, value);
  }

  return data;
}

/**
 * Writes a single document to Firestore and logs the action to stdout.
 * @param {string} docPath - The full document path.
 * @param {Record<string, any>} data - The document data.
 * @returns {Promise<void>} Resolves when the write is complete.
 */
async function setDocument(docPath, data) {
  try {
    await db.doc(docPath).set(data);
    process.stdout.write(`  Set document: ${docPath}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    process.stderr.write(`  Error setting document ${docPath}: ${message}\n`);
  }
}

/**
 * Processes a subcollection and its documents recursively.
 * @param {string} parentPath - The path of the parent document.
 * @param {string} subcollectionId - The ID of the subcollection.
 * @param {Record<string, any>} subcollectionData - Map of document IDs to data.
 * @returns {Promise<void>} Resolves when subcollection is processed.
 */
async function processSubcollection(parentPath, subcollectionId, subcollectionData) {
  process.stdout.write(`    Processing subcollection: ${subcollectionId}\n`);

  for (const [docId, rawData] of Object.entries(subcollectionData)) {
    const data = reviveFirestoreTypes({ ...rawData });
    const fullPath = `${parentPath}/${subcollectionId}/${docId}`;
    await setDocument(fullPath, data);
  }
}

/**
 * Processes a single document, including its fields and subcollections.
 * @param {string} collectionId - The parent collection ID.
 * @param {string} docId - The document ID.
 * @param {Record<string, any>} rawData - The raw JSON data for the document.
 * @returns {Promise<void>} Resolves when document and children are processed.
 */
async function processDocument(collectionId, docId, rawData) {
  const docData = { ...rawData };
  const subcollections = docData._subcollections;

  // Remove the subcollections key so it is not written as a field in the document.
  delete docData._subcollections;

  const revivedData = reviveFirestoreTypes(docData);
  const docPath = `${collectionId}/${docId}`;

  await setDocument(docPath, revivedData);

  if (subcollections && typeof subcollections === 'object') {
    for (const [subId, subData] of Object.entries(subcollections)) {
      await processSubcollection(docPath, subId, subData);
    }
  }
}

/**
 * Iterates through all documents in a collection.
 * @param {string} collectionId - The collection ID.
 * @param {Record<string, any>} collectionData - Map of document IDs to data.
 * @returns {Promise<void>} Resolves when the collection is processed.
 */
async function processCollection(collectionId, collectionData) {
  process.stdout.write(`Processing collection: ${collectionId}\n`);

  for (const [docId, docData] of Object.entries(collectionData)) {
    await processDocument(collectionId, docId, docData);
  }
}

/**
 * Reads the export file and writes collections and subcollections to Firestore.
 * This is an async operation that manages the primary execution loop.
 * @returns {Promise<void>} Resolves when the entire import is complete.
 */
async function importData() {
  // Construct the absolute path to the data file ensuring cross-platform compatibility.
  const filePath = path.join(__dirname, '../../docs/firestore-export-CURRENT.json');

  // Read the file synchronously as we cannot proceed without this data.
  const fileContents = readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContents);

  for (const [collectionId, collectionData] of Object.entries(data)) {
    await processCollection(collectionId, collectionData);
  }

  process.stdout.write('Firestore data import complete.\n');
}

// Execute the import sequence and handle terminal errors.
try {
  await importData();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  process.stderr.write(`${message}\n`);
}
