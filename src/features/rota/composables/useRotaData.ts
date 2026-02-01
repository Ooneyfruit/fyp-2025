/**
 * Rota data management composable.
 */
import { computed, type Ref, ref } from 'vue';

import { useRotaColors } from '@/features/rota/composables/useRotaColors';
import { fetchPracticeRoles, fetchPracticeSurgeries, fetchShifts } from '@/features/rota/rotaApi';
import type { PracticeRole, PracticeSurgery, Shift } from '@/features/rota/rotaTypes';
import type { UserProfile } from '@/features/users/userTypes';
import type { Nullable } from '@/types/generic';

export interface RotaRow {
  [key: string]: unknown;
  id: string;
  role: PracticeRole;
  surgery: PracticeSurgery;
}

interface FirestoreTimestamp {
  toDate(): Date;
}

const getShiftIsoDate = (dateVal: unknown): string | null => {
  if (!dateVal) return null;

  const dateObj =
    typeof (dateVal as FirestoreTimestamp).toDate === 'function'
      ? (dateVal as FirestoreTimestamp).toDate()
      : new Date(dateVal as string | number | Date);

  if (Number.isNaN(dateObj.getTime())) return null;

  return dateObj.toISOString().split('T')[0];
};

const isSameId = (ref: unknown, id: string): boolean => {
  if (!ref || typeof ref !== 'object') return false;

  // Safe access to potential Firestore reference properties
  const r = ref as { id?: string; path?: string };
  return r.id === id || (typeof r.path === 'string' && r.path.endsWith(id));
};

const isShiftInSlot = (
  shift: Shift,
  roleId: string,
  surgeryId: string,
  dateIso: string
): boolean => {
  if (getShiftIsoDate(shift.date) !== dateIso) return false;

  const roleMatch = isSameId(shift.role_id, roleId);
  const surgeryMatch = isSameId(shift.surgery_id, surgeryId);

  return roleMatch && surgeryMatch;
};

export function useRotaData(userRef: Ref<Nullable<UserProfile>>) {
  const practiceRoles = ref<PracticeRole[]>([]);
  const practiceSurgeries = ref<PracticeSurgery[]>([]);
  const rawShifts = ref<Shift[]>([]);
  const isLoading = ref(false);
  const { prefillRegistry } = useRotaColors();

  const loadData = async (): Promise<void> => {
    if (!userRef.value?.practiceRef) return;
    isLoading.value = true;
    try {
      const pId = userRef.value.practiceRef.id;
      const [roles, surgeries, shifts] = await Promise.all([
        fetchPracticeRoles(pId),
        fetchPracticeSurgeries(pId),
        fetchShifts(pId)
      ]);

      practiceRoles.value = roles.filter((r) => !r.is_deleted);
      practiceSurgeries.value = surgeries.filter((s) => !s.is_deleted);
      rawShifts.value = shifts;
      prefillRegistry(roles);
    } catch {
      practiceRoles.value = [];
      practiceSurgeries.value = [];
      rawShifts.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const flattenedRows = computed<RotaRow[]>(() => {
    const rows: RotaRow[] = [];
    for (const role of practiceRoles.value) {
      for (const surgery of practiceSurgeries.value) {
        rows.push({ id: `${role.id}_${surgery.id}`, role, surgery });
      }
    }
    return rows;
  });

  const getShiftsForSlot = (roleId: string, surgeryId: string, dateIso: string): Shift[] => {
    return rawShifts.value.filter((s) => isShiftInSlot(s, roleId, surgeryId, dateIso));
  };

  return { flattenedRows, loadData, getShiftsForSlot, isLoading };
}
