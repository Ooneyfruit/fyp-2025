/**
 * Test suite for Practice Settings logic (Read-Only).
 * Verifies fetching of practice details via Firestore listeners.
 */
import { mount } from '@vue/test-utils';
import { onSnapshot } from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref, type UnwrapRef } from 'vue';

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
    vi.mocked(onSnapshot).mockImplementation(((...args: unknown[]) => {
      const callback = args.find((arg) => typeof arg === 'function') as
        | ((snapshot: unknown) => void)
        | undefined;
      if (callback) {
        callback({
          exists: () => true,
          data: () => ({ name: 'Test Practice', address: '123 Fake St' }),
          docs: []
        });
      }
      return vi.fn();
    }) as unknown as typeof onSnapshot);
  });

  it('initialises listeners and populates data', async () => {
    const wrapper = mount(TestHost);
    const vm = wrapper.vm as unknown as UnwrapRef<ReturnType<typeof usePracticeSettings>>;

    await nextTick();

    expect(onSnapshot).toHaveBeenCalled();

    expect(vm.details.name).toBe('Test Practice');
    expect(vm.isLoading).toBe(false);
  });
});
