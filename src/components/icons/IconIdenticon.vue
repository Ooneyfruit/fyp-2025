<script setup lang="ts">
/**
 * Changeable icon dependent on a seed string.
 * Renders a unique, symmetrical insignia based on a seed string.
 * Refactored to use a "Greedy Meshing" algorithm to merge adjacent shapes into a single SVG path.
 * Includes precision rounding to prevent sub-pixel rendering artifacts.
 */
import { computed } from 'vue';

const HASH_SHIFT = 5;
const HUE_RANGE = 360;
const HUE_OFFSET = 160;
const GRID_SIZE = 5;
const PIVOT_INDEX = 2; // Centre column index for mirroring.
const UNIQUE_COLS = 3; // Number of unique columns before mirroring.
const ENTROPY_MASK = 15;

// Shape generation constants.
const SHAPE_MIN_VAL = 6;
const SHAPE_RECT_LIMIT = 8;
const SHAPE_CIRCLE_LIMIT = 10;
const SHAPE_TRI_LIMIT = 14;
const TRIANGLE_ROTATION_BASE = 11;
const TRIANGLE_ROTATION_STEP = 90;

// Geometry constants to avoid magic numbers.
const HALF_CELL = 0.5;
const HALF_TURN_DEGREES = 180;
const SMALL_RECT_INSET = 0.2;
const SMALL_RECT_SIZE = 0.6;
const TRIANGLE_VERTICES = 3;
const COORD_PRECISION = 3;

/**
 * Internal enumeration for shape types to assist the meshing algorithm.
 */
enum ShapeType {
  None,
  FullRect,
  Circle,
  Triangle,
  SmallRect
}

interface GridCellData {
  type: ShapeType;
  rotation: number; // In degrees
}

interface Point {
  x: number;
  y: number;
}

const props = defineProps<{
  seed: string;
}>();

/**
 * Rounds a number to a fixed precision to avoid floating point artifacts in SVG.
 * E.g., 0.99999999999 becomes 1.
 * @param n - The number to round.
 * @returns The rounded number.
 */
const rnd = (n: number): number => {
  return Number.parseFloat(n.toFixed(COORD_PRECISION));
};

/**
 * Generates a deterministic hash from the seed.
 * @param str - The input identifier.
 * @returns A 32-bit positive integer.
 */
const generateHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.codePointAt(i) || 0;
    hash = (hash << HASH_SHIFT) - hash + code;
    hash = Math.trunc(hash);
  }
  return Math.abs(hash);
};

/**
 * Determines the colour scheme for the identicon.
 * @returns An object containing the background and foreground CSS colour strings.
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
 * Decodes the hash value into a specific shape configuration.
 * @param val - The 4-bit integer representing the cell entropy.
 * @returns The geometric configuration for the cell.
 */
const getShapeData = (val: number): GridCellData => {
  if (val < SHAPE_MIN_VAL) {
    return { type: ShapeType.None, rotation: 0 };
  }
  if (val <= SHAPE_RECT_LIMIT) {
    return { type: ShapeType.FullRect, rotation: 0 };
  }
  if (val <= SHAPE_CIRCLE_LIMIT) {
    return { type: ShapeType.Circle, rotation: 0 };
  }
  if (val <= SHAPE_TRI_LIMIT) {
    const rotation = (val - TRIANGLE_ROTATION_BASE) * TRIANGLE_ROTATION_STEP;
    return { type: ShapeType.Triangle, rotation };
  }
  // Value is 15
  return { type: ShapeType.SmallRect, rotation: 0 };
};

/**
 * Builds the abstract 5x5 grid of shapes based on the hash.
 * @param hash - The deterministic hash derived from the seed.
 * @returns A 2D array of grid cell data.
 */
const generateGrid = (hash: number): GridCellData[][] => {
  const grid: GridCellData[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ type: ShapeType.None, rotation: 0 }))
  );

  for (let y = 0; y < GRID_SIZE; y++) {
    const row = grid[y]!;
    for (let x = 0; x < GRID_SIZE; x++) {
      // Mirroring logic: Columns 3 and 4 mirror 1 and 0.
      const sourceX = x > PIVOT_INDEX ? GRID_SIZE - 1 - x : x;
      const cellId = y * UNIQUE_COLS + sourceX;
      const val = (hash >> cellId) & ENTROPY_MASK;
      row[x] = getShapeData(val);
    }
  }
  return grid;
};

/**
 * Calculates the maximum width for a mergeable rectangle starting at (x,y).
 * @param x - The starting x-coordinate of the potential merge.
 * @param y - The starting y-coordinate of the potential merge.
 * @param grid - The complete grid data structure.
 * @param visited - The matrix of cells that have already been processed.
 * @returns The width (number of cells) of the mergeable area.
 */
const getMergeWidth = (
  x: number,
  y: number,
  grid: GridCellData[][],
  visited: boolean[][]
): number => {
  let width = 1;
  while (
    x + width < GRID_SIZE &&
    grid[y]?.[x + width]?.type === ShapeType.FullRect &&
    !visited[y]?.[x + width]
  ) {
    width++;
  }
  return width;
};

/**
 * Checks if a row segment can be added to the current merge block.
 * @param x - The starting x-coordinate of the block.
 * @param y - The starting y-coordinate of the block.
 * @param currentHeight - The current height offset being checked.
 * @param width - The determined width of the block.
 * @param grid - The complete grid data structure.
 * @param visited - The matrix of cells that have already been processed.
 * @returns True if the row segment matches the block criteria, otherwise false.
 */
const canExtendHeight = (
  x: number,
  y: number,
  currentHeight: number,
  width: number,
  grid: GridCellData[][],
  visited: boolean[][]
): boolean => {
  const checkY = y + currentHeight;
  if (checkY >= GRID_SIZE) {
    return false;
  }

  for (let k = 0; k < width; k++) {
    if (grid[checkY]?.[x + k]?.type !== ShapeType.FullRect || visited[checkY]?.[x + k]) {
      return false;
    }
  }
  return true;
};

/**
 * Calculates the maximum height for a mergeable rectangle given a fixed width.
 * @param x - The starting x-coordinate of the block.
 * @param y - The starting y-coordinate of the block.
 * @param width - The confirmed width of the block.
 * @param grid - The complete grid data structure.
 * @param visited - The matrix of cells that have already been processed.
 * @returns The height (number of cells) of the mergeable area.
 */
const getMergeHeight = (
  x: number,
  y: number,
  width: number,
  grid: GridCellData[][],
  visited: boolean[][]
): number => {
  let height = 1;
  while (canExtendHeight(x, y, height, width, grid, visited)) {
    height++;
  }
  return height;
};

/**
 * Marks a block of cells as visited.
 * @param x - The starting x-coordinate.
 * @param y - The starting y-coordinate.
 * @param width - The width of the block to mark.
 * @param height - The height of the block to mark.
 * @param visited - The visited state matrix to update.
 */
const markVisited = (
  x: number,
  y: number,
  width: number,
  height: number,
  visited: boolean[][]
): void => {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const row = visited[y + dy];
      if (row) {
        row[x + dx] = true;
      }
    }
  }
};

/**
 * Orchestrates the greedy meshing for a rectangle and returns its path.
 * Refactored to reduce cognitive complexity.
 * @param x - The starting x-coordinate.
 * @param y - The starting y-coordinate.
 * @param grid - The complete grid data.
 * @param visited - The state map of processed cells.
 * @returns The SVG path string for the merged rectangle.
 */
const getMergedRectPath = (
  x: number,
  y: number,
  grid: GridCellData[][],
  visited: boolean[][]
): string => {
  const width = getMergeWidth(x, y, grid, visited);
  const height = getMergeHeight(x, y, width, grid, visited);

  markVisited(x, y, width, height, visited);

  // Use rounding to ensure clean coordinates
  const x1 = rnd(x);
  const y1 = rnd(y);
  const x2 = rnd(x + width);
  const y2 = rnd(y + height);

  return `M${x1},${y1} L${x2},${y1} L${x2},${y2} L${x1},${y2} Z `;
};

/**
 * Rotate a point around a center (0.5, 0.5) and translate to grid position (x, y).
 * @param p - The point to transform.
 * @param angleDeg - Rotation angle in degrees.
 * @param x - Grid x offset.
 * @param y - Grid y offset.
 * @returns The transformed point.
 */
const transformPoint = (p: Point, angleDeg: number, x: number, y: number): Point => {
  const rad = (angleDeg * Math.PI) / HALF_TURN_DEGREES;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const px = p.x - HALF_CELL;
  const py = p.y - HALF_CELL;

  const rx = px * cos - py * sin;
  const ry = px * sin + py * cos;

  return {
    x: rx + HALF_CELL + x,
    y: ry + HALF_CELL + y
  };
};

/**
 * Generates the SVG path for non-mergeable shapes (Circle, Triangle, SmallRect).
 * @param x - The x-coordinate.
 * @param y - The y-coordinate.
 * @param cell - The cell data containing type and rotation.
 * @returns The SVG path string.
 */
const getStandardShapePath = (x: number, y: number, cell: GridCellData): string => {
  switch (cell.type) {
    case ShapeType.SmallRect: {
      const rx = rnd(x + SMALL_RECT_INSET);
      const ry = rnd(y + SMALL_RECT_INSET);
      const s = rnd(SMALL_RECT_SIZE);
      return `M${rx},${ry} h${s} v${s} h-${s} Z `;
    }
    case ShapeType.Circle: {
      const cx = rnd(x + HALF_CELL);
      const cy = rnd(y + HALF_CELL);
      const r = rnd(HALF_CELL);
      // Draw two semicircles
      return `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy} Z `;
    }
    case ShapeType.Triangle: {
      const points: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 }
      ];
      const tp = points.map((p) => transformPoint(p, cell.rotation, x, y));
      if (tp.length !== TRIANGLE_VERTICES) break;
      const [p1, p2, p3] = tp;
      return `M${rnd(p1!.x)},${rnd(p1!.y)} L${rnd(p2!.x)},${rnd(p2!.y)} L${rnd(p3!.x)},${rnd(p3!.y)} Z `;
    }
  }
  return '';
};

/**
 * Processes a single cell and determines which path generation strategy to use.
 * Helper function to reduce the complexity of the main loop.
 * @param x - The x-coordinate of the cell.
 * @param y - The y-coordinate of the cell.
 * @param grid - The complete grid data structure.
 * @param visited - The matrix of cells that have already been processed.
 * @returns The SVG path command for this cell or merged block.
 */
const processCell = (
  x: number,
  y: number,
  grid: GridCellData[][],
  visited: boolean[][]
): string => {
  if (visited[y]?.[x]) {
    return '';
  }

  const cell = grid[y]?.[x];

  if (!cell || cell.type === ShapeType.None) {
    markVisited(x, y, 1, 1, visited);
    return '';
  }

  if (cell.type === ShapeType.FullRect) {
    return getMergedRectPath(x, y, grid, visited);
  }

  markVisited(x, y, 1, 1, visited);
  return getStandardShapePath(x, y, cell);
};

/**
 * Generates the flattened SVG Path Data string from a grid model.
 * Implements "Greedy Meshing" to optimize rendering performance and visual quality.
 * @param grid - The grid data structure to process.
 * @returns The final SVG path data string.
 */
const generatePathFromGrid = (grid: GridCellData[][]): string => {
  const visited: boolean[][] = Array.from({ length: GRID_SIZE }, (): boolean[] =>
    Array.from({ length: GRID_SIZE }, () => false)
  );

  let d = '';

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      d += processCell(x, y, grid, visited);
    }
  }

  return d;
};

/**
 * Generates the flattened SVG Path Data string for the entire grid.
 * This is a computed property that reacts to changes in the seed.
 */
const combinedPath = computed(() => {
  const h = generateHash(props.seed);
  const grid = generateGrid(h);
  return generatePathFromGrid(grid);
});
</script>

<template>
  <svg height="100%" viewBox="0 0 5 5" width="100%" xmlns="http://www.w3.org/2000/svg">
    <rect :fill="theme.bg" height="5" width="5" />

    <path :d="combinedPath" :fill="theme.fg" />
  </svg>
</template>
