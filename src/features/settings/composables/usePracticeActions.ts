/**
 * Encapsulates write operations for practice configuration.
 */
import {
  addDoc,
  collection,
  deleteField,
  doc,
  type DocumentReference,
  getDocs,
  query,
  type QueryDocumentSnapshot,
  setDoc,
  updateDoc,
  where,
  type WriteBatch,
  writeBatch
} from 'firebase/firestore';

import { type AuthInterface, useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import {
  type PracticeDetails,
  type PracticeRoleConfig,
  type SurgeryConfig
} from '@/features/settings/settingsTypes';
import { db } from '@/services/firebase';

// --- Helpers (Module Scope) ---

const getPracticeRef = (user: AuthInterface['user']): DocumentReference => {
  if (!user.value?.practiceRef) throw new Error('No active practice found');
  return user.value.practiceRef;
};

const buildStaffMap = (docs: QueryDocumentSnapshot[]): Map<string, string> => {
  const map = new Map<string, string>();
  for (const d of docs) {
    const data = d.data();
    if (data?.role_id) {
      const ref = data.role_id as DocumentReference;
      map.set(ref.id, d.id);
    }
  }
  return map;
};

const syncStaffForSurgery = async (
  pRef: DocumentReference,
  surgeryId: string,
  surgeryName: string,
  staffCounts: Record<string, number>,
  allRoles: PracticeRoleConfig[]
): Promise<WriteBatch> => {
  const batch = writeBatch(db);
  const staffCol = collection(pRef, 'minimum_operating_staff');
  const surgeryRef = doc(pRef, 'surgeries', surgeryId);

  const q = query(staffCol, where('surgery_id', '==', surgeryRef));
  const snap = await getDocs(q);
  const existingMap = buildStaffMap(snap.docs);

  for (const [roleId, count] of Object.entries(staffCounts)) {
    const existingId = existingMap.get(roleId);
    const roleConfig = allRoles.find((r) => r.id === roleId);
    const roleName = roleConfig?.name || 'Unknown';

    if (existingId) {
      if (count > 0) {
        batch.update(doc(staffCol, existingId), {
          staff_count: count,
          role_name: roleName,
          surgery_name: surgeryName
        });
      } else {
        batch.delete(doc(staffCol, existingId));
      }
    } else if (count > 0) {
      batch.set(doc(staffCol), {
        surgery_id: surgeryRef,
        surgery_name: surgeryName,
        role_id: doc(pRef, 'roles', roleId),
        role_name: roleName,
        staff_count: count
      });
    }
  }
  return batch;
};

const executeSaveSurgery = async (
  pRef: DocumentReference,
  surgery: SurgeryConfig,
  staffCounts: Record<string, number>,
  allRoles: PracticeRoleConfig[]
) => {
  const surgeriesCol = collection(pRef, 'surgeries');
  const docRef = surgery.id ? doc(surgeriesCol, surgery.id) : doc(surgeriesCol);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...data } = surgery;

  await setDoc(docRef, data, { merge: true });
  const batch = await syncStaffForSurgery(pRef, docRef.id, surgery.name, staffCounts, allRoles);
  await batch.commit();
};

const executeSaveRole = async (pRef: DocumentReference, role: PracticeRoleConfig) => {
  const col = collection(pRef, 'roles');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...data } = role;

  const payload: Record<string, unknown> = { ...data };

  if (payload.color_index === undefined || payload.color_index === null) {
    if (role.id) {
      payload.color_index = deleteField();
    } else {
      delete payload.color_index;
    }
  }

  if (role.id) {
    await updateDoc(doc(col, role.id), payload);
    return 'updated';
  } else {
    await addDoc(col, payload);
    return 'created';
  }
};

const executeToggleArchive = async (pRef: DocumentReference, id: string, state: boolean) => {
  await updateDoc(doc(pRef, 'surgeries', id), { is_deleted: state });
};

// --- Composable ---

export function usePracticeActions() {
  const { user } = useAuth();
  const { success, error: notifyError } = useToast();

  const updateDetails = async (details: PracticeDetails) => {
    try {
      await updateDoc(getPracticeRef(user), { ...details });
      success('Practice details updated.');
    } catch {
      notifyError('Failed to update details.');
    }
  };

  const saveRole = async (role: PracticeRoleConfig) => {
    try {
      const action = await executeSaveRole(getPracticeRef(user), role);
      success(`Role ${action}.`);
    } catch {
      notifyError('Failed to save role.');
    }
  };

  const saveSurgery = async (
    surgery: SurgeryConfig,
    staffCounts: Record<string, number>,
    allRoles: PracticeRoleConfig[]
  ) => {
    try {
      await executeSaveSurgery(getPracticeRef(user), surgery, staffCounts, allRoles);
      success('Surgery saved.');
    } catch {
      notifyError('Failed to save surgery.');
    }
  };

  const toggleSurgeryArchive = async (id: string, isDeleted: boolean) => {
    try {
      await executeToggleArchive(getPracticeRef(user), id, isDeleted);
      success(isDeleted ? 'Surgery archived.' : 'Surgery restored.');
    } catch {
      notifyError('Failed to update surgery status.');
    }
  };

  return { updateDetails, saveRole, saveSurgery, toggleSurgeryArchive };
}
