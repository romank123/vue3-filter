<template>
  <div
    class="ds-button p1-semibold"
    :class="[
      `_${type}`,
      `_${size}`,
      `_${colorTheme}`,
      {
        '_icon-right': isIconRightSide,
        '_icon-only': label.length === 0,
        '_long-icon': isLongIcon,
      },
    ]"
  >
    <slot />
    <span v-if="label" v-html="label" class="ds-button__text"></span>
  </div>
</template>

<script>
export default {
  name: 'PreWrapper',
  props: {
    label: {
      type: String,
      default: '',
    },
    type: {
      // primary, secondary, outline, ghost
      type: String,
      default: 'primary',
    },
    size: {
      // large, medium
      type: String,
      default: 'large',
    },
    colorTheme: {
      // light, dark
      type: String,
      default: 'light',
    },
    isIconRightSide: {
      type: Boolean,
      dafault: false,
    },
    isLongIcon: {
      type: Boolean,
      dafault: false,
    },
  },
}
</script>
