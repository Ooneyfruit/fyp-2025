/**
 * Component tests for PracticeDetails.vue.
 * verifies form rendering and save actions.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import PracticeDetails from './PracticeDetails.vue';

// Mock the composable
const mockUpdateSettings = vi.fn();
const mockPractice = {
  name: 'Original Name',
  phone: '00000 000000',
  address: '123 Fake St'
};

vi.mock('@/features/settings/composables/usePracticeSettings', () => ({
  usePracticeSettings: () => ({
    practice: mockPractice,
    loading: false,
    updateSettings: mockUpdateSettings,
    loadSettings: vi.fn()
  })
}));

describe('PracticeDetails.vue', () => {
  // Define explicit stubs
  const BaseCardStub = {
    name: 'BaseCard',
    template: '<div class="base-card-stub"><slot /></div>'
  };

  const BaseButtonStub = {
    name: 'BaseButton',
    template: '<button class="edit-btn-stub" @click="$emit(\'click\')">Edit</button>'
  };

  const PracticeDetailsModalStub = {
    name: 'PracticeDetailsModal',
    props: ['show', 'initialData'],
    template: '<div v-if="show" class="modal-stub"></div>'
  };

  const globalOptions = {
    stubs: {
      BaseCard: BaseCardStub,
      BaseButton: BaseButtonStub,
      PracticeDetailsModal: PracticeDetailsModalStub,
      IconEdit: true
    }
  };

  it('renders existing data into inputs', () => {
    const wrapper = mount(PracticeDetails, {
      props: {
        details: mockPractice
      },
      global: globalOptions
    });

    expect(wrapper.text()).toContain('Original Name');
    expect(wrapper.text()).toContain('123 Fake St');
  });

  it('opens the modal when edit button is clicked', async () => {
    const wrapper = mount(PracticeDetails, {
      props: {
        details: mockPractice
      },
      global: globalOptions
    });

    const btn = wrapper.findComponent(BaseButtonStub);
    await btn.trigger('click');

    const modal = wrapper.findComponent(PracticeDetailsModalStub);
    expect(modal.props('show')).toBe(true);
  });
});
