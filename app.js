const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: "REMOVED_FIREBASE_PROJECT_ID.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const worldElement = document.getElementById('world');
const newWorldInput = document.getElementById('new-world');
const updateWorldButton = document.getElementById('update-world');

// Listen for real-time updates to the 'world' value in Firestore
db.collection('worlds').doc('current').onSnapshot((doc) => {
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
      newWorldInput.value = '';
    });
  }
});