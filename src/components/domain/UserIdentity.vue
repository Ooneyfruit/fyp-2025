<template>
  <div class="user-info">
    <img :src="profile?.profile_image || 'https://via.placeholder.com/40'" class="avatar" />
    <div class="meta">
      <div class="name">{{ profile?.name || 'Unknown' }}</div>
      <div class="email" :title="profile?.email">{{ profile?.email }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  profile: { type: Object, default: () => ({}) }
});
</script>

<style scoped>
.user-info { 
  display: flex; 
  align-items: center; 
  gap: 0.75rem; 
  max-width: 12rem; /* FIXED: Reduced width by ~35% */
}
.avatar { 
  width: 2.25rem; height: 2.25rem; border-radius: 50%; 
  object-fit: cover; flex-shrink: 0; 
}
.meta { 
  display: flex; 
  flex-direction: column; 
  line-height: 1.3; 
  min-width: 0; /* Critical for ellipsis to work in flex */
  flex: 1; 
}
.name { font-weight: 600; font-size: 0.85rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.email { font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>