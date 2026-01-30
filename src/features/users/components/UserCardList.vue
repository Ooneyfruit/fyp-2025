<script lang="ts">
/**
 * Mobile card list view for Users.
 * Implemented as a Render Function to strictly adhere to nesting rules while managing complex slot content and event propagation.
 */
import { defineComponent, h, type PropType } from 'vue';

import BaseCardList from '@/components/shared/BaseCardList.vue';
import type { PracticeUser, UserProfile } from '@/features/users/userTypes';

import UserCardBody from './UserCardBody.vue';
import UserCardHeader from './UserCardHeader.vue';

/**
 * Local type definition matching the runtime structure.
 */
type PracticeUserRow = PracticeUser & { profile: UserProfile };

export default defineComponent({
  name: 'UserCardList',
  props: {
    users: {
      type: Array as PropType<PracticeUserRow[]>,
      required: true,
      default: () => []
    }
  },
  emits: {
    edit: (item: PracticeUser) => !!item
  },
  setup(props, { emit }) {
    return () =>
      h(
        BaseCardList,
        {
          items: props.users as unknown as Record<string, unknown>[],
          minCardWidth: '18rem'
        },
        {
          // Header Slot: Renders UserCardHeader and binds the edit event.
          'card-header': ({ item }: { item: unknown }) => {
            const user = item as PracticeUserRow;
            return h(UserCardHeader, {
              item: user,
              onEdit: (target: PracticeUser) => emit('edit', target)
            });
          },
          // Body Slot: Renders UserCardBody.
          'card-body': ({ item }: { item: unknown }) => {
            const user = item as PracticeUserRow;
            return h(UserCardBody, {
              item: user
            });
          }
        }
      );
  }
});
</script>
