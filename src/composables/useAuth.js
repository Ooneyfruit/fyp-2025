import { ref, reactive } from 'vue';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export const user = ref(null);
export const isAuthReady = ref(false);
const provider = new GoogleAuthProvider();

window.authDebug = reactive({ uid: null, practice: null, isAdmin: false });

const fetchFullProfile = async (firebaseUser) => {
  if (!firebaseUser) {
    user.value = null;
    isAuthReady.value = true;
    return;
  }

  console.log("Auth: Starting fetch for", firebaseUser.uid);

  try {
    // 1. Get Base Profile
    const userSnap = await getDoc(doc(db, "users", firebaseUser.uid));
    if (!userSnap.exists()) throw new Error("Base profile missing");
    
    const userData = userSnap.data();
    const practiceRef = userData.current_practice;
    console.log("Auth: User current practice set to:", practiceRef.path);

    // 2. Find Membership in intersection collection
    // We use a query instead of a direct ID to avoid ID-mismatch errors
    const q = query(
      collection(db, "practice_users"),
      where("user", "==", doc(db, "users", firebaseUser.uid)),
      where("practice", "==", practiceRef)
    );

    const intersectSnap = await getDocs(q);
    const intersectData = !intersectSnap.empty ? intersectSnap.docs[0].data() : {};

    // 3. Assemble complete user
    user.value = {
      uid: firebaseUser.uid,
      ...userData,
      ...intersectData,
      practiceRef: practiceRef // Essential DocumentReference for UserView
    };

    window.authDebug.uid = firebaseUser.uid;
    window.authDebug.practice = practiceRef.path;
    window.authDebug.isAdmin = intersectData.is_administrator || false;
    
    console.log("Auth: Profile ready. Admin Status:", user.value.is_administrator);
  } catch (e) {
    console.error("Auth Join Failed:", e.message);
  } finally {
    isAuthReady.value = true;
  }
};

onAuthStateChanged(auth, fetchFullProfile);

export function useAuth() {
  return { 
    user, 
    isAuthReady, 
    login: () => signInWithPopup(auth, provider),
    logout: async () => { await signOut(auth); window.location.href = "/login"; }
  };
}