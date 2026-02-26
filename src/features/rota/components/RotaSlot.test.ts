/**
 * Unit tests for RotaSlot.vue.
 * verifies visual states (weekend, past, filled) and interaction events.
 */
import { mount } from '@vue/test-utils';
import type { DocumentData, DocumentReference } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import type { Shift } from '@/features/rota/rotaTypes';

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
    const shifts: Shift[] = [
      {
        id: '1',
        user_name: 'John Doe',
        role_id: { id: 'dentist' } as DocumentReference<DocumentData>,
        surgery_id: { id: '1' } as DocumentReference<DocumentData>,
        date: '2025-01-01',
        is_resolved: false,
        roster_status: 'published'
      }
    ];

    const wrapper = mount(RotaSlot, {
      props: {
        ...defaultProps,
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
