<template>
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="rd-icon"
  >
    <mask
      id="a"
      style="mask-type: luminance"
      maskUnits="userSpaceOnUse"
      x="0"
      y="-1"
      width="14"
      height="15"
    >
      <path d="M14 0H0v14h14z" fill="#fff" />
      <path
        d="M7 7v5m0-5 .654.493M7 7V.223h1a3.635 3.635 0 1 1 0 7.27h-.344m0 0 4.936 3.72"
        stroke="#000"
        :stroke-width="strokeWidth"
      />
    </mask>

    <g mask="url(#a)">
      <path d="M1 7a6 6 0 1 0 12 0A6 6 0 0 0 1 7" fill="#2463eb" />
    </g>

    <mask
      id="b"
      style="mask-type: luminance"
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="14"
      height="14"
    >
      <path d="M14 0H0v14h14z" fill="#fff" />
      <path
        d="M7 0v7l5.591 4.213"
        stroke="#000"
        :stroke-width="strokeWidth"
        stroke-linejoin="round"
      />
    </mask>

    <g mask="url(#b)">
      <path
        d="m7 7 1.493 1.125"
        stroke="#2463eb"
        :stroke-width="Number(strokeWidth) + 2"
        stroke-linecap="square"
      />
    </g>
  </svg>
</template>

<script setup>
/**
 * Primary responsibility: provides an inverted variation of the RotaDent logo for specific theme requirements.
 */

// Define component properties with default weight matching the standard icon set.
defineProps({
  strokeWidth: { type: [Number, String], default: 2 }
});
</script>
