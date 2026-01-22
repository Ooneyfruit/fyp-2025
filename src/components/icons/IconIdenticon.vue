<template>
  <svg
    viewBox="0 0 5 5"
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    shape-rendering="crispEdges"
  >
    <rect width="5" height="5" :fill="theme.bg" />

    <template v-for="(row, y) in grid" :key="y">
      <template v-for="(cell, x) in row" :key="x">
        <g v-if="cell.type" :transform="cell.transform">
          <component :is="cell.type" v-bind="cell.props" :fill="theme.fg" />
        </g>
      </template>
    </template>
  </svg>
</template>

<script setup>
import { computed } from 'vue';

/**
 * Renders a unique, symmetrical insignia based on a seed string.
 * This component generates complex shapes using a mirrored grid and geometric primitives.
 */
const props = defineProps({
  seed: { type: String, required: true }
});

/**
 * Generates a deterministic hash from the seed.
 * @param {string} str - The input identifier.
 * @returns {number} A 32-bit positive integer.
 */
const generateHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

/**
 * Determines the color scheme for the identicon.
 * Logic: uses the hash to pick a primary hue and generates a high-contrast pairing.
 */
const theme = computed(() => {
  const h = generateHash(props.seed);
  const hue = h % 360;
  return {
    bg: `hsl(${hue}, 25%, 94%)`,
    fg: `hsl(${(hue + 160) % 360}, 55%, 40%)`
  };
});

/**
 * Generates the 5x5 mirrored grid data.
 * Logic: generates 3 unique columns and mirrors them to create symmetry.
 */
const grid = computed(() => {
  const h = generateHash(props.seed);
  const rows = [];

  for (let y = 0; y < 5; y++) {
    const row = [];
    for (let x = 0; x < 5; x++) {
      // Mirror columns: 0 mirrors 4, 1 mirrors 3
      const sourceX = x > 2 ? 4 - x : x;
      const cellId = y * 3 + sourceX;

      // Extract 4 bits of entropy per unique cell
      const val = (h >> cellId) & 15;

      // Determine shape type and properties
      let type = null;
      let props = {};
      let transform = '';

      // Logic: 0-5 are empty to ensure whitespace/clarity in the insignia
      if (val >= 6 && val <= 8) {
        type = 'rect';
        props = { x: 0, y: 0, width: 1, height: 1 };
      } else if (val === 9 || val === 10) {
        type = 'circle';
        props = { cx: 0.5, cy: 0.5, r: 0.5 };
      } else if (val >= 11 && val <= 14) {
        type = 'path';
        // Create 4 distinct triangle rotations
        const rot = (val - 11) * 90;
        props = { d: 'M 0 0 L 1 0 L 0 1 Z' };
        transform = `translate(${x} ${y}) rotate(${rot} 0.5 0.5)`;
      } else if (val === 15) {
        type = 'rect';
        props = { x: 0.2, y: 0.2, width: 0.6, height: 0.6 };
      }

      // Finalize coordinates for standard shapes
      if (type !== 'path' && type !== null) {
        transform = `translate(${x} ${y})`;
      }

      row.push({ type, props, transform });
    }
    rows.push(row);
  }
  return rows;
});
</script>
