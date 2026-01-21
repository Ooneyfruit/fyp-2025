/**
 * Shared logic for retrieving practices associated with the current user.
 * Uses the id prefix method to ensure all user associations are captured correctly.
 */
import { ref, watch } from 'vue';
import { db } from '../../../services/firebase';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc, 
  orderBy, 
  startAt, 
  endAt,
  documentId 
} from 'firebase/firestore';
import { useAuth } from '../../../composables/useAuth';
import { useToast } from '../../../composables/useToast';

export function useUserPractices() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const practices = ref([]);
  const isLoading = ref(false);

  /**
   * Fetches all practice metadata using the deterministic id prefix method.
   * Scans the practice_users collection for ids starting with the user's uid.
   */
  const loadPractices = async () => {
    if (!user.value?.uid) return;
    
    isLoading.value = true;
    const uid = user.value.uid;

    try {
      // Logic: querying for document ids that begin with the user's unique identifier.
      const q = query(
        collection(db, "practice_users"),
        orderBy(documentId()),
        startAt(uid),
        endAt(uid + "\uf8ff")
      );
      
      const snap = await getDocs(q);
      
      const practicePromises = snap.docs.map(async (mDoc) => {
        const pRef = mDoc.data().practice;
        const pSnap = await getDoc(pRef);
        return pSnap.exists() ? { id: pSnap.id, ...pSnap.data() } : null;
      });

      const results = await Promise.all(practicePromises);
      
      // Sort the resolved practices alphabetically by clinic name.
      practices.value = results
        .filter(p => p !== null)
        .sort((a, b) => a.name.localeCompare(b.name));
        
    } catch (err) {
      console.error("[useUserPractices] Practice retrieval failed:", err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Updates the current active practice context in the user's global profile.
   * @param {string} practiceId - the id of the practice to switch to.
   */
  const handleSwitch = async (practiceId) => {
    if (!practiceId || practiceId === user.value.practiceRef?.id) return;

    const selected = practices.value.find(p => p.id === practiceId);
    try {
      await updateDoc(doc(db, "users", user.value.uid), { 
        current_practice: doc(db, "practices", practiceId) 
      });
      showToast(`Switched to ${selected?.name || 'new practice'}.`);
    } catch (err) {
      console.error("[useUserPractices] Switch failed:", err);
      showToast("Failed to switch practice.");
    }
  };

  // Synchronize practices whenever the user identity changes.
  watch(() => user.value?.uid, (uid) => {
    if (uid) loadPractices();
  }, { immediate: true });

  return { practices, isLoading, handleSwitch };
}