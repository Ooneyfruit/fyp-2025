import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA8FOAF73dNCrLlIMB_2pMQXHFSAEXFLEQ",
  authDomain: "fyp-2025-52340.firebaseapp.com",
  projectId: "fyp-2025-52340",
  storageBucket: "fyp-2025-52340.firebasestorage.app",
  messagingSenderId: "402568467170",
  appId: "1:402568467170:web:552f9afd2a38e6a41684bb"
};

const app = initializeApp(firebaseConfig);

// Transport Fix: Standard HTTPS prevents AdBlock "Beacon/Stream" detection
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };