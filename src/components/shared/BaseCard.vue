<template>
  <div class="base-card rd-card">
    <div v-if="$slots.header" class="card-header rd-card-header">
      <slot name="header" />
    </div>

    <div class="card-body rd-card-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* Specific overrides for the component version of the card.
  The heavy lifting is done by .rd-card in main.css 
*/
.base-card {
  display: flex;
  flex-direction: column;
}

/* Remove header margin if the body follows it, as padding handles it */
.card-header + .card-body {
  border-top: 1px solid #f1f5f9; /* Subtle divider */
}
</style>