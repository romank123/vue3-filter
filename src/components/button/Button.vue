<template>
  <PreButton
    v-if="!href && !styleOnly"
    v-bind="$props"
    @on-click="$emit('onClick')"
  >
    <slot />
  </PreButton>

  <PreLink v-if="href && !styleOnly" v-bind="$props">
    <slot />
  </PreLink>

  <PreWrapper v-if="!href && styleOnly" v-bind="$props">
    <slot />
  </PreWrapper>
</template>

<script>
import { PreButton, PreLink, PreWrapper } from './pre'

export default {
  name: 'Button',
  components: {
    PreButton,
    PreLink,
    PreWrapper,
  },
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
    href: {
      type: String,
      default: '',
    },
    styleOnly: {
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

<style lang="scss">
@import './button.scss';
</style>
