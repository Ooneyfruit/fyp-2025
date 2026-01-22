/**
 * Import Service
 * * Handles the importation of data from a JSON file into the Firestore database.
 * Reconstructs Firestore-specific types (Timestamps, DocumentReferences) from
 * the raw JSON data.
 */
import { initializeApp, credential as _credential, firestore } from 'firebase-admin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Establish the directory name manually since __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize the Firebase Admin SDK to allow privileged database access
initializeApp({
  credential: _credential.applicationDefault(),
  projectId: 'fyp-2025-52340'
});

const db = firestore();

/**
 * Traverses a data object to convert JSON representations back into Firestore types.
 * Recursively handles nested objects but skips strict subcollection structures.
 * * @param {object} data - The raw JSON data object
 * @returns {object} The data object with Firestore types restored
 */
function reviveFirestoreTypes(data) {
  const isTimestamp = (obj) =>
    obj && typeof obj._seconds === 'number' && typeof obj._nanoseconds === 'number';
  const isDocumentReference = (obj) => obj && obj._path && Array.isArray(obj._path.segments);

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      if (value && typeof value === 'object') {
        if (isTimestamp(value)) {
          data[key] = new firestore.Timestamp(value._seconds, value._nanoseconds);
        } else if (isDocumentReference(value)) {
          data[key] = db.doc(value._path.segments.join('/'));
        } else if (key !== '_subcollections') {
          // Continue deep traversal only if this is not a subcollection container
          reviveFirestoreTypes(value);
        }
      }
    }
  }
  return data;
}

/**
 * Reads the export file and writes collections and subcollections to Firestore.
 * This is an async operation that logs progress to the console.
 */
async function importData() {
  // Construct the absolute path to the data file ensuring cross-platform compatibility
  const filePath = join(__dirname, '../../docs/firestore-export-CURRENT.json');

  // Read the file synchronously as we cannot proceed without this data
  const fileContents = readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContents);

  for (const collectionId in data) {
    if (Object.prototype.hasOwnProperty.call(data, collectionId)) {
      const collectionData = data[collectionId];
      console.log(`Processing collection: ${collectionId}`);

      for (const docId in collectionData) {
        if (Object.prototype.hasOwnProperty.call(collectionData, docId)) {
          const docData = { ...collectionData[docId] };
          const docRef = db.collection(collectionId).doc(docId);

          const subcollections = docData._subcollections;
          // Remove the subcollections key so it is not written as a field in the document
          delete docData._subcollections;

          const revivedData = reviveFirestoreTypes(docData);

          try {
            await docRef.set(revivedData);
            console.log(`  Set document: ${collectionId}/${docId}`);
          } catch (error) {
            console.error(`  Error setting document ${collectionId}/${docId}:`, error.message);
          }

          if (subcollections) {
            for (const subcollectionId in subcollections) {
              if (Object.prototype.hasOwnProperty.call(subcollections, subcollectionId)) {
                console.log(`    Processing subcollection: ${subcollectionId}`);
                const subcollectionData = subcollections[subcollectionId];

                for (const subdocumentId in subcollectionData) {
                  if (Object.prototype.hasOwnProperty.call(subcollectionData, subdocumentId)) {
                    const subdocumentData = subcollectionData[subdocumentId];
                    const subdocumentRef = docRef.collection(subcollectionId).doc(subdocumentId);
                    const revivedSubdocumentData = reviveFirestoreTypes(subdocumentData);

                    try {
                      await subdocumentRef.set(revivedSubdocumentData);
                      console.log(
                        `      Set document: ${collectionId}/${docId}/${subcollectionId}/${subdocumentId}`
                      );
                    } catch (error) {
                      console.error(
                        `      Error setting sub-document ${subdocumentId}:`,
                        error.message
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  console.log('Firestore data import complete.');
}

importData().catch(console.error);
