<script setup lang="ts">
/**
 * Component for managing and displaying the list of practice surgeries.
 *
 * This is the main view for the surgeries configuration section. It renders
 * a data table (BaseTable) listing all surgeries, along with their operating
 * hours, days, and staffing requirements. It provides a toggle to view
 * archived surgeries and integrates the PracticeSurgeryModal for adding
 * and editing entries.
 */

import { type Timestamp } from 'firebase/firestore';
import { computed, markRaw, ref } from 'vue';

import IconPlus from '@/components/icons/IconPlus.vue';
import BaseButton from '@/components/shared/BaseButton.vue';
import BaseTable, { type TableHeader } from '@/components/shared/BaseTable.vue';
import BaseToggle from '@/components/shared/BaseToggle.vue';
import SurgeryActionCell from '@/features/settings/components/cells/SurgeryActionCell.vue';
import SurgeryDayCell from '@/features/settings/components/cells/SurgeryDayCell.vue';
import SurgeryStaffCell from '@/features/settings/components/cells/SurgeryStaffCell.vue';
import SurgeryTimeCell from '@/features/settings/components/cells/SurgeryTimeCell.vue';
import PracticeSurgeryModal from '@/features/settings/components/modals/PracticeSurgeryModal.vue';
import { usePracticeActions } from '@/features/settings/composables/usePracticeActions';
import { type PracticeRoleConfig, type SurgeryConfig } from '@/features/settings/settingsTypes';

const props = defineProps<{
  items: SurgeryConfig[];
  roles: PracticeRoleConfig[];
}>();

const { toggleSurgeryArchive } = usePracticeActions();

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SUBSTRING_LENGTH = 3;

const showArchived = ref(false);
const isModalOpen = ref(false);
const selectedSurgery = ref<SurgeryConfig | null>(null);

const displayedItems = computed(() => {
  return props.items
    .filter((item) => !!item.is_deleted === showArchived.value)
    .map((item) => item as unknown as Record<string, unknown>);
});

// Comparator for Start Time sorting
const surgerySorter = (a: Record<string, unknown>, b: Record<string, unknown>) => {
  const timeA = (a.start_time as Timestamp)?.seconds || 0;
  const timeB = (b.start_time as Timestamp)?.seconds || 0;
  return timeA - timeB;
};

const openAddModal = () => {
  selectedSurgery.value = null;
  isModalOpen.value = true;
};

const handleEdit = (item: Record<string, unknown>) => {
  selectedSurgery.value = item as unknown as SurgeryConfig;
  isModalOpen.value = true;
};

const handleRestore = async (item: Record<string, unknown>) => {
  if (item.id) {
    await toggleSurgeryArchive(item.id as string, false);
  }
};

const headers = computed<TableHeader[]>(() => {
  const base: TableHeader[] = [
    { key: 'name', label: 'Name', width: '150px' },
    {
      key: 'start_time',
      label: 'Start',
      width: '80px',
      cellComponent: markRaw(SurgeryTimeCell)
    },
    {
      key: 'end_time',
      label: 'End',
      width: '80px',
      cellComponent: markRaw(SurgeryTimeCell)
    }
  ];

  const dayHeaders: TableHeader[] = DAYS.map((d) => ({
    key: `day_${d}`,
    label: d.slice(0, Math.max(0, SUBSTRING_LENGTH)),
    width: '50px',
    align: 'center',
    cellComponent: markRaw(SurgeryDayCell)
  }));

  const roleHeaders: TableHeader[] = props.roles.map((r) => ({
    key: `role_${r.id}`,
    label: r.name,
    align: 'center',
    width: '140px',
    headerClass: 'header-hyphenate',
    cellComponent: markRaw(SurgeryStaffCell)
  }));

  const actionHeader: TableHeader = {
    key: 'actions',
    label: '',
    width: '80px',
    align: 'center',
    headerClass: 'sticky-col-header',
    cellClass: 'sticky-col-cell',
    cellComponent: markRaw(SurgeryActionCell),
    meta: {
      onEdit: handleEdit,
      onRestore: handleRestore
    }
  };

  return [...base, ...dayHeaders, ...roleHeaders, actionHeader];
});
</script>

<template>
  <div class="surgeries-section">
    <div class="section-header">
      <div class="header-left">
        <h3>Surgeries & Requirements</h3>
        <div class="archive-toggle">
          <BaseToggle v-model="showArchived" label="Show Archived" />
          <span class="toggle-text">Show Archived</span>
        </div>
      </div>
      <BaseButton
        v-if="!showArchived"
        :icon="IconPlus"
        label="Add Surgery"
        variant="primary"
        @click="openAddModal"
      />
    </div>

    <BaseTable
      :headers="headers"
      :items="displayedItems"
      :sort-function="surgerySorter"
      :vertical-lines="true"
    />

    <PracticeSurgeryModal
      :all-roles="roles"
      :show="isModalOpen"
      :surgery-to-edit="selectedSurgery"
      @close="isModalOpen = false"
    />
  </div>
</template>

<style scoped>
.surgeries-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  overflow-x: auto;
}

.section-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.header-left {
  align-items: center;
  display: flex;
  gap: 1.5rem;
}

.archive-toggle {
  align-items: center;
  display: flex;
  gap: 0.5rem;
}

.toggle-text {
  color: var(--text-muted);
  font-size: 0.85rem;
}

h3 {
  color: var(--text-main);
  font-size: 1.1rem;
  margin: 0;
}

/* Deep Styles for Table Layout */
:deep(.header-hyphenate) {
  hyphens: auto;
  line-height: 1.2;
  overflow-wrap: break-word;
  vertical-align: middle;
  white-space: normal;
}

:deep(.sticky-col-header) {
  background-color: white;
  box-shadow: -2px 0 5px rgb(0 0 0 / 5%);
  position: sticky;
  right: 0;
  z-index: 30;
}

:deep(.sticky-col-cell) {
  background-color: white;
  box-shadow: -2px 0 5px rgb(0 0 0 / 5%);
  position: sticky;
  right: 0;
  z-index: 10;
}
</style>
