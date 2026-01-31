/**
 * Encapsulates write operations for practice configuration.
 * Handles updates to the core practice document and sub-collections.
 */
import {
  addDoc,
  collection,
  type CollectionReference,
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

import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import {
  type PracticeDetails,
  type PracticeRoleConfig,
  type SurgeryConfig
} from '@/features/settings/settingsTypes';
import { db } from '@/services/firebase';

interface StaffSyncContext {
  pRef: DocumentReference;
  surgeryId: string;
  surgeryName: string;
  staffCounts: Record<string, number>;
  allRoles: PracticeRoleConfig[];
}

/**
 * Creates a map of Role IDs to existing Firestore Document IDs.
 */
const buildExistingStaffMap = (docs: QueryDocumentSnapshot[]): Map<string, string> => {
  const map = new Map<string, string>();
  for (const d of docs) {
    const ref = d.data().role_id as DocumentReference;
    map.set(ref.id, d.id);
  }
  return map;
};

/**
 * Determines whether to update, create, or delete a staff requirement record.
 */
const queueBatchOperation = (
  batch: WriteBatch,
  staffCol: CollectionReference,
  existingDocId: string | undefined,
  data: {
    count: number;
    surgeryRef: DocumentReference;
    surgeryName: string;
    roleRef: DocumentReference;
    roleName: string;
  }
) => {
  const { count, surgeryRef, surgeryName, roleRef, roleName } = data;

  if (existingDocId) {
    if (count > 0) {
      batch.update(doc(staffCol, existingDocId), {
        staff_count: count,
        role_name: roleName,
        surgery_name: surgeryName
      });
    } else {
      batch.delete(doc(staffCol, existingDocId));
    }
    return;
  }

  if (count > 0) {
    batch.set(doc(staffCol), {
      surgery_id: surgeryRef,
      surgery_name: surgeryName,
      role_id: roleRef,
      role_name: roleName,
      staff_count: count
    });
  }
};

/**
 * Reconciles staff requirements for a surgery within a batch operation.
 */
const syncStaffingRequirements = async (ctx: StaffSyncContext): Promise<WriteBatch> => {
  const { pRef, surgeryId, surgeryName, staffCounts, allRoles } = ctx;

  const batch = writeBatch(db);
  const staffCol = collection(pRef, 'minimum_operating_staff');
  const surgeryRef = doc(pRef, 'surgeries', surgeryId);

  const q = query(staffCol, where('surgery_id', '==', surgeryRef));
  const existingSnap = await getDocs(q);
  const existingMap = buildExistingStaffMap(existingSnap.docs);

  for (const [roleId, count] of Object.entries(staffCounts)) {
    const roleConfig = allRoles.find((r) => r.id === roleId);

    queueBatchOperation(batch, staffCol, existingMap.get(roleId), {
      count,
      surgeryRef,
      surgeryName,
      roleRef: doc(pRef, 'roles', roleId),
      roleName: roleConfig?.name || 'Unknown'
    });
  }

  return batch;
};

/**
 * Standalone handler for updating practice details.
 */
const performDetailsUpdate = async (ref: DocumentReference, details: PracticeDetails) => {
  await updateDoc(ref, { ...details });
};

/**
 * Standalone handler for saving roles. Returns the action taken (created/updated) for the toast.
 */
const performRoleSave = async (pRef: DocumentReference, role: PracticeRoleConfig) => {
  const rolesCol = collection(pRef, 'roles');
  const { id, ...roleData } = role;

  if (id) {
    await updateDoc(doc(rolesCol, id), roleData);
    return 'updated';
  }

  await addDoc(rolesCol, roleData);
  return 'created';
};

export function usePracticeActions() {
  const { user } = useAuth();
  const { success, error: notifyError } = useToast();

  const getPracticeRef = (): DocumentReference => {
    if (!user.value?.practiceRef) throw new Error('No active practice found');
    return user.value.practiceRef;
  };

  const updateDetails = async (details: PracticeDetails) => {
    try {
      await performDetailsUpdate(getPracticeRef(), details);
      success('Practice details updated.');
    } catch {
      notifyError('Failed to update details.');
    }
  };

  const saveRole = async (role: PracticeRoleConfig) => {
    try {
      const action = await performRoleSave(getPracticeRef(), role);
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
      const pRef = getPracticeRef();
      const surgeriesCol = collection(pRef, 'surgeries');
      const surgeryDocRef = surgery.id ? doc(surgeriesCol, surgery.id) : doc(surgeriesCol);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...surgeryData } = surgery;
      await setDoc(surgeryDocRef, surgeryData, { merge: true });

      const batch = await syncStaffingRequirements({
        pRef,
        surgeryId: surgeryDocRef.id,
        surgeryName: surgery.name,
        staffCounts,
        allRoles
      });

      await batch.commit();
      success('Surgery configuration saved.');
    } catch {
      notifyError('Failed to save surgery configuration.');
    }
  };

  return { updateDetails, saveRole, saveSurgery };
}
