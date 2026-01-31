<script setup lang="ts">
/**
 * Administrative settings view.
 * Displays practice details, roles, and surgery configuration.
 * Enforces admin-only access via a watcher on the authenticated user profile.
 */
import { watch } from 'vue';
import { useRouter } from 'vue-router';

import AppPageContainer from '@/components/layout/AppPageContainer.vue';
import AppPageHeader from '@/components/layout/AppPageHeader.vue';
import AppLoading from '@/components/shared/AppLoading.vue';
import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import PracticeDetails from '@/features/settings/components/PracticeDetails.vue';
import PracticeRoles from '@/features/settings/components/PracticeRoles.vue';
import PracticeSurgeries from '@/features/settings/components/PracticeSurgeries.vue';
import { usePracticeSettings } from '@/features/settings/composables/usePracticeSettings';

const { user } = useAuth();
const router = useRouter();
const { error: notifyError } = useToast();
const { details, enrichedSurgeries, roles, isLoading } = usePracticeSettings();

/**
 * Security Watcher:
 * Automatically redirects to the home page if the user switches to a practice
 * where they are not an administrator, or if they log out.
 */
watch(
  () => user.value,
  (currentUser) => {
    if (currentUser && !currentUser.is_administrator) {
      notifyError('Access denied: You are not an administrator for this practice.');
      router.push('/');
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <AppPageContainer>
    <AppPageHeader
      subtitle="Manage your practice details, roles, and surgery configurations."
      title="Practice Settings"
    />

    <AppLoading v-if="isLoading" message="Loading settings..." />

    <div v-else class="settings-content">
      <section>
        <h3>Practice Details</h3>
        <PracticeDetails :details="details" />
      </section>

      <PracticeSurgeries :items="enrichedSurgeries" :roles="roles" />

      <PracticeRoles :roles="roles" />
    </div>
  </AppPageContainer>
</template>

<style scoped>
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 2rem;
}

h3 {
  color: var(--text-main);
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}
</style>
