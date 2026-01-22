import { initializeApp, credential as _credential, firestore } from 'firebase-admin';
import { writeFileSync } from 'fs';

initializeApp({
  credential: _credential.applicationDefault(),
  projectId: 'fyp-2025-52340'
});

const db = firestore();
const data = {};

async function exportData() {
  const collections = await db.listCollections();
  for (const collection of collections) {
    const collectionId = collection.id;
    data[collectionId] = {};
    const documents = await collection.get();
    for (const doc of documents.docs) {
      const docData = doc.data();
      data[collectionId][doc.id] = docData;
      const subcollections = await doc.ref.listCollections();
      if (subcollections.length > 0) {
        data[collectionId][doc.id]._subcollections = {};
        for (const subcollection of subcollections) {
          const subcollectionId = subcollection.id;
          data[collectionId][doc.id]._subcollections[subcollectionId] = {};
          const subdocuments = await subcollection.get();
          subdocuments.forEach((subdocument) => {
            data[collectionId][doc.id]._subcollections[subcollectionId][subdocument.id] =
              subdocument.data();
          });
        }
      }
    }
  }
  writeFileSync('firestore-export.json', JSON.stringify(data, null, 2));
  console.log('Firestore data exported to firestore-export.json');
}

exportData().catch(console.error);
