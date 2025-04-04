<template>
  <a
    :href="href"
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
  </a>
</template>

<script>
export default {
  name: 'PreLink',
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
    href: {
      type: String,
      default: '',
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
