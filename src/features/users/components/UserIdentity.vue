<script setup>
import IconIdenticon from '../../../components/icons/IconIdenticon.vue';

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
        :src="profile.profile_image"
        class="avatar"
        alt="User profile"
        referrerpolicy="no-referrer"
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
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-width: 6rem;
}

/* Wrapper to maintain consistent avatar dimensions */
.avatar-wrapper {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
}

/* Ensures avatars and icons are circular and cropped correctly */
.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  overflow: hidden;
}

/* Styling for the fallback identicon background */
.identicon {
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Text container for profile metadata */
.meta {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
  flex: 1;
}

/* Typography and ellipsis behavior for long text strings */
.name,
.email {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.name {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-main);
}
.email {
  font-size: 0.7rem;
  color: var(--text-muted);
}
</style>
