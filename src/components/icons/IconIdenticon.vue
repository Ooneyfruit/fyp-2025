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
 * Resolves the shape configuration for a specific entropy value.
 * Extracting this logic reduces the complexity of the main grid loop.
 * @param {number} val - The 4-bit integer representing the cell entropy.
 * @returns {object|null} The shape properties or null if the cell is empty.
 */
const getShapeConfig = (val) => {
  // Logic: 0-5 are empty to ensure whitespace/clarity in the insignia.
  if (val < 6) return null;

  if (val <= 8) {
    return { type: 'rect', props: { x: 0, y: 0, width: 1, height: 1 } };
  }

  if (val <= 10) {
    return { type: 'circle', props: { cx: 0.5, cy: 0.5, r: 0.5 } };
  }

  if (val <= 14) {
    // Logic: create 4 distinct triangle rotations based on the value.
    const rotation = (val - 11) * 90;
    return {
      type: 'path',
      props: { d: 'M 0 0 L 1 0 L 0 1 Z' },
      rotation
    };
  }

  // Value is 15.
  return { type: 'rect', props: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 } };
};

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
      // Logic: mirror columns (0 mirrors 4, 1 mirrors 3).
      const sourceX = x > 2 ? 4 - x : x;
      const cellId = y * 3 + sourceX;

      // Extract 4 bits of entropy per unique cell.
      const val = (h >> cellId) & 15;
      const shape = getShapeConfig(val);

      if (shape) {
        let transform = `translate(${x} ${y})`;

        // Logic: apply rotation if the shape configuration specifies it (e.g., triangles).
        if (shape.rotation !== undefined) {
          transform += ` rotate(${shape.rotation} 0.5 0.5)`;
        }

        row.push({
          type: shape.type,
          props: shape.props,
          transform
        });
      } else {
        row.push({ type: null });
      }
    }
    rows.push(row);
  }
  return rows;
});
</script>

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
