
const admin = require('firebase-admin');
const fs = require('fs');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();
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
            subdocuments.forEach(subdoc => {
                data[collectionId][doc.id]._subcollections[subcollectionId][subdoc.id] = subdoc.data();
            });
        }
      }
    }
  }
  fs.writeFileSync('firestore-export.json', JSON.stringify(data, null, 2));
  console.log('Firestore data exported to firestore-export.json');
}

exportData().catch(console.error);
