/**
 * Handles the importation of data from a JSON file into the Firestore database.
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

interface JsonTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface JsonDocRef {
  _path: {
    segments: string[];
  };
}

/**
 * Checks if an object structure matches a Firestore Timestamp.
 * Verifies the presence of internal seconds and nanoseconds properties.
 * @param obj - The object to check.
 * @returns True if the object is a timestamp.
 */
function isTimestamp(obj: unknown): obj is JsonTimestamp {
  return (
    !!obj &&
    typeof obj === 'object' &&
    '_seconds' in obj &&
    typeof (obj as JsonTimestamp)._seconds === 'number' &&
    '_nanoseconds' in obj &&
    typeof (obj as JsonTimestamp)._nanoseconds === 'number'
  );
}

/**
 * Checks if an object structure matches a Firestore DocumentReference.
 * Evaluates the path structure and segments array.
 * @param obj - The object to check.
 * @returns True if the object is a reference.
 */
function isDocumentReference(obj: unknown): obj is JsonDocRef {
  return (
    !!obj &&
    typeof obj === 'object' &&
    '_path' in obj &&
    Array.isArray((obj as JsonDocRef)._path?.segments)
  );
}

/**
 * Processes a single value to determine if it needs Firestore type revival.
 * Converts serialised JSON structures back into native Firestore object instances.
 * @param key - The current key being processed.
 * @param value - The value to check and potentially convert.
 * @returns The original value, a revived Firestore object, or a recursed object.
 */
function processValue(key: string, value: unknown): unknown {
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
 * @param data - The raw JSON data object.
 * @returns The data object with Firestore types restored.
 */
function reviveFirestoreTypes(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const typedData = data as Record<string, unknown>;

  for (const [key, value] of Object.entries(typedData)) {
    typedData[key] = processValue(key, value);
  }

  return typedData;
}

/**
 * Writes a single document to Firestore and logs the action to stdout.
 * @param docPath - The full document path.
 * @param data - The document data.
 * @returns Resolves when the write is complete.
 */
async function setDocument(docPath: string, data: firestore.DocumentData) {
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
 * @param parentPath - The path of the parent document.
 * @param subcollectionId - The ID of the subcollection.
 * @param subcollectionData - Map of document IDs to data.
 * @returns Resolves when subcollection is processed.
 */
async function processSubcollection(
  parentPath: string,
  subcollectionId: string,
  subcollectionData: Record<string, unknown>
) {
  process.stdout.write(`    Processing subcollection: ${subcollectionId}\n`);

  for (const [docId, rawData] of Object.entries(subcollectionData)) {
    const data = reviveFirestoreTypes({ ...(rawData as Record<string, unknown>) });
    const fullPath = `${parentPath}/${subcollectionId}/${docId}`;
    await setDocument(fullPath, data as firestore.DocumentData);
  }
}

/**
 * Processes a single document, including its fields and subcollections.
 * @param collectionId - The parent collection ID.
 * @param docId - The document ID.
 * @param rawData - The raw JSON data for the document.
 * @returns Resolves when document and children are processed.
 */
async function processDocument(
  collectionId: string,
  docId: string,
  rawData: Record<string, unknown>
) {
  const docData = { ...rawData };
  const subcollections = docData._subcollections;

  // Remove the subcollections key so it is not written as a field in the document.
  delete docData._subcollections;

  const revivedData = reviveFirestoreTypes(docData);
  const docPath = `${collectionId}/${docId}`;

  await setDocument(docPath, revivedData as firestore.DocumentData);

  if (subcollections && typeof subcollections === 'object') {
    for (const [subId, subData] of Object.entries(subcollections)) {
      await processSubcollection(docPath, subId, subData as Record<string, unknown>);
    }
  }
}

/**
 * Iterates through all documents in a collection.
 * @param collectionId - The collection ID.
 * @param collectionData - Map of document IDs to data.
 * @returns Resolves when the collection is processed.
 */
async function processCollection(collectionId: string, collectionData: Record<string, unknown>) {
  process.stdout.write(`Processing collection: ${collectionId}\n`);

  for (const [docId, docData] of Object.entries(collectionData)) {
    await processDocument(collectionId, docId, docData as Record<string, unknown>);
  }
}

/**
 * Reads the export file and writes collections and subcollections to Firestore.
 * This is an async operation that manages the primary execution loop.
 * @returns Resolves when the entire import is complete.
 */
async function importData() {
  // Construct the absolute path to the data file ensuring cross-platform compatibility.
  const filePath = path.join(__dirname, '../../docs/firestore-export-CURRENT.json');

  // Read the file synchronously as we cannot proceed without this data.
  const fileContents = readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContents);

  for (const [collectionId, collectionData] of Object.entries(data)) {
    await processCollection(collectionId, collectionData as Record<string, unknown>);
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
