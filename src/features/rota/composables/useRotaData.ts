/**
 * Rota data management composable.
 */
import {
  collection,
  type DocumentReference,
  type FirestoreError,
  onSnapshot,
  type QueryDocumentSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import { computed, onUnmounted, type Ref, ref, watch } from 'vue';

import { useToast } from '@/composables/useToast';
import { useRotaColours } from '@/features/rota/composables/useRotaColours';
import type { RotaDay } from '@/features/rota/composables/useRotaDates';
import type { PracticeRole, PracticeSurgery, RotaRow, Shift } from '@/features/rota/rotaTypes';
import type { MinimumStaffConfig } from '@/features/settings/settingsTypes';
import type { UserProfile } from '@/features/users/userTypes';
import { db } from '@/services/firebase';
import type { Nullable } from '@/types/generic';

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

  return dateObj.toISOString().split('T')[0]!;
};

const extractId = (val: unknown): string => {
  if (val && typeof val === 'object' && 'id' in val) {
    return (val as DocumentReference).id;
  }
  return String(val);
};

const mapStaffConfig = (docSnap: QueryDocumentSnapshot): MinimumStaffConfig => {
  const dData = docSnap.data();
  return {
    id: docSnap.id,
    ...dData,
    surgery_id: extractId(dData.surgery_id),
    role_id: extractId(dData.role_id)
  } as MinimumStaffConfig;
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

interface DataRefs {
  roles: Ref<PracticeRole[]>;
  surgeries: Ref<PracticeSurgery[]>;
  shifts: Ref<Shift[]>;
  minStaff: Ref<MinimumStaffConfig[]>;
  isLoading: Ref<boolean>;
}

const _createRolesListener = (
  practiceId: string,
  refs: DataRefs,
  onRolesLoaded: (roles: PracticeRole[]) => void,
  loaded: { roles: boolean; surgeries: boolean },
  checkLoading: () => void,
  onError: (error: FirestoreError) => void
) => {
  return onSnapshot(
    collection(db, `practices/${practiceId}/roles`),
    (snap) => {
      refs.roles.value = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as PracticeRole)
        .filter((r) => !r.is_deleted);
      onRolesLoaded(refs.roles.value);
      loaded.roles = true;
      checkLoading();
    },
    onError
  );
};

const _createSurgeriesListener = (
  practiceId: string,
  refs: DataRefs,
  loaded: { roles: boolean; surgeries: boolean },
  checkLoading: () => void,
  onError: (error: FirestoreError) => void
) => {
  return onSnapshot(
    collection(db, `practices/${practiceId}/surgeries`),
    (snap) => {
      refs.surgeries.value = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as PracticeSurgery)
        .filter((s) => !s.is_deleted);
      loaded.surgeries = true;
      checkLoading();
    },
    onError
  );
};

const _createShiftsListener = (
  practiceId: string,
  refs: DataRefs,
  onError: (error: FirestoreError) => void
) => {
  return onSnapshot(
    collection(db, 'shifts'),
    (snap) => {
      refs.shifts.value = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Shift)
        .filter((s: Shift) => s.role_id?.path?.includes(practiceId));
    },
    onError
  );
};

const _createMinStaffListener = (
  practiceId: string,
  refs: DataRefs,
  onError: (error: FirestoreError) => void
) => {
  return onSnapshot(
    collection(db, `practices/${practiceId}/minimum_operating_staff`),
    (snap) => {
      refs.minStaff.value = snap.docs.map((doc) => mapStaffConfig(doc));
    },
    onError
  );
};

const initListeners = (
  practiceId: string,
  refs: DataRefs,
  onRolesLoaded: (roles: PracticeRole[]) => void,
  onError: (error: FirestoreError) => void
): Unsubscribe[] => {
  const loaded = { roles: false, surgeries: false };
  const checkLoading = () => {
    if (loaded.roles && loaded.surgeries) refs.isLoading.value = false;
  };

  return [
    _createRolesListener(practiceId, refs, onRolesLoaded, loaded, checkLoading, onError),
    _createSurgeriesListener(practiceId, refs, loaded, checkLoading, onError),
    _createShiftsListener(practiceId, refs, onError),
    _createMinStaffListener(practiceId, refs, onError)
  ];
};

const buildFlattenedRows = (roles: PracticeRole[], surgeries: PracticeSurgery[]): RotaRow[] => {
  const rows: RotaRow[] = [];
  for (const role of roles) {
    for (const surgery of surgeries) {
      rows.push({ id: `${role.id}_${surgery.id}`, role, surgery });
    }
  }
  return rows;
};

const stopAllListeners = (listeners: Ref<Unsubscribe[]>) => {
  for (const unsub of listeners.value) {
    unsub();
  }
  listeners.value = [];
};

const getDayName = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
};

const checkRequirementUnmet = (
  roleId: string,
  surgeryId: string,
  day: RotaDay,
  surgeries: PracticeSurgery[],
  minStaffRequirements: MinimumStaffConfig[],
  assignedShifts: Shift[]
): boolean => {
  if (day.isBeforeToday) return false;

  const surgery = surgeries.find((s) => s.id === surgeryId);
  if (!surgery?.days_of_operation?.length) return false;

  const dayName = getDayName(day.dateObj);
  if (!surgery.days_of_operation.includes(dayName)) return false;

  const requirement = minStaffRequirements.find(
    (req) => req.role_id === roleId && req.surgery_id === surgeryId
  );

  if (!requirement || requirement.staff_count <= 0) return false;

  return assignedShifts.length < requirement.staff_count;
};

const _resetData = (
  practiceRoles: Ref<PracticeRole[]>,
  practiceSurgeries: Ref<PracticeSurgery[]>,
  rawShifts: Ref<Shift[]>,
  minStaffRequirements: Ref<MinimumStaffConfig[]>,
  isLoading: Ref<boolean>
) => {
  practiceRoles.value = [];
  practiceSurgeries.value = [];
  rawShifts.value = [];
  minStaffRequirements.value = [];
  isLoading.value = false;
};

const _setupListeners = (
  practiceId: string,
  refs: DataRefs,
  listeners: Ref<Unsubscribe[]>,
  prefillRegistry: (roles: PracticeRole[]) => void,
  notifyError: (msg: string) => void
) => {
  refs.isLoading.value = true;
  const onErr = (err: FirestoreError) => {
    notifyError(`Rota Sync Error: ${err.message}`);
    refs.isLoading.value = false;
  };
  listeners.value = initListeners(practiceId, refs, prefillRegistry, onErr);
};

export function useRotaData(userRef: Ref<Nullable<UserProfile>>) {
  const practiceRoles = ref<PracticeRole[]>([]);
  const practiceSurgeries = ref<PracticeSurgery[]>([]);
  const rawShifts = ref<Shift[]>([]);
  const minStaffRequirements = ref<MinimumStaffConfig[]>([]);
  const isLoading = ref(true);

  const { prefillRegistry } = useRotaColours();
  const { error: notifyError } = useToast();
  const listeners = ref<Unsubscribe[]>([]);

  watch(
    () => userRef.value?.practiceRef,
    (newRef) => {
      stopAllListeners(listeners);
      if (newRef) {
        const refs = {
          roles: practiceRoles,
          surgeries: practiceSurgeries,
          shifts: rawShifts,
          isLoading,
          minStaff: minStaffRequirements
        };
        _setupListeners(newRef.id, refs, listeners, prefillRegistry, notifyError);
      } else {
        _resetData(practiceRoles, practiceSurgeries, rawShifts, minStaffRequirements, isLoading);
      }
    },
    { immediate: true }
  );

  onUnmounted(() => stopAllListeners(listeners));

  const flattenedRows = computed<RotaRow[]>(() =>
    buildFlattenedRows(practiceRoles.value, practiceSurgeries.value)
  );

  const getShiftsForSlot = (roleId: string, surgeryId: string, dateIso: string): Shift[] =>
    rawShifts.value.filter((s) => isShiftInSlot(s, roleId, surgeryId, dateIso));

  const isRequirementUnmet = (roleId: string, surgeryId: string, day: RotaDay): boolean => {
    const shifts = getShiftsForSlot(roleId, surgeryId, day.iso);
    return checkRequirementUnmet(
      roleId,
      surgeryId,
      day,
      practiceSurgeries.value,
      minStaffRequirements.value,
      shifts
    );
  };

  return { flattenedRows, getShiftsForSlot, isLoading, isRequirementUnmet };
}
