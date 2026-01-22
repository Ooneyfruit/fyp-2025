<script setup>
/**
 * Primary responsibility: provides the standard RotaDent brand logo with dynamic stroke scaling.
 */

// Define component properties with default weight matching the standard icon set.
defineProps({
  strokeWidth: { type: [Number, String], default: 2 }
});
</script>

<template>
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="rd-icon"
  >
    <g clip-path="url(#a)">
      <path
        d="M8 1a7 7 0 0 1 5.59 11.213M8 1a7 7 0 1 0 5.59 11.213M8 1v7l5.59 4.213"
        stroke="#2463eb"
        :stroke-width="strokeWidth"
        stroke-linejoin="round"
      />

      <mask
        id="b"
        style="mask-type: luminance"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="16"
        height="16"
      >
        <path d="M16 0H0v16h16z" fill="#fff" />
        <path
          d="m8 8 1.493 1.125"
          stroke="#000"
          :stroke-width="Number(strokeWidth) + 2"
          stroke-linecap="square"
        />
      </mask>

      <g mask="url(#b)" stroke="#2463eb" :stroke-width="strokeWidth">
        <path d="M8.996 8.299a3.333 3.333 0 1 0 0-6.667" stroke-linecap="round" />
        <path d="M8 8v5" />
      </g>
    </g>

    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
</template>
