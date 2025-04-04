<template>
  <div :class="isDisabled ? 'disabled' : ''">
    <p class="p2-medium custom-range-slider__label" v-html="label"></p>
    <div class="custom-range-slider">
      <p class="p1-semibold custom-range-slider__input">
        <span>От</span>
        <input
          id="first"
          :style="`width:${
            String(firstInput) ? String(firstInput).length : 0
          }ch`"
          ref="first"
          v-model="firstInput"
          @change="changeFirstInput"
          :size="firstSize"
        />
      </p>
      <vue-slider
        :min="startValue.value"
        :max="endValue.value"
        :dot-attrs="{ 'aria-label': 'Диапазон' }"
        :tooltip="'active'"
        ref="slider"
        :lazy="true"
        :interval="intervalValue"
        @change="changeSlider"
        v-model="internalValue"
      ></vue-slider>

      <p class="p1-semibold custom-range-slider__input">
        <span>До</span>
        <input
          :style="`width:${
            String(secondInput) ? String(secondInput).length : 0
          }ch`"
          @change="changeSecondInput"
          v-model="secondInput"
          ref="second"
        />
      </p>
      <div class="custom-range-slider__info-container">
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
  name: 'CustomRangeSlider',
  components: {
    VueSlider,
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
          value: 0,
          description: 'тыс.',
        }
      },
    },
    middleValue: {
      type: Object,
      required: true,
      default: function () {
        return {
          value: 50,
          description: 'млн',
        }
      },
    },
    endValue: {
      type: Object,
      required: true,
      default: function () {
        return {
          value: 100,
          description: 'млн',
        }
      },
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    // Новое свойство для начальных значений
    initialValues: {
      type: Array,
      default: function () {
        return null
      },
    },
    // Значение модели для двусторонней привязки
    modelValue: {
      type: Array,
      default: function () {
        return null
      },
    },
  },
  data() {
    // Преобразуем начальные значения в правильный тип данных
    const startVal = parseFloat(this.startValue.value)
    const endVal = parseFloat(this.endValue.value)

    // Используем initialValues, если они предоставлены, иначе используем startVal и endVal
    const initialMin = this.initialValues
      ? parseFloat(this.initialValues[0])
      : startVal
    const initialMax = this.initialValues
      ? parseFloat(this.initialValues[1])
      : endVal

    console.log('CustomRangeSlider - начальные значения:', {
      startValue: startVal,
      endValue: endVal,
      initialMin,
      initialMax,
    })

    return {
      internalValue: [initialMin, initialMax],
      firstSize: 1,
      secondSize: 1,
      firstInput: initialMin,
      secondInput: initialMax,
      maxCount: 10000,
      minCount: 0,
    }
  },
  watch: {
    // Следим за изменениями initialValues
    initialValues: {
      handler(newValues) {
        if (newValues && Array.isArray(newValues) && newValues.length === 2) {
          const min = parseFloat(newValues[0])
          const max = parseFloat(newValues[1])
          console.log('CustomRangeSlider - изменение initialValues:', {
            min,
            max,
          })

          if (!isNaN(min) && !isNaN(max)) {
            this.internalValue = [min, max]
            this.firstInput = min
            this.secondInput = max
          }
        }
      },
      deep: true,
    },
    // Следим за изменениями modelValue
    modelValue: {
      handler(newValues) {
        if (newValues && Array.isArray(newValues) && newValues.length === 2) {
          const min = parseFloat(newValues[0])
          const max = parseFloat(newValues[1])
          console.log('CustomRangeSlider - изменение modelValue:', { min, max })

          if (!isNaN(min) && !isNaN(max)) {
            // Проверяем, действительно ли значения изменились
            if (
              min !== this.internalValue[0] ||
              max !== this.internalValue[1]
            ) {
              this.internalValue = [min, max]
              this.firstInput = min
              this.secondInput = max
            }
          }
        }
      },
      deep: true,
    },
    // Отслеживаем внутренние изменения для обновления inputs
    internalValue: {
      handler(newValues) {
        if (newValues && Array.isArray(newValues) && newValues.length === 2) {
          const min = parseFloat(newValues[0])
          const max = parseFloat(newValues[1])

          if (!isNaN(min) && !isNaN(max)) {
            this.firstInput = min
            this.secondInput = max
            console.log('CustomRangeSlider - обновление inputValues:', {
              min,
              max,
            })
            this.$emit('update:modelValue', [min, max])
            this.$emit('change', [min, max])
          }
        }
      },
      deep: true,
    },
    firstInput(newVal) {
      if (newVal < this.startValue.value) {
        this.firstInput = this.startValue.value
      }
      this.firstSize = this.firstInput
        ? String(this.firstInput).length
        : String(this.startValue.value).length
    },
    secondInput(newVal) {
      if (newVal > this.endValue.value) {
        this.secondInput = this.endValue.value
      }
      this.secondSize = this.secondInput
        ? String(this.secondInput).length
        : String(this.endValue.value).length
    },
  },
  mounted() {
    // Инициализация значений при монтировании
    // Всегда преобразуем значения через parseFloat для корректного отображения
    if (
      this.initialValues &&
      Array.isArray(this.initialValues) &&
      this.initialValues.length === 2
    ) {
      const min = parseFloat(this.initialValues[0])
      const max = parseFloat(this.initialValues[1])

      if (!isNaN(min) && !isNaN(max)) {
        this.internalValue = [min, max]
        this.firstInput = min
        this.secondInput = max
      }
    } else {
      const startVal = parseFloat(this.startValue.value)
      const endVal = parseFloat(this.endValue.value)

      if (!isNaN(startVal) && !isNaN(endVal)) {
        this.internalValue = [startVal, endVal]
        this.firstInput = startVal
        this.secondInput = endVal
      }
    }

    console.log('CustomRangeSlider - mounted:', {
      internalValue: this.internalValue,
      firstInput: this.firstInput,
      secondInput: this.secondInput,
    })
  },
  methods: {
    changeFirstInput() {
      if (!this.$refs.slider) return

      let newMin = parseFloat(this.firstInput)
      if (isNaN(newMin)) newMin = parseFloat(this.startValue.value)

      const newValues = [...this.internalValue]
      newValues[0] = newMin

      // Проверка границ
      const minVal = parseFloat(this.startValue.value)
      if (newValues[0] < minVal) {
        newValues[0] = minVal
      }

      if (newValues[0] >= newValues[1]) {
        newValues[0] = newValues[1] - this.intervalValue
      }

      console.log('CustomRangeSlider - changeFirstInput:', newValues)
      this.internalValue = newValues
      this.$emit('update:modelValue', newValues)
      this.$emit('change', newValues)
    },

    changeSecondInput() {
      if (!this.$refs.slider) return

      let newMax = parseFloat(this.secondInput)
      if (isNaN(newMax)) newMax = parseFloat(this.endValue.value)

      const newValues = [...this.internalValue]
      newValues[1] = newMax

      // Проверка границ
      const maxVal = parseFloat(this.endValue.value)
      if (newValues[1] > maxVal) {
        newValues[1] = maxVal
      }

      if (newValues[1] <= newValues[0]) {
        newValues[1] = newValues[0] + this.intervalValue
      }

      console.log('CustomRangeSlider - changeSecondInput:', newValues)
      this.internalValue = newValues
      this.$emit('update:modelValue', newValues)
      this.$emit('change', newValues)
    },

    changeSlider(values) {
      if (!values || !Array.isArray(values) || values.length !== 2) return

      const min = parseFloat(values[0])
      const max = parseFloat(values[1])

      if (!isNaN(min) && !isNaN(max)) {
        this.firstInput = min
        this.secondInput = max
        console.log('CustomRangeSlider - changeSlider:', [min, max])
        this.$emit('update:modelValue', [min, max])
        this.$emit('change', [min, max])
      }
    },
  },
  emits: ['update:modelValue', 'change'],
}
</script>

<style lang="scss">
@import 'vue-slider-component/theme/default.css';
@import './range-slider.scss';

/* Переопределим некоторые стили для нашего кастомного слайдера */
.custom-range-slider {
  position: relative;
  display: flex;
  padding: 12px 24px;
  max-width: 348px;
  border-radius: 100px;
  border: 1px solid var(--delacroix, #c8c8cb);
  justify-content: space-between;

  p {
    display: flex;
  }

  &__label {
    margin-bottom: 4px;
  }

  input {
    outline: none;
    border: none;
    text-align: center;
  }

  &__info-container {
    display: flex;
    justify-content: space-between;
    position: absolute;
    bottom: -27px !important;
    left: 0;
    width: 100%;

    p {
      color: var(--vinci, #999999);
    }
  }
}
</style>
