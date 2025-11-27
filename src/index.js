import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseApp = initializeApp({
  apiKey: "AIzaSyA8FOAF73dNCrLlIMB_2pMQXHFSAEXFLEQ",
  authDomain: "fyp-2025-52340.firebaseapp.com",
  projectId: "fyp-2025-52340",
  storageBucket: "fyp-2025-52340.firebasestorage.app",
  messagingSenderId: "402568467170",
  appId: "1:402568467170:web:552f9afd2a38e6a41684bb"
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
