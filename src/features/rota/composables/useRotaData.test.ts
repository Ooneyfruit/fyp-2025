/**
 * Resilience tests for Rota Data.
 * verifies that the application handles API failures and data loading correctly.
 */
import type { DocumentReference } from 'firebase/firestore';
import { describe, expect, it, vi } from 'vitest';
import { type Ref, ref } from 'vue';

import * as rotaApi from '@/features/rota/rotaApi';
import type { Shift } from '@/features/rota/rotaTypes';
import type { UserProfile } from '@/features/users/userTypes';

import { useRotaData } from './useRotaData';

// Mock the API layer
vi.mock('@/features/rota/rotaApi', () => ({
  fetchPracticeRoles: vi.fn(),
  fetchPracticeSurgeries: vi.fn(),
  fetchShifts: vi.fn()
}));

// Mock the colors composable since it is used inside useRotaData
vi.mock('@/features/rota/composables/useRotaColors', () => ({
  useRotaColors: () => ({
    prefillRegistry: vi.fn()
  })
}));

describe('useRotaData', () => {
  // Fix: Use Partial<UserProfile> to satisfy the UserProfile type without mocking 20 fields
  const mockUserRef = ref({
    practiceRef: { id: 'practice_123' }
  }) as Ref<UserProfile | null>;

  it('loads and transforms data correctly on success', async () => {
    // Arrange: Mock successful API responses with strict types
    vi.mocked(rotaApi.fetchPracticeRoles).mockResolvedValue([{ id: 'role_1', name: 'Dentist' }]);
    vi.mocked(rotaApi.fetchPracticeSurgeries).mockResolvedValue([
      { id: 'surgery_1', name: 'Surgery 1' }
    ]);

    // Fix: Type the mock return value properly using DocumentReference cast
    const mockShifts: Shift[] = [
      {
        id: 'shift_1',
        // We use 'unknown' first to bypass the strict type check for our partial mock
        role_id: { id: 'role_1' } as unknown as DocumentReference,
        surgery_id: { id: 'surgery_1' } as unknown as DocumentReference,
        date: '2025-01-01',
        user_id: 'u1',
        user_name: 'Dr. Test',
        is_resolved: false,
        roster_status: 'draft'
      }
    ];
    vi.mocked(rotaApi.fetchShifts).mockResolvedValue(mockShifts);

    // Act
    const { loadData, flattenedRows, getShiftsForSlot } = useRotaData(mockUserRef);
    await loadData();

    // Assert: Flattened rows (the grid structure) should be generated
    // 1 Role * 1 Surgery = 1 Row
    expect(flattenedRows.value).toHaveLength(1);
    expect(flattenedRows.value[0]!.id).toBe('role_1_surgery_1');

    // Assert: Shifts should be retrievable via the helper
    const shifts = getShiftsForSlot('role_1', 'surgery_1', '2025-01-01');
    expect(shifts).toHaveLength(1);
    expect(shifts[0]!.id).toBe('shift_1');
  });

  it('handles API errors gracefully (Resilience)', async () => {
    // Arrange: Force an API failure
    vi.mocked(rotaApi.fetchShifts).mockRejectedValue(new Error('Network Error'));

    // Act
    const { loadData, flattenedRows } = useRotaData(mockUserRef);
    await loadData();

    // Assert: State should be clean/empty, not undefined or crashing
    expect(flattenedRows.value).toEqual([]);
  });

  it('does nothing if user has no practice', async () => {
    // Fix: Proper typing for empty user state
    const emptyUser = ref(null);
    const { loadData } = useRotaData(emptyUser);

    await loadData();

    expect(rotaApi.fetchShifts).not.toHaveBeenCalled();
  });
});
