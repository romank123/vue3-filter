<script>
import MultiSelect from './components/multi-select/MultiSelect.vue'
import Datepicker from './components/datepicker/Datepicker.vue'
import RangeSlider from './components/range-slider/RangeSlider.vue'
import CustomRangeSlider from './components/range-slider/CustomRangeSlider.vue'
import ProductCatalog from './components/ProductCatalog.vue'
import PropertyCatalog from './components/PropertyCatalog.vue'
import { Button } from './components/button'
import 'vue-slider-component/theme/antd.css'
import { useFilterStore } from './stores/filterStore'
import { onMounted, ref, watch, computed } from 'vue'
import axios from 'axios'

export default {
  name: 'App',
  components: {
    MultiSelect,
    Datepicker,
    RangeSlider,
    CustomRangeSlider,
    ProductCatalog,
    PropertyCatalog,
    Button,
  },
  setup() {
    const filterStore = useFilterStore()
    const propertyCatalog = ref(null)

    // Локальные модели для слайдеров
    const squareValues = ref([0, 1000])
    const priceValues = ref([0, 2000000])

    // Данные для каталога помещений
    const catalogData = ref(null)
    const isLoading = ref(false)

    // Загружаем данные фильтров при монтировании компонента
    onMounted(() => {
      filterStore.fetchFilters().then(() => {
        // Инициализация локальных моделей после загрузки данных
        squareValues.value = [
          filterStore.square.selected.min,
          filterStore.square.selected.max,
        ]
        priceValues.value = [
          filterStore.price.selected.min,
          filterStore.price.selected.max,
        ]

        // Загружаем начальные данные каталога
        loadCatalogData()
      })
    })

    // Функция для загрузки данных каталога на основе фильтров
    const loadCatalogData = async () => {
      isLoading.value = true
      catalogData.value = null // Сбрасываем предыдущие данные

      try {
        // Формируем параметры запроса из хранилища фильтров
        const params = filterStore.applyFilters()

        console.log('App - Загрузка данных каталога с параметрами:', params)

        // Запрос к API
        const response = await axios.get('/api/properties', { params })

        // Проверяем успешность запроса
        if (response.data && response.data.success) {
          // Обновляем данные каталога
          console.log('App - Данные каталога успешно загружены')
          catalogData.value = response.data
        } else {
          console.error('App - Ошибка запроса каталога:', response)
        }
      } catch (error) {
        console.error('App - Ошибка при загрузке каталога:', error)
      } finally {
        isLoading.value = false
      }
    }

    // Наблюдаем за изменениями в хранилище и обновляем локальные модели
    watch(
      () => filterStore.square.selected,
      newSelected => {
        squareValues.value = [newSelected.min, newSelected.max]
      },
      { deep: true }
    )

    watch(
      () => filterStore.price.selected,
      newSelected => {
        priceValues.value = [newSelected.min, newSelected.max]
      },
      { deep: true }
    )

    // Обработчики изменений для слайдеров
    const handleSquareChange = values => {
      if (!values || !Array.isArray(values) || values.length !== 2) return

      const min = parseFloat(values[0])
      const max = parseFloat(values[1])

      if (!isNaN(min) && !isNaN(max)) {
        console.log('App - handleSquareChange: получены значения', { min, max })

        // Обновляем только выбранные значения, а не границы диапазона
        filterStore.square.selected = {
          min: min,
          max: max,
        }

        // Синхронизируем локальные значения
        squareValues.value = [min, max]

        console.log(
          'App - handleSquareChange: обновлены значения store',
          filterStore.square.selected
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
        filterStore.price.selected = {
          min: min,
          max: max,
        }

        // Синхронизируем локальные значения
        priceValues.value = [min, max]

        console.log(
          'App - handlePriceChange: обновлены значения store',
          filterStore.price.selected
        )
      }
    }

    // Методы для управления фильтрами
    const resetFilter = () => {
      filterStore.resetFilters()
      // При сбросе обновляем локальные модели
      squareValues.value = [
        filterStore.square.selected.min,
        filterStore.square.selected.max,
      ]
      priceValues.value = [
        filterStore.price.selected.min,
        filterStore.price.selected.max,
      ]
    }

    const applyFilter = () => {
      // Применяем фильтры и загружаем новые данные
      loadCatalogData()
    }

    return {
      filterStore,
      squareValues,
      priceValues,
      catalogData,
      propertyCatalog,
      handleSquareChange,
      handlePriceChange,
      resetFilter,
      applyFilter,
    }
  },
}
</script>

<template>
  <header>
    <div class="wrapper"></div>
  </header>

  <main>
    <div class="filter-title">Коммерческие помещения</div>

    <!-- Блок фильтра -->
    <div class="filter-container" v-if="!filterStore.isLoading">
      <!-- Первая строка фильтра -->
      <div class="first-line">
        <!-- Номер аукциона -->
        <label for="auction-number" class="filter-label">
          <p>Номер аукциона</p>
          <input
            id="auction-number"
            type="text"
            class="filter-input"
            v-model="filterStore.auctionNumber"
            placeholder="Введите номер"
          />
        </label>

        <!-- Субъект РФ -->
        <label for="subject-rf" class="filter-label">
          <p>Субъект РФ</p>
          <multi-select
            id="subject-rf"
            :options="filterStore.subjectOptions"
            v-model="filterStore.subjectRf"
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
            :options="filterStore.projectOptions"
            v-model="filterStore.project"
            placeholder="Выберите проект"
            :with-search="true"
          ></multi-select>
        </label>
      </div>

      <!-- Вторая строка фильтра -->
      <div class="second-line">
        <!-- Планируемый квартал -->
        <label for="planning-quarter" class="filter-label">
          <p>Планируемый квартал</p>
          <multi-select
            id="planning-quarter"
            :options="filterStore.planningQuarterOptions"
            v-model="filterStore.planningQuarter"
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
                value: filterStore.square.min,
                description: 'м²',
              }"
              :middle-value="{
                value: (
                  (filterStore.square.min + filterStore.square.max) /
                  2
                ).toFixed(1),
                description: 'м²',
              }"
              :end-value="{ value: filterStore.square.max, description: 'м²' }"
              :interval-value="0.1"
              v-model="squareValues"
              @change="handleSquareChange"
            ></custom-range-slider>
          </label>
        </div>

        <!-- Стоимость -->
        <div class="filter-range">
          <label for="costs" class="filter-label">
            <p>Стоимость</p>
            <custom-range-slider
              id="costs"
              label="Стоимость"
              :start-value="{ value: filterStore.price.min, description: '₽' }"
              :middle-value="{
                value: Math.floor(
                  (filterStore.price.min + filterStore.price.max) / 2
                ),
                description: '₽',
              }"
              :end-value="{ value: filterStore.price.max, description: '₽' }"
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
    <div v-else class="loading-container">Загрузка фильтров...</div>

    <!-- Вывод ошибки, если есть -->
    <div v-if="filterStore.error" class="error-container">
      {{ filterStore.error }}
    </div>

    <!-- Каталог помещений -->
    <PropertyCatalog ref="propertyCatalog" :render-list="catalogData" />
  </main>

  <footer class="footer"></footer>
</template>

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

.filter-container {
  background-color: colors.$picasso;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
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
