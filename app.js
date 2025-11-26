// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const worldElement = document.getElementById('world');
const newWorldInput = document.getElementById('new-world');
const updateWorldButton = document.getElementById('update-world');

// Get the initial value of 'world' from Firestore
db.collection('worlds').doc('current').get().then((doc) => {
  if (doc.exists) {
    worldElement.textContent = doc.data().name;
  }
});

// Update the value of 'world' in Firestore
updateWorldButton.addEventListener('click', () => {
  const newWorld = newWorldInput.value;
  if (newWorld) {
    db.collection('worlds').doc('current').set({
      name: newWorld
    }).then(() => {
      worldElement.textContent = newWorld;
      newWorldInput.value = '';
    });
  }
});
