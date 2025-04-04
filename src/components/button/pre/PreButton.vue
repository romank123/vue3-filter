<template>
  <button
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
    :disabled="disabled"
    @click.prevent="$emit('onClick')"
  >
    <slot />
    <span v-if="label" v-html="label" class="ds-button__text"></span>
  </button>
</template>

<script>
export default {
  name: 'PreButton',
  emits: ['onClick'],
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
    disabled: {
      type: Boolean,
      default: false,
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
