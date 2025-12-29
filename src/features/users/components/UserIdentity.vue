<template>
  <div class="user-info">
    <img 
      :src="profile?.profile_image || 'https://via.placeholder.com/40'" 
      class="avatar"
    />
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

<script setup>
const props = defineProps({ 
  profile: { type: Object, default: () => ({}) }
});

import { watchEffect } from 'vue';
watchEffect(() => {
  if (props.profile?.name) {
    console.log(`[UserIdentity] Displaying profile: ${props.profile.name}`);
  }
});
</script>

<style scoped>
.user-info { display: flex; align-items: center; gap: 0.75rem; width: 100%; min-width: 6rem; }
.avatar { width: 2.25rem; height: 2.25rem; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.meta { display: flex; flex-direction: column; line-height: 1.3; min-width: 0; flex: 1; }
.name, .email { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
.name { font-weight: 600; font-size: 0.85rem; color: var(--text-main); }
.email { font-size: 0.7rem; color: var(--text-muted); }
</style>