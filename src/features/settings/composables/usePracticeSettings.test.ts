/**
 * Test suite for Practice Settings logic (Read-Only).
 * Verifies fetching of practice details via Firestore listeners.
 */
import { mount } from '@vue/test-utils';
import { onSnapshot } from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';

import { usePracticeSettings } from './usePracticeSettings';

// Mock useAuth to provide a stable practice context.
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: ref({ practiceRef: { id: 'practice_123' } })
  })
}));

describe('usePracticeSettings', () => {
  /**
   * Helper component to provide an active lifecycle context.
   */
  const TestHost = defineComponent({
    setup() {
      const result = usePracticeSettings();
      // Expose properties to the instance for test access.
      return { ...result };
    },
    render() {
      return h('div');
    }
  });

  beforeEach(() => {
    // Reset snapshots to return a known practice state.
    vi.mocked(onSnapshot).mockImplementation((_ref, callback) => {
      // @ts-expect-error - Simulating partial Firestore snapshot.
      callback({
        exists: () => true,
        data: () => ({ name: 'Test Practice', address: '123 Fake St' }),
        docs: []
      });
      return vi.fn();
    });
  });

  it('initialises listeners and populates data', async () => {
    const wrapper = mount(TestHost);
    // We cast to 'any' here because Vue Test Utils unwraps refs on 'vm',
    // making the types inconsistent with the Composable's return type (Ref<T>).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vm = wrapper.vm as any;

    await nextTick();

    expect(onSnapshot).toHaveBeenCalled();

    // Fix: Access .name directly because vm unwraps top-level refs.
    expect(vm.details.name).toBe('Test Practice');
    expect(vm.isLoading).toBe(false);
  });
});
