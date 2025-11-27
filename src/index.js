import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
});

const firestore = getFirestore(firebaseApp);
const myEmployee = doc(firestore, 'employee/axyMshjnDhHEq9zNNKH0')
async function updateJob(jobDescription) {
    const docData = {
        job: jobDescription
    }
    setDoc(myEmployee, docData, {merge: true})
        .then(()=>{
            console.log(`Updated employee job to ${docData.job}`);
        })
        .catch((error) => {
            console.log(`There's an error: ${error}`);
        });
}
     
const auth = getAuth(firebaseApp);

onAuthStateChanged(auth, user => {
    if(user !== null)  {
        console.log('Logged in!');
    } else {
        console.log('No user.');
    }
})

document.addEventListener("DOMContentLoaded", () => {
    const upgradeBtn = document.getElementById("upgrade-btn");
    const downgradeBtn = document.getElementById("downgrade-btn");

    upgradeBtn.addEventListener("click", () => {
        updateJob("Code Jockey Level 2.5");
    });

    downgradeBtn.addEventListener("click", () => {
        updateJob("Code Jockey");
    });
});
