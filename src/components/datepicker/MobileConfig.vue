<template>
  <div class="ds-datepicker__trigger-wrap">
    <button
      class="ds-datepicker__trigger"
      :class="{ active: datepickerVisible, hasValue: value }"
      @click.prevent="showModal"
    >
      <span>{{ placeholder }}</span>
    </button>
    <div
      v-if="!value && placeholder === 'Поиск по дате'"
      class="ds-datepicker__icon"
      @click.prevent="showModal"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_2108_8661)">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.66797 0.666992C5.03616 0.666992 5.33464 0.965469 5.33464 1.33366V2.00033H10.668V1.33366C10.668 0.965469 10.9664 0.666992 11.3346 0.666992C11.7028 0.666992 12.0013 0.965469 12.0013 1.33366V2.00033H14.0619C14.697 2.00033 15.3346 2.47868 15.3346 3.21245V14.1215C15.3346 14.8553 14.697 15.3337 14.0619 15.3337H1.9407C1.3056 15.3337 0.667969 14.8553 0.667969 14.1215V3.21245C0.667969 2.47868 1.3056 2.00033 1.9407 2.00033H4.0013V1.33366C4.0013 0.965469 4.29978 0.666992 4.66797 0.666992ZM4.0013 3.33366H2.0013V6.00033H14.0013V3.33366H12.0013V4.00033C12.0013 4.36852 11.7028 4.66699 11.3346 4.66699C10.9664 4.66699 10.668 4.36852 10.668 4.00033V3.33366H5.33464V4.00033C5.33464 4.36852 5.03616 4.66699 4.66797 4.66699C4.29978 4.66699 4.0013 4.36852 4.0013 4.00033V3.33366ZM14.0013 7.33366H2.0013V14.0003H14.0013V7.33366Z"
            fill="#252628"
          />
        </g>
        <defs>
          <clipPath id="clip0_2108_8661">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
    <div v-else class="ds-datepicker__clear">
      <btn-clear @clear-event="clearDate" />
    </div>
  </div>

  <div v-if="datepickerVisible" class="ds-datepicker__modal">
    <div
      class="ds-datepicker__modal-overlay"
      :class="{ active: activeModal }"
      aria-label="Закрыть модальное окно"
      @click="hideModal"
    ></div>
    <div class="ds-datepicker__modal-wrapper" :class="{ active: activeModal }">
      <div
        class="ds-datepicker__modal-header"
        aria-label="Закрыть модальное окно"
        @click.prevent="hideModal"
      >
        <div class="ds-datepicker__modal-title">
          {{ placeholder }}
        </div>
        <button class="ds-datepicker__modal-close"></button>
      </div>
      <div class="ds-datepicker__modal-scroll">
        <div class="ds-datepicker__modal-content">
          <VueDatePicker
            v-model="value"
            locale="ru"
            :start-date="minDate"
            :min-date="minDate"
            :max-date="maxDate"
            :range="isRange"
            inline
            :enable-time-picker="false"
            @date-update="enterBtnDisabled = false"
            @range-start="enterBtnDisabled = false"
            @closed="
              value ? (enterBtnDisabled = false) : (enterBtnDisabled = true)
            "
            ref="datepicker"
          >
            <template #action-buttons>
              <div class="ds-datepicker__btn">
                <Button
                  :type="'outline'"
                  :label="'Сбросить'"
                  :disabled="value ? false : true"
                  :color-theme="colorTheme"
                  @on-click="clearDate"
                />
              </div>
              <div class="ds-datepicker__btn">
                <Button
                  :type="'primary'"
                  :label="'Применить'"
                  :disabled="enterBtnDisabled"
                  :color-theme="colorTheme"
                  @on-click="selectDate"
                />
              </div>
            </template>
          </VueDatePicker>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

import { Button, BtnClear } from '@/components/'

export default {
  components: {
    VueDatePicker,
    Button,
    BtnClear,
  },
  props: {
    minDate: {
      type: String,
      default: '',
    },
    maxDate: {
      type: String,
      default: '',
    },
    colorTheme: {
      type: String,
      default: 'light',
    },
    isRange: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      datepickerVisible: false,
      value: null,
      placeholder: 'Поиск по дате',
      activeModal: false,
      enterBtnDisabled: true,
    }
  },
  methods: {
    clearDate() {
      if (this.$refs.datepicker) {
        this.$refs.datepicker.clearValue()
      } else {
        this.value = null
      }

      this.enterBtnDisabled = true
      this.placeholder = 'Поиск по дате'
      this.$emit('change-date', this.value, null)
      this.hideModal()
    },

    selectDate() {
      this.$refs.datepicker.selectDate()

      let value = this.value

      if (!this.isRange) {
        value = [this.value]
      }

      if (value[1] && this.formatDate(value[0]) !== this.formatDate(value[1])) {
        this.placeholder =
          this.formatDate(value[0], true) +
          ' - ' +
          this.formatDate(value[1], true)
      } else {
        this.placeholder = this.formatDate(value[0])
      }
      this.$emit('change-date', value, this.placeholder)
      this.hideModal()
    },

    formatDate(date, monthNumeric = false) {
      let monthFormat = 'long'
      if (monthNumeric) {
        monthFormat = 'numeric'
      }
      const options = {
        year: 'numeric',
        month: monthFormat,
        day: 'numeric',
      }

      return date.toLocaleString('ru', options)
    },

    hideModal() {
      this.activeModal = false
      setTimeout(() => {
        this.datepickerVisible = false
      }, 300)
    },
    showModal() {
      this.datepickerVisible = true
      setTimeout(() => {
        this.activeModal = true
      }, 100)
    },
  },
}
</script>
