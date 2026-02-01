/**
 * Unit tests for RotaSlot.vue.
 * verifies visual states (weekend, past, filled) and interaction events.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import RotaSlot from './RotaSlot.vue';

describe('RotaSlot.vue', () => {
  const defaultProps = {
    roleId: 'dentist',
    roleName: 'Dentist'
  };

  it('renders an empty state with a plus icon by default', () => {
    const wrapper = mount(RotaSlot, {
      props: {
        ...defaultProps,
        shifts: []
      }
    });

    expect(wrapper.find('.empty-placeholder').exists()).toBe(true);
    expect(wrapper.find('.shift-pill').exists()).toBe(false);
  });

  it('renders shift pills when data is provided', () => {
    const shifts = [
      {
        id: '1',
        user_name: 'John Doe',
        start: '',
        end: '',
        roleId: 'dentist',
        surgeryId: '1',
        date: '2025-01-01'
      }
    ];

    const wrapper = mount(RotaSlot, {
      props: {
        ...defaultProps,
        // @ts-expect-error - Partial shift object for testing
        shifts
      }
    });

    expect(wrapper.find('.shift-pill').exists()).toBe(true);
    expect(wrapper.text()).toContain('JD'); // Initials
    expect(wrapper.text()).toContain('John Doe'); // Full name
  });

  it('applies correct class for weekends', () => {
    const wrapper = mount(RotaSlot, {
      props: {
        ...defaultProps,
        isWeekend: true
      }
    });

    expect(wrapper.classes()).toContain('slot-weekend');
  });

  it('applies correct class for past dates', () => {
    const wrapper = mount(RotaSlot, {
      props: {
        ...defaultProps,
        isBeforeToday: true
      }
    });

    expect(wrapper.classes()).toContain('slot-past');
  });

  it('emits a click event when the button is clicked', async () => {
    const wrapper = mount(RotaSlot, {
      props: defaultProps
    });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted()).toHaveProperty('click');
  });
});
