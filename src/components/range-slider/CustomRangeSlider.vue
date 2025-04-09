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
          @input="onInputFilter($event, 'first')"
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
        :interval="computedInterval"
        @change="changeSlider"
        v-model="internalValue"
      ></vue-slider>

      <p class="p1-semibold custom-range-slider__input">
        <span>До</span>
        <input
          :style="`width:${
            String(secondInput) ? String(secondInput).length : 0
          }ch`"
          @input="onInputFilter($event, 'second')"
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
      default: 1,
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
      startVal,
      endVal,
    })

    return {
      internalValue: [initialMin, initialMax],
      firstSize: 1,
      secondSize: 1,
      firstInput: initialMin,
      secondInput: initialMax,
    }
  },
  computed: {
    // Вычисляем подходящий интервал в зависимости от типа чисел (целые/дробные)
    computedInterval() {
      const min = parseFloat(this.startValue.value)
      const max = parseFloat(this.endValue.value)
      const range = max - min

      // Проверяем, есть ли дробные числа
      const isDecimal =
        this.hasDecimal(min) ||
        this.hasDecimal(max) ||
        this.hasDecimal(this.intervalValue) ||
        !Number.isInteger(range / this.intervalValue)

      if (isDecimal) {
        // Для дробных чисел вычисляем подходящий интервал с учетом точности
        const precision = this.getMaxPrecision(min, max, this.intervalValue)
        const smallestStep = Math.pow(10, -precision)

        // Убеждаемся, что интервал не меньше минимального шага
        const adjustedInterval = Math.max(
          smallestStep,
          this.adjustIntervalForRange(min, max, this.intervalValue)
        )

        return adjustedInterval
      }

      return this.intervalValue
    },
  },
  watch: {
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
      this.firstSize = this.firstInput
        ? String(this.firstInput).length
        : String(this.startValue.value).length
    },
    secondInput(newVal) {
      this.secondSize = this.secondInput
        ? String(this.secondInput).length
        : String(this.endValue.value).length
    },
  },
  mounted() {
    console.log('CustomRangeSlider - mounted:', {
      internalValue: this.internalValue,
      firstInput: this.firstInput,
      secondInput: this.secondInput,
      computedInterval: this.computedInterval,
    })
  },
  methods: {
    // Новый метод для фильтрации ввода - только цифры, точка и запятая
    onInputFilter(event, inputType) {
      // Разрешаем только цифры, точку и запятую
      const input = event.target
      const value = input.value

      // Заменяем запятую на точку для корректной работы с числами
      if (value.includes(',')) {
        input.value = value.replace(',', '.')

        if (inputType === 'first') {
          this.firstInput = input.value
        } else {
          this.secondInput = input.value
        }
      }

      // Фильтруем недопустимые символы
      const filteredValue = value.replace(/[^0-9.,]/g, '')

      if (value !== filteredValue) {
        input.value = filteredValue

        if (inputType === 'first') {
          this.firstInput = filteredValue
        } else {
          this.secondInput = filteredValue
        }
      }
    },

    // Проверка на наличие дробной части
    hasDecimal(num) {
      return num % 1 !== 0
    },

    // Получение максимальной точности (количество знаков после запятой)
    getMaxPrecision(...numbers) {
      let maxPrecision = 0

      numbers.forEach(num => {
        const strNum = String(num)
        if (strNum.includes('.')) {
          const precision = strNum.split('.')[1].length
          maxPrecision = Math.max(maxPrecision, precision)
        }
      })

      return maxPrecision
    },

    // Корректировка интервала для диапазона значений
    adjustIntervalForRange(min, max, desiredInterval) {
      const range = max - min

      // Если диапазон делится нацело на желаемый интервал, используем его
      if (range % desiredInterval === 0) {
        return desiredInterval
      }

      // Иначе находим наименьший интервал, на который диапазон делится нацело
      const precision = this.getMaxPrecision(min, max, desiredInterval)
      const factor = Math.pow(10, precision)

      // Преобразуем числа в целые для точных вычислений
      const scaledMin = Math.round(min * factor)
      const scaledMax = Math.round(max * factor)
      const scaledRange = scaledMax - scaledMin
      const scaledInterval = Math.round(desiredInterval * factor) || 1

      // Находим наибольший общий делитель для диапазона и интервала
      const gcd = this.findGCD(scaledRange, scaledInterval)

      // Возвращаем скорректированный интервал
      return gcd / factor || desiredInterval
    },

    // Наибольший общий делитель (алгоритм Евклида)
    findGCD(a, b) {
      a = Math.abs(a)
      b = Math.abs(b)

      while (b) {
        const temp = b
        b = a % b
        a = temp
      }

      return a
    },

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
        newValues[0] = this.computeValidValue(
          newValues[1] - this.computedInterval,
          this.computedInterval
        )
      }

      console.log('CustomRangeSlider - changeFirstInput:', newValues)
      this.internalValue = newValues
      this.firstInput = newValues[0] // Обновляем отображаемое значение
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
        newValues[1] = this.computeValidValue(
          newValues[0] + this.computedInterval,
          this.computedInterval
        )
      }

      console.log('CustomRangeSlider - changeSecondInput:', newValues)
      this.internalValue = newValues
      this.secondInput = newValues[1] // Обновляем отображаемое значение
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

    // Вычисление корректного значения с учетом интервала
    computeValidValue(value, interval) {
      const min = parseFloat(this.startValue.value)
      const max = parseFloat(this.endValue.value)

      // Округляем до ближайшего кратного интервалу
      const steps = Math.round((value - min) / interval)
      let result = min + steps * interval

      // Ограничиваем значение диапазоном
      result = Math.max(min, Math.min(max, result))

      // Если есть дробная часть, округляем до той же точности, что и интервал
      const precision = this.getMaxPrecision(interval)
      if (precision > 0) {
        result = parseFloat(result.toFixed(precision))
      }

      return result
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
