/**
 * Integration tests for UserCardList.vue.
 * verifies rendering of user cards.
 */
import { mount } from '@vue/test-utils';
import type { DocumentReference } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';

import type { PracticeUser } from '@/features/users/userTypes';

import UserCardList from './UserCardList.vue';

describe('UserCardList.vue', () => {
  // Fix: Mock DocumentReference cleanly
  const mockRef = { id: 'ref_1' } as unknown as DocumentReference;

  // Fix: Full mock objects matching PracticeUser interface
  const mockUsers: PracticeUser[] = [
    {
      id: '1',
      user: { id: 'u1' } as unknown as DocumentReference,
      practice: mockRef,
      role: 'Admin',
      status: 'active',
      start_date: '2024-01-01',
      profile: {
        uid: 'u1',
        email: 'test@test.com',
        activePracticeName: 'Test Practice',
        is_administrator: true,
        name: 'Test User'
      }
    },
    {
      id: '2',
      user: { id: 'u2' } as unknown as DocumentReference,
      practice: mockRef,
      role: 'Nurse',
      status: 'invited',
      start_date: '2024-01-01',
      profile: {
        uid: 'u2',
        email: 'test2@test.com',
        activePracticeName: 'Test Practice',
        is_administrator: false,
        name: 'Test User 2'
      }
    }
  ];

  it('renders a card for each user', () => {
    const wrapper = mount(UserCardList, {
      props: {
        users: mockUsers
      },
      global: {
        stubs: ['UserCard', 'BaseCardList']
      }
    });

    const list = wrapper.findComponent({ name: 'BaseCardList' });
    expect(list.exists()).toBe(true);
    expect(list.props('items')).toHaveLength(2);
  });

  it('displays empty state when no users provided', () => {
    const wrapper = mount(UserCardList, {
      props: { users: [] }
    });

    const list = wrapper.findComponent({ name: 'BaseCardList' });
    expect(list.props('items')).toHaveLength(0);
  });
});
