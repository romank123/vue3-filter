<template>
  <header>
    <div class="wrapper"></div>
  </header>

  <main>
    <div class="filter-title">Коммерческие помещения</div>

    <!-- Табы фильтрации по статусу -->
    <div class="status-tabs">
      <button
        class="status-tab"
        :class="{ active: catalogStore.selectedStatusTab === 'all' }"
        @click="setStatusTab('all')"
      >
        Все
      </button>
      <button
        v-for="(label, id) in catalogStore.statusOptions"
        :key="id"
        class="status-tab"
        :class="{ active: catalogStore.selectedStatusTab === id }"
        @click="setStatusTab(id)"
      >
        {{ label }}
      </button>
    </div>

    <!-- Блок фильтра -->
    <div class="filter-container">
      <!-- Первая строка фильтра -->
      <div class="first-line">
        <!-- Номер аукциона -->
        <label for="auction-number" class="filter-label">
          <p>Номер аукциона</p>
          <input
            id="auction-number"
            type="text"
            class="filter-input"
            v-model="catalogStore.auctionNumber"
            placeholder="Введите номер"
          />
        </label>

        <!-- Субъект РФ -->
        <label for="subject-rf" class="filter-label">
          <p>Субъект РФ</p>
          <multi-select
            id="subject-rf"
            :options="catalogStore.subjectOptions"
            v-model="catalogStore.subjectRf"
            placeholder="Выберите субъект РФ"
            :with-search="true"
            :flat="false"
          ></multi-select>
        </label>

        <!-- Проект -->
        <label for="project" class="filter-label">
          <p>Проект</p>
          <multi-select
            id="project"
            :options="catalogStore.projectOptions"
            v-model="catalogStore.project"
            placeholder="Выберите проект"
            :with-search="true"
          ></multi-select>
        </label>
      </div>

      <!-- Вторая строка фильтра -->
      <div class="second-line">
        <!-- Дата окончания (показывается только для "Объявленные" или "Все") -->
        <div class="date-picker" id="date-end" v-if="showDatepicker">
          <p class="filter-label">Дата окончания</p>
          <datepicker
            v-model="dateEndValue"
            isRange
            @change-date="handleDateChange"
          ></datepicker>
        </div>

        <!-- Планируемый квартал (показывается только для "Подготовка к торгам" или "Все") -->
        <label
          for="planning-quarter"
          class="filter-label"
          v-if="showPlanningQuarter"
        >
          <p>Планируемый квартал</p>
          <multi-select
            id="planning-quarter"
            :options="catalogStore.planningQuarterOptions"
            v-model="catalogStore.planningQuarter"
            placeholder="Выберите квартал"
          ></multi-select>
        </label>

        <!-- Площадь -->
        <div class="filter-range">
          <label for="square" class="filter-label">
            <p>Площадь</p>
            <custom-range-slider
              id="square"
              label="Площадь"
              :start-value="{
                value: catalogStore.square.min,
                description: 'м²',
              }"
              :middle-value="{
                value: (
                  (catalogStore.square.min + catalogStore.square.max) /
                  2
                ).toFixed(1),
                description: 'м²',
              }"
              :end-value="{ value: catalogStore.square.max, description: 'м²' }"
              :interval-value="0.1"
              v-model="squareValues"
              @change="handleSquareChange"
            ></custom-range-slider>
          </label>
        </div>

        <!-- Стоимость (показывается только для "Объявленные" или "Все") -->
        <div class="filter-range" v-if="showPrice">
          <label for="costs" class="filter-label">
            <p>Стоимость</p>
            <custom-range-slider
              id="costs"
              label="Стоимость"
              :start-value="{ value: catalogStore.price.min, description: '₽' }"
              :middle-value="{
                value: Math.floor(
                  (catalogStore.price.min + catalogStore.price.max) / 2
                ),
                description: '₽',
              }"
              :end-value="{ value: catalogStore.price.max, description: '₽' }"
              :interval-value="100"
              v-model="priceValues"
              @change="handlePriceChange"
            ></custom-range-slider>
          </label>
        </div>
      </div>

      <!-- Кнопки для управления фильтром -->
      <div class="filter-actions">
        <Button type="outline" label="Сбросить" @on-click="resetFilter" />
        <Button type="primary" label="Применить" @on-click="applyFilter" />
      </div>
    </div>

    <!-- Индикатор загрузки фильтров -->
    <!-- <div v-else class="loading-container">Загрузка фильтров...</div> -->

    <!-- Вывод ошибки, если есть -->
    <div v-if="catalogStore.error" class="error-container">
      {{ catalogStore.error }}
    </div>

    <!-- Каталог помещений -->
    <PropertyCatalog />
  </main>

  <footer class="footer"></footer>
</template>

<script setup>
import MultiSelect from './components/multi-select/MultiSelect.vue'
import Datepicker from './components/datepicker/Datepicker.vue'
import CustomRangeSlider from './components/range-slider/CustomRangeSlider.vue'
import PropertyCatalog from './components/PropertyCatalog.vue'
import { Button } from './components/button'
import 'vue-slider-component/theme/antd.css'
import { useCatalogStore } from './stores/catalogStore'
import { onMounted, ref, watch, computed } from 'vue'

// Инициализируем единое хранилище
const catalogStore = useCatalogStore()
const propertyCatalog = ref(null)

// Локальные модели для слайдеров
const squareValues = ref([0, 1000])
const priceValues = ref([0, 2000000])
const dateEndValue = ref(null)

// Вычисляемые свойства для условного отображения компонентов
const showDatepicker = computed(() => {
  return catalogStore.selectedStatusTab === 'published_bidding'
})

const showPlanningQuarter = computed(() => {
  return (
    catalogStore.selectedStatusTab === 'all' ||
    catalogStore.selectedStatusTab === 'prepare_bidding'
  )
})

const showPrice = computed(() => {
  return (
    catalogStore.selectedStatusTab === 'all' ||
    catalogStore.selectedStatusTab === 'published_bidding'
  )
})

// Обработчики изменений для слайдеров
const handleSquareChange = values => {
  if (!values || !Array.isArray(values) || values.length !== 2) return

  const min = parseFloat(values[0])
  const max = parseFloat(values[1])

  if (!isNaN(min) && !isNaN(max)) {
    console.log('App - handleSquareChange: получены значения', { min, max })

    // Обновляем только выбранные значения, а не границы диапазона
    catalogStore.square.selected = {
      min: min,
      max: max,
    }

    // Синхронизируем локальные значения
    squareValues.value = [min, max]

    console.log(
      'App - handleSquareChange: обновлены значения store',
      catalogStore.square.selected
    )
  }
}

const handlePriceChange = values => {
  if (!values || !Array.isArray(values) || values.length !== 2) return

  const min = parseInt(values[0])
  const max = parseInt(values[1])

  if (!isNaN(min) && !isNaN(max)) {
    console.log('App - handlePriceChange: получены значения', { min, max })

    // Обновляем только выбранные значения, а не границы диапазона
    catalogStore.price.selected = {
      min: min,
      max: max,
    }

    // Синхронизируем локальные значения
    priceValues.value = [min, max]

    console.log(
      'App - handlePriceChange: обновлены значения store',
      catalogStore.price.selected
    )
  }
}

// Обработчик изменения даты
const handleDateChange = (dateRange, formattedDate) => {
  console.log('App - handleDateChange:', dateRange, formattedDate)
  catalogStore.dateRequestEnd = dateRange
  dateEndValue.value = dateRange
}

// Методы для управления фильтрами
const resetFilter = () => {
  catalogStore.resetFilters()

  // При сбросе обновляем локальные модели
  squareValues.value = [
    catalogStore.square.selected.min,
    catalogStore.square.selected.max,
  ]
  priceValues.value = [
    catalogStore.price.selected.min,
    catalogStore.price.selected.max,
  ]
  dateEndValue.value = null
}

const applyFilter = () => {
  // Применяем фильтры и загружаем новые данные
  catalogStore.loadCatalogData()
}

// Функция для изменения таба статуса
const setStatusTab = statusId => {
  catalogStore.setStatusTab(statusId)
}

// Загружаем данные фильтров при монтировании компонента
onMounted(() => {
  catalogStore.fetchFilters().then(() => {
    // Инициализация локальных моделей после загрузки данных
    squareValues.value = [
      catalogStore.square.selected.min,
      catalogStore.square.selected.max,
    ]
    priceValues.value = [
      catalogStore.price.selected.min,
      catalogStore.price.selected.max,
    ]
  })
})

// Наблюдаем за изменениями в хранилище и обновляем локальные модели
watch(
  () => catalogStore.square.selected,
  newSelected => {
    squareValues.value = [newSelected.min, newSelected.max]
  },
  { deep: true }
)

watch(
  () => catalogStore.price.selected,
  newSelected => {
    priceValues.value = [newSelected.min, newSelected.max]
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
@use './scss/colors.scss';
@use './scss/mixins.scss';
@use './scss/typography.scss';

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.filter-title {
  @extend .h2-semibold;
  margin-bottom: 24px;
}

.status-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  @include mixins.mobile {
    gap: 8px;
  }
}

.status-tab {
  @extend .p1-medium;
  padding: 8px 16px;
  border-radius: 100px;
  background-color: colors.$matisse;
  border: 1px solid colors.$matisse;
  color: colors.$eyck;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: colors.$magritte;
    border-color: colors.$delacroix;
  }

  &.active {
    background-color: colors.$boticelli;
    border-color: colors.$boticelli;
    color: colors.$aivazovsky;
  }

  @include mixins.mobile {
    padding: 6px 12px;
  }
}

.filter-container {
  background-color: colors.$picasso;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
}

.date-picker {
  width: 330px;

  .ds-datepicker {
    min-width: 180px;
  }
}

.filter-label {
  width: 100%;

  p {
    @extend .p2-medium;
    margin-bottom: 8px;
    color: colors.$eyck;
  }
}

.filter-input {
  width: 100%;
  padding: 10px 16px;
  border-radius: 100px;
  border: 1px solid colors.$delacroix;
  background-color: colors.$aivazovsky;
  @extend .p1-medium;

  &:focus {
    outline: none;
    border-color: colors.$eyck;
  }
}

.first-line,
.second-line {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;

  @include mixins.mobile {
    flex-direction: column;
    gap: 16px;
  }
}

.filter-range {
  width: 100%;
  min-width: 250px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
}

.loading-container {
  padding: 24px;
  text-align: center;
  border-radius: 16px;
  background-color: colors.$matisse;
  margin-bottom: 32px;
  @extend .p1-medium;
}

.error-container {
  padding: 16px;
  border-radius: 8px;
  background-color: #ffecec;
  color: #d32f2f;
  margin-bottom: 24px;
  @extend .p1-medium;
}
</style>
