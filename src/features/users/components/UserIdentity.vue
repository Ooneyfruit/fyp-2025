<script setup>
import IconIdenticon from '@/components/icons/IconIdenticon.vue';

/**
 * Displays user identity with dynamic support for synchronized Google icons.
 */
defineProps({
  profile: { type: Object, default: () => ({}) }
});
</script>

<template>
  <div class="user-info">
    <div class="avatar-wrapper">
      <img
        v-if="profile?.profile_image"
        alt="User profile"
        class="avatar"
        referrerpolicy="no-referrer"
        :src="profile.profile_image"
      />

      <div v-else class="avatar identicon">
        <IconIdenticon :seed="profile?.id || 'default'" />
      </div>
    </div>

    <div class="meta">
      <div class="name" :title="profile?.name">
        {{ profile?.name || 'Loading...' }}
      </div>
      <div class="email" :title="profile?.email">
        {{ profile?.email || 'No email address' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main identity container layout */
.user-info {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  min-width: 6rem;
  width: 100%;
}

/* Wrapper to maintain consistent avatar dimensions */
.avatar-wrapper {
  flex-shrink: 0;
  height: 2.25rem;
  width: 2.25rem;
}

/* Ensures avatars and icons are circular and cropped correctly */
.avatar {
  border-radius: 50%;
  height: 100%;
  object-fit: cover;
  overflow: hidden;
  width: 100%;
}

/* Styling for the fallback identicon background */
.identicon {
  align-items: center;
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
}

/* Text container for profile metadata */
.meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}

/* Typography and ellipsis behavior for long text strings */
.name,
.email {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.name {
  color: var(--text-main);
  font-size: 0.85rem;
  font-weight: 600;
}

.email {
  color: var(--text-muted);
  font-size: 0.7rem;
}
</style>
