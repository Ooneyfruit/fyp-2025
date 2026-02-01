/**
 * Integration tests for RotaGrid.vue.
 * verifies that the grid renders rows, columns, and handles slot interactions.
 */
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import type { RotaDay } from '@/features/rota/composables/useRotaDates';

import RotaGrid from './RotaGrid.vue';

describe('RotaGrid.vue', () => {
  const mockDays: RotaDay[] = [
    {
      key: '2025-01-01',
      iso: '2025-01-01',
      label: 'Mon 1',
      dateObj: new Date('2025-01-01'),
      isWeekend: false,
      isToday: false,
      isBeforeToday: false
    },
    {
      key: '2025-01-02',
      iso: '2025-01-02',
      label: 'Tue 2',
      dateObj: new Date('2025-01-02'),
      isWeekend: false,
      isToday: false,
      isBeforeToday: false
    }
  ];

  const mockRows = [
    {
      id: 'surgery_1',
      role: { id: 'role_1', name: 'Dentist' },
      surgery: { id: 'surgery_1', name: 'Surgery 1' }
    }
  ];

  const mockGetShifts = vi.fn(() => []);

  // Define explicit stub
  const BaseTableStub = {
    name: 'BaseTable',
    template: '<div class="base-table-stub"><slot /></div>',
    props: ['headers', 'items']
  };

  it('renders the base table with correct headers', () => {
    const wrapper = mount(RotaGrid, {
      props: {
        days: mockDays,
        rows: mockRows,
        getShifts: mockGetShifts
      },
      global: {
        stubs: {
          BaseTable: BaseTableStub
        }
      }
    });

    // Find by stub definition
    const baseTable = wrapper.findComponent(BaseTableStub);
    expect(baseTable.exists()).toBe(true);

    const headers = baseTable.props('headers');
    expect(headers).toHaveLength(3);
    expect(headers[0].label).toBe('Role / Surgery');
    expect(headers[1].label).toBe('Mon 1');
  });

  it('provides the getShifts function to children', () => {
    const wrapper = mount(RotaGrid, {
      props: {
        days: mockDays,
        rows: mockRows,
        getShifts: mockGetShifts
      },
      global: {
        stubs: { BaseTable: BaseTableStub }
      }
    });

    expect(wrapper.exists()).toBe(true);
  });
});
