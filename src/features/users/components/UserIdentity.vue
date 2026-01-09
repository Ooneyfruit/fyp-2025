<template>
  <div class="user-info">
    <div class="avatar-wrapper">
      <img 
        v-if="profile?.profile_image" 
        :src="profile.profile_image" 
        class="avatar" 
        alt="User profile"
      />
      <div v-else class="avatar identicon" v-html="generateIdenticon(profile?.id || 'default')" />
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

<script setup>
/**
 * Displays user identity with dynamic avatar logic.
 * Logic: uses profile_image if available, otherwise generates an SVG identicon.
 */
defineProps({ 
  profile: { type: Object, default: () => ({}) }
});

/**
 * Generates a deterministic SVG identicon based on a string seed.
 * @param {string} seed - The unique identifier used to generate the pattern.
 * @returns {string} SVG path string.
 */
const generateIdenticon = (seed) => {
  // Logic: generate a simple geometric pattern based on the character codes of the seed.
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${Math.abs(hash % 360)}, 65%, 55%)`;
  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" fill="${color}" opacity="0.15"/>
    <circle cx="20" cy="15" r="7" fill="${color}"/>
    <path d="M5 35C5 27 12 24 20 24s15 3 15 11" fill="${color}"/>
  </svg>`;
};
</script>

<style scoped>
.user-info { display: flex; align-items: center; gap: 0.75rem; width: 100%; min-width: 6rem; }
.avatar-wrapper { flex-shrink: 0; width: 2.25rem; height: 2.25rem; }
.avatar { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; overflow: hidden; }
.identicon { background: var(--bg-app); border: 1px solid var(--border-color); }
.meta { display: flex; flex-direction: column; line-height: 1.3; min-width: 0; flex: 1; }
.name, .email { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
.name { font-weight: 600; font-size: 0.85rem; color: var(--text-main); }
.email { font-size: 0.7rem; color: var(--text-muted); }
</style>