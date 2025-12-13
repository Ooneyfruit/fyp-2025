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
const auth = firebase.auth();

const worldElement = document.getElementById('world');
const newWorldInput = document.getElementById('new-world');
const updateWorldButton = document.getElementById('update-world');

// Login/Logout elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login');
const logoutButton = document.getElementById('logout');
const authStatus = document.getElementById('auth-status');

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

// Login user
loginButton.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in 
      console.log('User signed in:', userCredential.user);
    })
    .catch((error) => {
      console.error('Login error:', error);
      authStatus.textContent = `Error: ${error.message}`;
    });
});

// Logout user
logoutButton.addEventListener('click', () => {
  auth.signOut().then(() => {
    // Sign-out successful.
    console.log('User signed out');
  }).catch((error) => {
    console.error('Logout error:', error);
  });
});

// Auth state listener
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in.
    authStatus.textContent = `Logged in as: ${user.email} (UID: ${user.uid})`;
    console.log('Your UID is:', user.uid);
  } else {
    // User is signed out.
    authStatus.textContent = 'Logged out';
  }
});
