/**
 * Test suite for User Management logic.
 * Verifies fetching and processing of the practice user list.
 */
import { mount } from '@vue/test-utils';
import { onSnapshot } from 'firebase/firestore';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';

// Import the mocked user to control state in tests
import { user as mockUser } from '@/composables/useAuth';

import { usePracticeUsers } from './usePracticeUsers';

// --- Mocks ---

// 1. Mock the Firebase service to prevent real initialization side-effects.
// This ensures we don't accidentally start the app's real DB connection.
vi.mock('@/services/firebase', () => ({
  db: { type: 'mock-db-instance' }
}));

// 2. Mock useAuth to provide a reactive user state we can manipulate.
vi.mock('@/composables/useAuth', async () => {
  const { ref } = await import('vue');
  const user = ref(null);
  return {
    user,
    useAuth: () => ({ user })
  };
});

// 3. Mock Firestore SDK functions.
// We return simple objects with properties (like 'id' or 'type') that the test
// uses to distinguish between collection queries and document references.
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn((_db, _coll, id) => ({ id: id || 'mock_doc_ref' })),
  collection: vi.fn(() => ({ id: 'mock_collection_ref' })),
  query: vi.fn(() => ({ type: 'query' })),
  where: vi.fn(),
  onSnapshot: vi.fn()
}));

describe('usePracticeUsers', () => {
  /**
   * Helper component to provide a valid active lifecycle context.
   */
  const TestHost = defineComponent({
    setup() {
      const result = usePracticeUsers();
      // Expose the composable results to the test wrapper
      return { ...result };
    },
    render() {
      return h('div');
    }
  });

  it('starts syncing users when practice ID is present', async () => {
    const mockUnsubscribe = vi.fn();

    // Setup onSnapshot to handle both collection queries (memberships)
    // and document lookups (user profiles).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(onSnapshot).mockImplementation((source: any, onNext: any) => {
      // 1. Handle Membership Query
      // The composable queries the 'practice_users' collection first.
      if (source.type === 'query') {
        if (typeof onNext === 'function') {
          onNext({
            docs: [
              {
                id: 'mem_1',
                data: () => ({
                  user: { id: 'user_1' },
                  role: 'Dentist',
                  start_date: '2025-01-01'
                })
              }
            ]
          });
        }
      }
      // 2. Handle User Profile Document Lookup
      // The composable then listens to the user document for profile details.
      else if (source.id === 'user_1' && typeof onNext === 'function') {
        onNext({
          exists: () => true,
          id: 'user_1',
          data: () => ({
            name: 'Dr. Test',
            email: 'test@practice.com',
            is_administrator: false
          })
        });
      }

      return mockUnsubscribe;
    });

    const wrapper = mount(TestHost);

    // Trigger the watcher by simulating an authenticated user with a practice.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockUser as any).value = {
      uid: 'u1',
      is_administrator: true,
      practiceRef: { id: 'practice_123' }
    };

    // Wait for the watcher to fire and the async onSnapshot callbacks to propagate.
    await nextTick();
    await nextTick();

    expect(onSnapshot).toHaveBeenCalled();

    // Fix: Cast vm to 'any' because Vue Test Utils unwraps refs (isLoading -> boolean, users -> Array),
    // but TypeScript still sees them as Ref/ComputedRef, causing indexing errors.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vm = wrapper.vm as any;

    // Verify loading state is cleared
    expect(vm.isLoading).toBe(false);

    // Verify users list is populated from the snapshot
    expect(vm.users).toHaveLength(1);

    // Verify profile data was merged correctly (name comes from the user doc)
    expect(vm.users[0].profile.name).toBe('Dr. Test');
  });

  it('stops syncing when component unmounts', async () => {
    const wrapper = mount(TestHost);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vm = wrapper.vm as any;

    // Start sync
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockUser as any).value = {
      practiceRef: { id: 'p1' }
    };
    await nextTick();

    // Unmount the component to trigger cleanup
    wrapper.unmount();

    // Verify list is cleared
    expect(vm.users).toEqual([]);
  });
});
