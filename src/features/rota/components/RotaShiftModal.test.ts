/**
 * Integration tests for RotaShiftModal.vue.
 * Verifies the full user journey of assigning and removing staff from shifts.
 */
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { createShift, deleteShift } from '@/features/rota/rotaApi';

import RotaShiftModal from './RotaShiftModal.vue';

// --- Mocks ---

vi.mock('@/features/rota/rotaApi', () => ({
  createShift: vi.fn(),
  deleteShift: vi.fn()
}));

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: ref({ practiceRef: { id: 'practice_123' } })
  })
}));

vi.mock('@/composables/useModal', () => ({
  useModal: () => ({
    isVisible: ref(true),
    open: vi.fn(),
    close: vi.fn(),
    data: ref({
      role: { id: 'role_1', name: 'Dentist' },
      surgery: { id: 'surgery_1', name: 'Surgery A' },
      date: { label: 'Mon 1st', iso: '2025-01-01' },
      shifts: []
    })
  })
}));

vi.mock('@/features/users/composables/usePracticeUsers', () => ({
  usePracticeUsers: () => ({
    isLoading: ref(false),
    users: ref([
      {
        id: 'mem_1',
        role: 'Dentist',
        user: { id: 'user_1' },
        profile: { id: 'user_1', name: 'Dr. Smith', email: 'smith@test.com' }
      }
    ])
  })
}));

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    showToast: vi.fn()
  })
}));

describe('RotaShiftModal.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Define stubs
  const RotaStaffPickerStub = {
    name: 'RotaStaffPicker',
    template: '<div class="picker-stub" />',
    props: ['recommended', 'others']
  };

  const RotaAssignedStaffStub = {
    name: 'RotaAssignedStaff',
    template: '<div class="assigned-stub" />'
  };

  const RotaShiftModalFooterStub = {
    name: 'RotaShiftModalFooter',
    template: '<div class="footer-stub"></div>',
    props: ['onSave']
  };

  const BaseModalStub = {
    name: 'BaseModal',
    props: ['footerComponent', 'footerProps'],
    template: `
      <div class="base-modal-stub">
        <slot />
        <component :is="footerComponent" v-if="footerComponent" v-bind="footerProps" />
      </div>
    `
  };

  const globalOptions = {
    stubs: {
      BaseModal: BaseModalStub,
      RotaAssignedStaff: RotaAssignedStaffStub,
      RotaStaffPicker: RotaStaffPickerStub,
      RotaShiftModalFooter: RotaShiftModalFooterStub
    }
  };

  it('renders correctly with provided context data', () => {
    const wrapper = mount(RotaShiftModal, { global: globalOptions });
    expect(wrapper.exists()).toBe(true);
  });

  it('calculates recommended staff based on role match', () => {
    const wrapper = mount(RotaShiftModal, { global: globalOptions });
    const picker = wrapper.findComponent(RotaStaffPickerStub);

    expect(picker.props('recommended')).toHaveLength(1);
    expect(picker.props('recommended')[0].name).toBe('Dr. Smith');
  });

  it('saves new shifts when staff are added', async () => {
    const wrapper = mount(RotaShiftModal, { global: globalOptions });

    // 1. Add staff via picker event
    const picker = wrapper.findComponent(RotaStaffPickerStub);
    await picker.vm.$emit('add', {
      uid: 'user_1',
      name: 'Dr. Smith',
      role: 'Dentist'
    });

    // 2. Trigger Save via the Footer prop directly
    // This avoids testing DOM event propagation quirks and focuses on logic wiring
    const footer = wrapper.findComponent(RotaShiftModalFooterStub);
    const onSave = footer.props('onSave');
    await onSave();

    expect(createShift).toHaveBeenCalledTimes(1);
  });

  it('deletes shifts when staff are removed', async () => {
    const wrapper = mount(RotaShiftModal, { global: globalOptions });
    const assignedList = wrapper.findComponent(RotaAssignedStaffStub);

    await assignedList.vm.$emit('remove', { id: 'shift_existing', isTemp: false });

    const footer = wrapper.findComponent(RotaShiftModalFooterStub);
    const onSave = footer.props('onSave');
    await onSave();

    expect(deleteShift).toHaveBeenCalledWith('shift_existing');
  });
});
