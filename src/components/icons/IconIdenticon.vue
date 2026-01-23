<script setup>
import { computed } from 'vue';

const HASH_SHIFT = 5;
const HUE_RANGE = 360;
const HUE_OFFSET = 160;
const GRID_SIZE = 5;
const PIVOT_INDEX = 2; // Center column index for mirroring.
const UNIQUE_COLS = 3; // Number of unique columns before mirroring.
const ENTROPY_MASK = 15;

// Shape generation constants.
const SHAPE_MIN_VAL = 6;
const SHAPE_RECT_LIMIT = 8;
const SHAPE_CIRCLE_LIMIT = 10;
const SHAPE_TRI_LIMIT = 14;
const TRIANGLE_ROTATION_BASE = 11;
const TRIANGLE_ROTATION_STEP = 90;

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
    const code = str.codePointAt(i) || 0;
    hash = (hash << HASH_SHIFT) - hash + code;
    hash = Math.trunc(hash);
  }
  return Math.abs(hash);
};

/**
 * Determines the color scheme for the identicon.
 * Logic: uses the hash to pick a primary hue and generates a high-contrast pairing.
 */
const theme = computed(() => {
  const h = generateHash(props.seed);
  const hue = h % HUE_RANGE;
  const fgHue = (hue + HUE_OFFSET) % HUE_RANGE;

  return {
    bg: `hsl(${hue}, 25%, 94%)`,
    fg: `hsl(${fgHue}, 55%, 40%)`
  };
});

/**
 * Shape configuration object.
 * @typedef {object} ShapeConfig
 * @property {string} type - The SVG element type (rect, circle, path).
 * @property {object} props - The attributes for the SVG element.
 * @property {number} [rotation] - Optional rotation degrees.
 */

/**
 * Grid cell configuration object.
 * @typedef {object} GridCell
 * @property {string} id - Unique identifier for the cell.
 * @property {string} type - The SVG element type.
 * @property {object} props - The attributes for the SVG element.
 * @property {string} transform - SVG transform string.
 */

/**
 * Resolves the shape configuration for a specific entropy value.
 * Extracting this logic reduces the complexity of the main grid loop.
 * @param {number} val - The 4-bit integer representing the cell entropy.
 * @returns {ShapeConfig|null} The shape properties or null if the cell is empty.
 */
const getShapeConfig = (val) => {
  // Logic: 0-5 are empty to ensure whitespace/clarity in the insignia.
  if (val < SHAPE_MIN_VAL) return null;

  if (val <= SHAPE_RECT_LIMIT) {
    return { type: 'rect', props: { x: 0, y: 0, width: 1, height: 1 } };
  }

  if (val <= SHAPE_CIRCLE_LIMIT) {
    return { type: 'circle', props: { cx: 0.5, cy: 0.5, r: 0.5 } };
  }

  if (val <= SHAPE_TRI_LIMIT) {
    // Logic: create 4 distinct triangle rotations based on the value.
    const rotation = (val - TRIANGLE_ROTATION_BASE) * TRIANGLE_ROTATION_STEP;
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
 * Generates the render data for a specific grid cell.
 * @param {number} x - The x-coordinate on the grid.
 * @param {number} y - The y-coordinate on the grid.
 * @param {number} hash - The pre-calculated hash.
 * @returns {GridCell|null} The cell render object or null if empty.
 */
const generateCell = (x, y, hash) => {
  // Logic: mirror columns (0 mirrors 4, 1 mirrors 3).
  const sourceX = x > PIVOT_INDEX ? GRID_SIZE - 1 - x : x;
  const cellId = y * UNIQUE_COLS + sourceX;

  // Extract 4 bits of entropy per unique cell.
  const val = (hash >> cellId) & ENTROPY_MASK;
  const shape = getShapeConfig(val);

  if (!shape) return null;

  let transform = `translate(${x} ${y})`;

  // Logic: apply rotation if the shape configuration specifies it (e.g., triangles).
  if (shape.rotation !== undefined) {
    transform += ` rotate(${shape.rotation} 0.5 0.5)`;
  }

  return {
    id: `${x}-${y}`,
    type: shape.type,
    props: shape.props,
    transform
  };
};

/**
 * Generates the flattened list of cells for the 5x5 grid.
 * Logic: returns a flat array to avoid nested templates and reduce loop depth.
 */
const cells = computed(() => {
  const h = generateHash(props.seed);
  /** @type {GridCell[]} */
  const list = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = generateCell(x, y, h);
      if (cell) {
        list.push(cell);
      }
    }
  }
  return list;
});
</script>

<template>
  <svg
    height="100%"
    shape-rendering="crispEdges"
    viewBox="0 0 5 5"
    width="100%"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect :fill="theme.bg" height="5" width="5" />

    <g v-for="cell in cells" :key="cell.id" :transform="cell.transform">
      <component :is="cell.type" v-bind="cell.props" :fill="theme.fg" />
    </g>
  </svg>
</template>
