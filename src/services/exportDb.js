const admin = require('firebase-admin');
const fs = require('fs');

// Path to your service account key file
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportCollection(collectionRef) {
  const snapshot = await collectionRef.get();
  const data = [];

  for (const doc of snapshot.docs) {
    const docData = doc.data();
    const subcollections = await doc.ref.listCollections();
    const subs = {};

    // Recursively fetch subcollections (like roles/surgeries inside practices)
    for (const sub of subcollections) {
      subs[sub.id] = await exportCollection(sub);
    }

    data.push({
      id: doc.id,
      ...docData,
      _subcollections: Object.keys(subs).length > 0 ? subs : undefined
    });
  }
  return data;
}

async function runExport() {
  console.log("Starting full database export...");
  const exportData = {};
  
  try {
    const collections = await db.listCollections();
    
    for (const collection of collections) {
      console.log(`Exporting collection: ${collection.id}...`);
      exportData[collection.id] = await exportCollection(collection);
    }

    fs.writeFileSync('firestore-export.json', JSON.stringify(exportData, null, 2));
    console.log("Success! File saved as firestore-export.json");
  } catch (error) {
    console.error("Export failed:", error);
  }
}

runExport();