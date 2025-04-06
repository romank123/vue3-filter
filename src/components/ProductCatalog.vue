<template>
  <div class="property-catalog">
    <div class="property-catalog__header">
      <h2 class="property-catalog__title h2-semibold">
        {{ catalogTitle || 'Каталог помещений' }}
        <span
          v-if="statusFilter && statusFilter !== 'all'"
          class="property-catalog__status-badge"
        >
          {{ statusName }}
        </span>
      </h2>

      <div class="property-catalog__controls">
        <div class="property-catalog__stats" v-if="totalItems > 0">
          <span class="p2-medium">
            Найдено {{ totalItems }} {{ getItemsCountLabel(totalItems) }}
          </span>
        </div>

        <!-- Селектор количества элементов на странице -->
        <div class="property-catalog__page-size">
          <label for="page-size-select" class="p2-medium">Показывать по:</label>
          <select
            id="page-size-select"
            v-model="selectedPageSize"
            class="property-catalog__select"
            @change="changePageSize"
          >
            <option
              v-for="option in pageSizeOptions"
              :key="option.id"
              :value="option.id"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="property-catalog__sort">
          <label for="sort-select" class="p2-medium">Сортировать по:</label>
          <select
            id="sort-select"
            v-model="sortBy"
            class="property-catalog__select"
          >
            <option value="price-asc">Цена (по возрастанию)</option>
            <option value="price-desc">Цена (по убыванию)</option>
            <option value="square-asc">Площадь (по возрастанию)</option>
            <option value="square-desc">Площадь (по убыванию)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Табы для переключения между проектами и объектами -->
    <div class="property-catalog__tabs">
      <button
        class="property-catalog__tab"
        :class="{ active: catalogTabType === 'projects' }"
        @click="setCatalogTabType('projects')"
      >
        Проекты
      </button>
      <button
        class="property-catalog__tab"
        :class="{ active: catalogTabType === 'objects' }"
        @click="setCatalogTabType('objects')"
      >
        Объекты
      </button>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="property-catalog__loading">
      <div class="property-catalog__loading-spinner"></div>
      <p class="p1-medium">Загрузка данных...</p>
    </div>

    <!-- Сообщение об ошибке -->
    <div v-else-if="error" class="property-catalog__error">
      <p class="p1-medium">{{ error }}</p>
      <Button type="primary" label="Повторить" @on-click="loadData" />
    </div>

    <!-- Пустой результат поиска -->
    <div v-else-if="filteredItems.length === 0" class="property-catalog__empty">
      <p class="p1-medium">
        {{ emptyResultMessage }}
      </p>
      <p class="p2-medium">
        Попробуйте изменить параметры фильтра или выбрать другой тип.
      </p>
    </div>

    <!-- Список карточек -->
    <div v-else class="property-catalog__grid">
      <PropertyCard
        v-for="item in filteredSortedItems"
        :key="item.id"
        :item="item"
        @click="openPropertyDetails(item)"
      />
    </div>

    <!-- Пагинация - отображается только если не выбран режим "Все" и есть больше 1 страницы -->
    <div
      v-if="totalPages > 1 && selectedPageSize > 0"
      class="property-catalog__pagination"
    >
      <button
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        &lt; Предыдущая
      </button>

      <div class="pagination-pages">
        <button
          v-for="page in paginationPages"
          :key="page"
          class="pagination-page"
          :class="{ active: page === currentPage }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </div>

      <button
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        Следующая &gt;
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useFilterStore } from '@/stores/filterStore'
import { Button } from './button'
import PropertyCard from './PropertyCard.vue'
import axios from 'axios'

export default {
  name: 'PropertyCatalog',
  components: {
    Button,
    PropertyCard,
  },
  props: {
    renderList: {
      type: Object,
      default: null,
    },
    statusFilter: {
      type: String,
      default: 'all',
    },
    statusOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const filterStore = useFilterStore()
    const items = ref([])
    const isLoading = ref(false)
    const error = ref(null)
    const sortBy = ref('price-asc')
    const currentPage = ref(1)
    const perPage = ref(12)
    const totalItems = ref(0)
    const totalPages = ref(1)
    const catalogTitle = ref('')
    const catalogTabType = ref('projects') // По умолчанию показываем проекты

    // Выбранное количество элементов на странице
    const selectedPageSize = ref(filterStore.pageSize)
    const pageSizeOptions = ref(filterStore.pageSizeOptions)

    // Новые переменные для улучшенной обработки
    let sortTimeoutId = null // Для дебаунса изменения сортировки
    const isFirstLoad = ref(true) // Флаг первой загрузки

    // Вычисляемое свойство для отображения имени выбранного статуса
    const statusName = computed(() => {
      if (props.statusFilter === 'all') return ''
      return props.statusOptions[props.statusFilter] || ''
    })

    // Получаем список ID проектов из хранилища фильтров
    const projectIds = computed(() => {
      if (!filterStore.projectOptions) return []
      return filterStore.projectOptions.map(option => option.id)
    })

    // Фильтрация элементов в зависимости от выбранного таба
    const filteredItems = computed(() => {
      if (!items.value.length) return []

      if (catalogTabType.value === 'projects') {
        // Показываем только проекты (те ID, которые есть в списке projectIds)
        return items.value.filter(item => projectIds.value.includes(item.id))
      } else if (catalogTabType.value === 'objects') {
        // Показываем только объекты (те ID, которых нет в списке projectIds)
        return items.value.filter(item => !projectIds.value.includes(item.id))
      }

      // Если тип не определен, возвращаем все элементы
      return items.value
    })

    // Сообщение при пустом результате
    const emptyResultMessage = computed(() => {
      if (catalogTabType.value === 'projects') {
        return 'В данный момент проектов не найдено.'
      } else {
        return 'В данный момент объектов не найдено.'
      }
    })

    // Расчет сортированных элементов
    const filteredSortedItems = computed(() => {
      if (!filteredItems.value.length) return []

      const [field, direction] = sortBy.value.split('-')
      const sorted = [...filteredItems.value].sort((a, b) => {
        let valueA, valueB

        // Получаем значения в зависимости от поля сортировки
        if (field === 'price') {
          valueA = parseFloat(a.props.price) || 0
          valueB = parseFloat(b.props.price) || 0
        } else if (field === 'square') {
          valueA = parseFloat(a.props.square) || 0
          valueB = parseFloat(b.props.square) || 0
        } else {
          return 0
        }

        if (direction === 'asc') {
          return valueA - valueB
        } else {
          return valueB - valueA
        }
      })

      return sorted
    })

    // Определение страниц для пагинации
    const paginationPages = computed(() => {
      const pages = []
      const maxVisiblePages = 5

      if (totalPages.value <= maxVisiblePages) {
        // Если страниц меньше максимального количества, показываем все
        for (let i = 1; i <= totalPages.value; i++) {
          pages.push(i)
        }
      } else {
        // Иначе показываем текущую страницу и ближайшие
        let startPage = Math.max(
          1,
          currentPage.value - Math.floor(maxVisiblePages / 2)
        )
        let endPage = Math.min(
          totalPages.value,
          startPage + maxVisiblePages - 1
        )

        if (endPage - startPage < maxVisiblePages - 1) {
          startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
          pages.push(i)
        }
      }

      return pages
    })

    // Изменение типа каталога (проекты или объекты)
    const setCatalogTabType = type => {
      console.log('PropertyCatalog - Изменение типа каталога:', type)
      catalogTabType.value = type
    }

    // Смена страницы
    const changePage = page => {
      if (page < 1 || page > totalPages.value) return
      currentPage.value = page

      // Если данные из API, загружаем новую страницу
      if (!props.renderList) {
        loadData()
      }
    }

    // Изменение количества элементов на странице
    const changePageSize = () => {
      console.log(
        'PropertyCatalog - Изменение количества элементов на странице:',
        selectedPageSize.value
      )

      // Обновляем в хранилище
      filterStore.setPageSize(selectedPageSize.value)

      // Сбрасываем номер страницы на первую
      currentPage.value = 1

      // Перезагружаем данные
      loadData()
    }

    // Загрузка данных с API
    const loadData = async () => {
      // Если есть renderList, используем его и не делаем запрос API
      if (props.renderList) {
        console.log('PropertyCatalog - Используем данные из renderList')

        if (props.renderList.success && props.renderList.data) {
          items.value = props.renderList.data || []

          // Обрабатываем навигацию
          if (props.renderList.nav) {
            totalItems.value =
              props.renderList.nav.NavRecordCount || items.value.length
            totalPages.value = props.renderList.nav.NavPageCount || 1
            currentPage.value = props.renderList.nav.NavPageNomer || 1
            perPage.value =
              props.renderList.nav.NavPageSize || selectedPageSize.value
          }

          // Устанавливаем заголовок, если он есть
          if (props.renderList.meta && props.renderList.meta.content) {
            catalogTitle.value = props.renderList.meta.content.title || ''
          }
        } else {
          error.value = 'Ошибка в данных. Неверный формат списка.'
        }
        return
      }

      // Если нет renderList и уже идет загрузка, не начинаем новый запрос
      if (isLoading.value) return

      // Иначе, загружаем с API
      isLoading.value = true
      error.value = null

      try {
        // Формируем параметры запроса из хранилища фильтров
        const params = {
          PAGEN_1: currentPage.value,
          PAGE_ELEMENTS:
            selectedPageSize.value > 0 ? selectedPageSize.value : 1000, // Если "Все", запрашиваем большое значение
          sort: sortBy.value,
          ...filterStore.applyFilters(), // Получаем параметры фильтров
        }

        console.log(
          'PropertyCatalog - Загрузка данных с API с параметрами:',
          params
        )

        // В реальном приложении используйте реальный API-эндпоинт
        const response = await axios.get('/api/properties', { params })

        // Обрабатываем ответ
        if (response.data && response.data.success) {
          // Проверяем, нет ли renderList, который мог появиться во время запроса
          if (!props.renderList) {
            items.value = response.data.data || []

            // Обрабатываем навигацию
            if (response.data.nav) {
              totalItems.value =
                response.data.nav.NavRecordCount || items.value.length

              // Если выбран режим "Все", устанавливаем totalPages = 1
              if (selectedPageSize.value === 0) {
                totalPages.value = 1
              } else {
                totalPages.value = response.data.nav.NavPageCount || 1
              }

              currentPage.value = response.data.nav.NavPageNomer || 1
              perPage.value =
                response.data.nav.NavPageSize || selectedPageSize.value
            }

            // Устанавливаем заголовок, если он есть
            if (response.data.meta && response.data.meta.content) {
              catalogTitle.value = response.data.meta.content.title || ''
            }

            console.log('PropertyCatalog - Данные успешно загружены с API')
          } else {
            console.log(
              'PropertyCatalog - Появился renderList во время загрузки API, используем его'
            )
          }
        } else {
          if (!props.renderList) {
            error.value =
              'Произошла ошибка при загрузке данных. Неверный формат ответа.'
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err)
        // Проверяем, нет ли renderList, который мог появиться во время запроса
        if (!props.renderList) {
          error.value =
            'Произошла ошибка при загрузке данных. Пожалуйста, попробуйте еще раз.'
        }
      } finally {
        isLoading.value = false
      }
    }

    // Функция для правильного склонения слова "помещение"
    const getItemsCountLabel = count => {
      const lastDigit = count % 10
      const lastTwoDigits = count % 100

      if (lastDigit === 1 && lastTwoDigits !== 11) {
        return 'помещение'
      } else if (
        [2, 3, 4].includes(lastDigit) &&
        ![12, 13, 14].includes(lastTwoDigits)
      ) {
        return 'помещения'
      } else {
        return 'помещений'
      }
    }

    // Открытие детальной информации о помещении
    const openPropertyDetails = item => {
      console.log('Открываем детальную информацию о помещении:', item)
      // Если есть URL, можно использовать его для перехода на страницу
      if (item.url) {
        window.location.href = item.url
      }
    }

    // Наблюдаем за изменениями в renderList
    watch(
      () => props.renderList,
      (newValue, oldValue) => {
        console.log('PropertyCatalog - Обнаружено изменение в renderList', {
          hasNewValue: !!newValue,
          hasOldValue: !!oldValue,
        })

        if (newValue) {
          // Если идет загрузка данных с API, отменяем ее в пользу renderList
          if (isLoading.value) {
            console.log(
              'PropertyCatalog - Отменяем загрузку API в пользу renderList'
            )
            isLoading.value = false
          }

          // Применяем данные из renderList
          loadData()
        } else if (oldValue && !newValue) {
          // Если renderList был, но исчез - запросим данные с API
          console.log(
            'PropertyCatalog - renderList был удален, загружаем данные с API'
          )
          loadData()
        }
      },
      { deep: true, immediate: true }
    )

    // Наблюдаем за изменениями сортировки
    watch(sortBy, (newValue, oldValue) => {
      console.log('PropertyCatalog - Изменение сортировки:', {
        newValue,
        oldValue,
      })

      // Если данные загружаются из API, загружаем с новой сортировкой
      if (!props.renderList) {
        // Небольшая задержка, чтобы избежать слишком частых запросов
        if (sortTimeoutId) clearTimeout(sortTimeoutId)

        sortTimeoutId = setTimeout(() => {
          loadData()
        }, 300) // Задержка 300мс
      } else {
        // Если данные из renderList, сортируем локально (уже реализовано через computed)
        console.log(
          'PropertyCatalog - Сортировка применена локально для renderList'
        )
      }
    })

    // Наблюдаем за изменениями статуса фильтра
    watch(
      () => props.statusFilter,
      (newValue, oldValue) => {
        console.log('PropertyCatalog - Изменение статуса фильтра:', {
          oldValue,
          newValue,
        })
        // При изменении статуса можно выполнять дополнительные действия, если нужно
      }
    )

    // Наблюдаем за изменениями в хранилище фильтров для обновления pageSize
    watch(
      () => filterStore.pageSize,
      newValue => {
        selectedPageSize.value = newValue
      }
    )

    // Загружаем данные при монтировании компонента
    onMounted(() => {
      console.log(
        'PropertyCatalog - Компонент смонтирован, renderList присутствует:',
        !!props.renderList
      )

      // Синхронизируем selectedPageSize с хранилищем
      selectedPageSize.value = filterStore.pageSize

      // Если при монтировании renderList отсутствует, загружаем данные с API
      if (!props.renderList) {
        // Добавляем небольшую задержку, чтобы дать шанс renderList появиться
        setTimeout(() => {
          if (!props.renderList && isFirstLoad.value) {
            console.log(
              'PropertyCatalog - renderList не появился, загружаем данные с API'
            )
            loadData()
            isFirstLoad.value = false
          }
        }, 50) // Небольшая задержка
      } else {
        // Если renderList уже есть, отмечаем что первая загрузка произошла
        isFirstLoad.value = false
      }
    })

    return {
      items,
      filteredItems,
      filteredSortedItems,
      isLoading,
      error,
      sortBy,
      currentPage,
      totalItems,
      totalPages,
      paginationPages,
      catalogTitle,
      catalogTabType,
      emptyResultMessage,
      changePage,
      loadData,
      getItemsCountLabel,
      openPropertyDetails,
      statusName,
      setCatalogTabType,
      selectedPageSize,
      pageSizeOptions,
      changePageSize,
    }
  },
}
</script>

<style lang="scss" scoped>
@use '../scss/colors.scss';
@use '../scss/mixins.scss';
@use '../scss/typography.scss';

.property-catalog {
  margin-top: 40px;

  &__header {
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;

    @include mixins.mf-tablet {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  &__title {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    @include mixins.mf-tablet {
      margin-bottom: 0;
    }
  }

  &__status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 100px;
    background-color: colors.$boticelli;
    color: colors.$aivazovsky;
    font-size: 14px;
    font-family: 'Gilroy-500';
    vertical-align: middle;

    @include mixins.mobile {
      font-size: 12px;
      padding: 3px 10px;
    }
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: 12px;

    @include mixins.mf-tablet {
      flex-direction: row;
      align-items: center;
    }
  }

  &__stats {
    color: colors.$eyck;
  }

  &__sort,
  &__page-size {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__select {
    padding: 8px 12px;
    border: 1px solid colors.$delacroix;
    border-radius: 8px;
    background-color: colors.$aivazovsky;
    color: colors.$eyck;
    outline: none;

    &:focus {
      border-color: colors.$eyck;
    }
  }

  &__tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
  }

  &__tab {
    @extend .p1-medium;
    padding: 10px 20px;
    border-radius: 8px;
    background-color: colors.$aivazovsky;
    border: 1px solid colors.$delacroix;
    color: colors.$eyck;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: colors.$magritte;
    }

    &.active {
      background-color: colors.$boticelli;
      border-color: colors.$boticelli;
      color: colors.$aivazovsky;
    }

    @include mixins.mobile {
      padding: 8px 16px;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    margin-bottom: 40px;

    @include mixins.mf-tablet {
      grid-template-columns: repeat(2, 1fr);
    }

    @include mixins.mf-desktop {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__loading,
  &__error,
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    background-color: colors.$picasso;
    border-radius: 12px;
    text-align: center;
    margin-bottom: 40px;
  }

  &__loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid colors.$magritte;
    border-top: 4px solid colors.$boticelli;
    border-radius: 50%;
    margin-bottom: 16px;
    animation: spin 1s linear infinite;
  }

  &__error {
    color: #d32f2f;

    .p1-medium {
      margin-bottom: 16px;
    }
  }

  &__pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 32px;
    margin-bottom: 40px;
  }
}

.pagination-btn {
  padding: 8px 16px;
  background-color: colors.$aivazovsky;
  border: 1px solid colors.$delacroix;
  border-radius: 8px;
  color: colors.$eyck;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: colors.$magritte;
  }

  &:disabled {
    color: colors.$vinci;
    cursor: not-allowed;
  }
}

.pagination-pages {
  display: flex;
  gap: 4px;
}

.pagination-page {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: colors.$aivazovsky;
  border: 1px solid colors.$delacroix;
  border-radius: 8px;
  color: colors.$eyck;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(.active) {
    background-color: colors.$magritte;
  }

  &.active {
    background-color: colors.$boticelli;
    border-color: colors.$boticelli;
    color: colors.$aivazovsky;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
