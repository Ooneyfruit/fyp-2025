
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

// Function to convert plain JS objects to Firestore specific types
function reviveFirestoreTypes(data) {
  const isTimestamp = (obj) => obj && typeof obj._seconds === 'number' && typeof obj._nanoseconds === 'number';
  const isDocumentReference = (obj) => obj && obj._path && Array.isArray(obj._path.segments);

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      if (value && typeof value === 'object') {
        if (isTimestamp(value)) {
          data[key] = new admin.firestore.Timestamp(value._seconds, value._nanoseconds);
        } else if (isDocumentReference(value)) {
          data[key] = db.doc(value._path.segments.join('/'));
        } else if (key !== '_subcollections') { // Don't recurse into subcollections object itself
          reviveFirestoreTypes(value);
        }
      }
    }
  }
  return data;
}


async function importData() {
  const filePath = path.join(__dirname, 'firestore-export.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContents);

  for (const collectionId in data) {
    if (data.hasOwnProperty(collectionId)) {
      const collectionData = data[collectionId];
      console.log(`Processing collection: ${collectionId}`);
      for (const docId in collectionData) {
        if (collectionData.hasOwnProperty(docId)) {
          const docData = { ...collectionData[docId] };
          const docRef = db.collection(collectionId).doc(docId);

          const subcollections = docData._subcollections;
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
              if (subcollections.hasOwnProperty(subcollectionId)) {
                console.log(`    Processing subcollection: ${subcollectionId}`);
                const subcollectionData = subcollections[subcollectionId];
                for (const subdocId in subcollectionData) {
                  if (subcollectionData.hasOwnProperty(subdocId)) {
                    const subdocData = subcollectionData[subdocId];
                    const subdocRef = docRef.collection(subcollectionId).doc(subdocId);
                    const revivedSubdocData = reviveFirestoreTypes(subdocData);
                    try {
                        await subdocRef.set(revivedSubdocData);
                        console.log(`      Set document: ${collectionId}/${docId}/${subcollectionId}/${subdocId}`);
                    } catch(error) {
                        console.error(`      Error setting sub-document ${subdocId}:`, error.message);
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
