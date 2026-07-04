/**
 * Resilience tests for Rota Data.
 * verifies that the application handles API failures and data loading correctly.
 */
import { onSnapshot } from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, type Ref, ref } from 'vue';

import type { UserProfile } from '@/features/users/userTypes';

import { useRotaData } from './useRotaData';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, path) => ({ path })),
  onSnapshot: vi.fn()
}));

vi.mock('@/features/rota/composables/useRotaColours', () => ({
  useRotaColours: () => ({
    prefillRegistry: vi.fn()
  })
}));

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    error: vi.fn()
  })
}));

vi.mock('@/services/firebase', () => ({
  db: {}
}));

describe('useRotaData', () => {
  const mockUserRef = ref({
    practiceRef: { id: 'practice_123' }
  }) as Ref<UserProfile | null>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and transforms data correctly via onSnapshot', async () => {
    vi.mocked(onSnapshot).mockImplementation((source, onNext) => {
      const callback = onNext as (snap: unknown) => void;
      const path = (source as { path?: string })?.path || '';

      if (path.includes('roles')) {
        callback({ docs: [{ id: 'role_1', data: () => ({ name: 'Dentist' }) }] });
      } else if (path.includes('surgeries')) {
        callback({ docs: [{ id: 'surgery_1', data: () => ({ name: 'Surgery 1' }) }] });
      } else if (path === 'shifts') {
        callback({
          docs: [
            {
              id: 'shift_1',
              data: () => ({
                role_id: { path: 'practice_123/role_1' },
                surgery_id: { path: 'practice_123/surgery_1' },
                date: '2025-01-01',
                user_id: 'u1',
                user_name: 'Dr. Test',
                is_resolved: false,
                roster_status: 'draft'
              })
            }
          ]
        });
      }
      return vi.fn();
    });

    const { flattenedRows, getShiftsForSlot } = useRotaData(mockUserRef);
    await nextTick();

    expect(flattenedRows.value).toHaveLength(1);
    expect(flattenedRows.value[0]!.id).toBe('role_1_surgery_1');

    const shifts = getShiftsForSlot('role_1', 'surgery_1', '2025-01-01');
    expect(shifts).toHaveLength(1);
    expect(shifts[0]!.id).toBe('shift_1');
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(onSnapshot).mockImplementation((...args: unknown[]) => {
      const errCb = args[2] as ((err: Error) => void) | undefined;
      if (errCb && typeof errCb === 'function') {
        errCb(new Error('Network Error'));
      }
      return vi.fn();
    });

    const { flattenedRows, isLoading } = useRotaData(mockUserRef);
    await nextTick();

    expect(flattenedRows.value).toEqual([]);
    expect(isLoading.value).toBe(false);
  });

  it('does nothing if user has no practice', async () => {
    const emptyUser = ref(null);
    useRotaData(emptyUser);

    await nextTick();

    expect(onSnapshot).not.toHaveBeenCalled();
  });
});
