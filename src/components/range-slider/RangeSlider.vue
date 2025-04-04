<template>
  <div :class="isDisabled ? 'disabled' : ''">
    <p class="p2-medium ds-range-slider__label" v-html="label"></p>
    <div class="ds-range-slider">
      <p class="p1-semibold ds-range-slider__input">
        <span>От</span>
        <input
          id="first"
          :style="`width:${
            String(firstInput) ? String(firstInput).length : 0
          }ch`"
          ref="first"
          v-model="firstInput"
          @keydown.enter="changeFirstInput"
          :size="firstSize"
        />
      </p>
      <vue-slider
        :min="startValue.value"
        :max="endValue.value"
        :dot-attrs="{ 'aria-label': 'Этаж' }"
        :tooltip="'active'"
        ref="slider"
        :lazy="true"
        :interval="intervalValue"
        @change="changeSlider"
        v-model="value"
      ></vue-slider>

      <p class="p1-semibold ds-range-slider__input">
        <span>До</span>
        <input
          :style="`width:${
            String(secondInput) ? String(secondInput).length : 0
          }ch`"
          @keydown.enter="changeSecondInput"
          v-model="secondInput"
          ref="second"
        />
      </p>
      <div class="ds-range-slider__info-container">
        <p
          class="p3-medium"
          v-html="startValue.value + ' ' + startValue.description"
        ></p>
        <p
          class="p3-medium"
          v-html="middleValue.value + ' ' + middleValue.description"
        ></p>
        <p
          class="p3-medium"
          v-html="endValue.value + ' ' + endValue.description"
        ></p>
      </div>
    </div>
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component'

export default {
  name: 'RangeSlider',
  components: {
    VueSlider,
  },
  data() {
    return {
      value: [this.startValue.value, this.endValue.value],
      firstSize: 1,
      secondSize: 1,
      firstInput: '0',
      secondInput: '10',
      maxCount: 10000,
      minCount: 0,
    }
  },
  mounted() {
    this.firstInput = this.$props.startValue.value
    this.secondInput = this.$props.endValue.value
  },
  props: {
    label: {
      type: String,
      required: true,
      default: 'Caption medium',
    },
    intervalValue: {
      type: Number,
      required: true,
      default: 0.1,
    },
    startValue: {
      type: Object,
      required: true,
      default: function () {
        return {
          value: '17',
          description: 'тыс.',
        }
      },
    },
    middleValue: {
      type: Object,
      required: true,
      default: function () {
        return {
          value: '15',
          description: 'млн',
        }
      },
    },
    endValue: {
      type: Object,
      required: true,
      default: function () {
        return {
          value: '30',
          description: 'млн',
        }
      },
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    firstInput(newVal) {
      if (newVal < this.startValue.value) {
        this.firstInput = this.startValue.value
      }
      this.firstSize = this.firstInput
        ? this.firstInput.length
        : this.startValue.value.length
    },
    secondInput(newVal) {
      if (newVal > this.endValue.value) {
        this.secondInput = this.endValue.value
      }
      this.secondSize = this.secondInput
        ? this.secondInput.length
        : this.endValue.value.length
    },
  },
  methods: {
    changeFirstInput(newVal) {
      const data = this.$refs.slider.getValue()
      data[0] = this.firstInput
      this.$refs.slider.setValue(data)
      this.$emit('click', data)
    },
    changeSecondInput(newVal) {
      const data = this.$refs.slider.getValue()
      data[1] = this.secondInput
      this.$refs.slider.setValue(data)
      this.$emit('click', data)
    },
    changeSlider(data) {
      const [start, end] = data
      this.firstInput = start
      this.secondInput = end
      this.$emit('click', data)
    },
    changeInput(buffer, newData) {
      buffer = newData
    },
  },
  emits: ['click'],
  setup(props, { emit }) {},
}
</script>

<style lang="scss">
@import 'vue-slider-component/theme/default.css';
@import './range-slider.scss';
</style>
