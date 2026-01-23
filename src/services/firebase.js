/* src/services/firebase.js */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  //getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';

/**
 * Firebase project configuration.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyA8FOAF73dNCrLlIMB_2pMQXHFSAEXFLEQ',
  authDomain: 'fyp-2025-52340.firebaseapp.com',
  projectId: 'fyp-2025-52340',
  storageBucket: 'fyp-2025-52340.firebasestorage.app',
  messagingSenderId: '402568467170',
  appId: '1:402568467170:web:552f9afd2a38e6a41684bb'
};

const app = initializeApp(firebaseConfig);

/**
 * Initialize Firestore with persistent local caching enabled.
 * This utilizes the indexedDb-based persistent cache to improve load speeds across sessions.
 * Multiple tab management is enabled to synchronize the cache across browser instances.
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
