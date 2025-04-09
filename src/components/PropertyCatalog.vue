<template>
  <div class="property-catalog">
    <div class="property-catalog__header">
      <h2 class="property-catalog__title h2-semibold">
        {{ catalogStore.catalogTitle || 'Каталог помещений' }}
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
              v-for="option in catalogStore.pageSizeOptions"
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
    <div
      v-else-if="catalogStore.filteredItems.length === 0"
      class="property-catalog__empty"
    >
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
        v-for="(item, idx) in displayedItems"
        :key="idx"
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

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useCatalogStore } from '@/stores/catalogStore'
import { storeToRefs } from 'pinia'
import { Button } from './button'
import PropertyCard from './PropertyCard.vue'

// Инициализация единого хранилища
const catalogStore = useCatalogStore()

// Используем storeToRefs для сохранения реактивности
const { filteredItems, filteredSortedItems } = storeToRefs(catalogStore)

// Вычисляемые свойства для доступа к данным из хранилища
const isLoading = computed(() => catalogStore.isLoading)
const error = computed(() => catalogStore.error)

// Вычисляемые свойства для пагинации
const currentPage = computed(() => catalogStore.pagination.currentPage)
const totalPages = computed(() => catalogStore.pagination.totalPages)
const totalItems = computed(() => catalogStore.pagination.totalItems)

// Выбранное количество элементов на странице с двусторонней привязкой
const selectedPageSize = computed({
  get: () => catalogStore.pagination.perPage,
  set: value => {
    catalogStore.pagination.perPage = value
    catalogStore.loadCatalogData()
  },
})

// Обработка сортировки с двусторонней привязкой
const sortBy = computed({
  get: () => catalogStore.sortBy,
  set: value => {
    catalogStore.sortBy = value
    // При изменении сортировки переключаемся на API
    catalogStore.useApiData = true
    catalogStore.loadCatalogData()
  },
})

// Тип каталога (объекты/проекты) с двусторонней привязкой
const catalogTabType = computed({
  get: () => catalogStore.catalogTabType,
  set: value => {
    catalogStore.catalogTabType = value
  },
})

// Сообщение при пустом результате
const emptyResultMessage = computed(() => {
  if (catalogTabType.value === 'projects') {
    return 'В данный момент проектов не найдено.'
  } else {
    return 'В данный момент объектов не найдено.'
  }
})

// Отображаемые элементы с учетом данных с сервера
const displayedItems = computed(() => {
  console.log(
    'PropertyCatalog - Вычисление displayedItems, количество элементов:',
    filteredSortedItems.value.length
  )
  // Отображаем отсортированные элементы
  return filteredSortedItems.value
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
    let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)

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
  catalogStore.setCatalogTabType(type)
}

// Смена страницы
const changePage = page => {
  if (page < 1 || page > totalPages.value) return

  console.log(
    `PropertyCatalog - Смена страницы с ${currentPage.value} на ${page}`
  )
  catalogStore.changePage(page)
}

// Изменение количества элементов на странице
const changePageSize = () => {
  console.log(
    'PropertyCatalog - Изменение количества элементов на странице:',
    selectedPageSize.value
  )
  catalogStore.setPageSize(selectedPageSize.value)
}

// Загрузка данных
const loadData = () => {
  console.log('PropertyCatalog - Принудительная загрузка данных')
  catalogStore.useApiData = true
  catalogStore.loadCatalogData()
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

// Инициализация компонента
onMounted(() => {
  console.log('PropertyCatalog - Компонент смонтирован')
})
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
