// src/stores/catalogStore.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    // Состояние загрузки
    isLoading: false,
    error: null,

    // Данные каталога
    items: [],
    catalogTitle: '',
    catalogTabType: 'objects', // По умолчанию показываем объекты
    sortBy: 'price-asc',
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      perPage: 12,
    },
    pageSizeOptions: [
      { id: 12, label: '12' },
      { id: 24, label: '24' },
      { id: 48, label: '48' },
      { id: 0, label: 'Все' },
    ],

    // Данные фильтрации
    auctionNumber: '',
    subjectRf: [],
    project: [],
    planningQuarter: [],
    dateRequestEnd: null,
    selectedStatusTab: 'all', // По умолчанию "all" (все)

    // Диапазоны для фильтрации
    square: {
      min: 0,
      max: 1000,
      // Выбранные пользователем значения
      selected: {
        min: 0,
        max: 1000,
      },
    },
    price: {
      min: 0,
      max: 2000000,
      // Выбранные пользователем значения
      selected: {
        min: 0,
        max: 2000000,
      },
    },

    // Опции для селектов
    subjectOptions: [],
    projectOptions: [],
    planningQuarterOptions: [],
    statusOptions: {}, // Опции статусов
  }),

  getters: {
    // Фильтрация элементов в зависимости от выбранного таба
    filteredItems: state => {
      if (!state.items.length) return []

      const projectIds = state.projectOptions.map(option => option.id)

      if (state.catalogTabType === 'projects') {
        // Показываем только проекты
        return state.items.filter(item => projectIds.includes(item.id))
      } else if (state.catalogTabType === 'objects') {
        // Показываем только объекты
        return state.items.filter(item => !projectIds.includes(item.id))
      }

      // Если тип не определен, возвращаем все элементы
      return state.items
    },

    // Расчет сортированных элементов
    filteredSortedItems(state) {
      if (!state.filteredItems.length) return []

      const [field, direction] = state.sortBy.split('-')
      let sorted = []
      sorted = [...state.filteredItems].sort((a, b) => {
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

      console.log('sorted', sorted)

      return sorted
    },
  },

  actions: {
    // --- Действия для фильтров ---

    async fetchFilters() {
      this.isLoading = true
      this.error = null

      try {
        const response = await axios.get('/api/filters')
        const { data } = response.data

        // Загружаем данные статусов
        if (data.status && data.status.values) {
          this.statusOptions = data.status.values
        }

        // Преобразовываем данные для subject_rf с учетом структуры
        if (data.subject_rf && data.subject_rf.structure) {
          this.subjectOptions = []

          // Перебираем федеральные округа и создаём иерархическую структуру
          Object.entries(data.subject_rf.structure).forEach(
            ([foName, regions]) => {
              const foItem = {
                id: `fo_${foName}`,
                label: foName,
                children: [],
              }

              // Добавляем регионы как дочерние элементы
              Object.entries(regions).forEach(([regionId, regionName]) => {
                foItem.children.push({
                  id: regionId,
                  label: regionName,
                })
              })

              this.subjectOptions.push(foItem)
            }
          )
        }

        // Преобразовываем данные для complex (project)
        if (data.complex && data.complex.values) {
          this.projectOptions = Object.entries(data.complex.values).map(
            ([id, label]) => ({
              id,
              label,
            })
          )
        }

        // Преобразовываем данные для planning-quarter
        if (data['planning-quarter'] && data['planning-quarter'].values) {
          if (Array.isArray(data['planning-quarter'].values)) {
            this.planningQuarterOptions = data['planning-quarter'].values.map(
              (value, index) => ({
                id: `q${index + 1}`,
                label: value,
              })
            )
          } else {
            this.planningQuarterOptions = Object.entries(
              data['planning-quarter'].values
            ).map(([id, label]) => ({
              id,
              label,
            }))
          }
        }

        // Устанавливаем значения для square
        if (data.square) {
          const squareMin = parseFloat(data.square.from?.min || '0')
          const squareMax = parseFloat(data.square.to?.max || '1000')

          this.square = {
            min: squareMin,
            max: squareMax,
            selected: {
              min: squareMin,
              max: squareMax,
            },
          }
        }

        // Устанавливаем значения для price
        if (data.price) {
          const priceMin = parseInt(data.price.from?.min || '0', 10)
          const priceMax = parseInt(data.price.to?.max || '2000000', 10)

          this.price = {
            min: priceMin,
            max: priceMax,
            selected: {
              min: priceMin,
              max: priceMax,
            },
          }
        }

        // После загрузки фильтров загружаем данные каталога
        await this.loadCatalogData()
      } catch (error) {
        this.error =
          'Ошибка при загрузке фильтров: ' +
          (error.message || 'Неизвестная ошибка')
        console.error('CatalogStore - Ошибка при загрузке фильтров:', error)
      } finally {
        this.isLoading = false
      }
    },

    // Полный сброс всех фильтров, кроме статуса
    resetFilters() {
      this.auctionNumber = ''
      this.subjectRf = []
      this.project = []
      this.planningQuarter = []
      this.dateRequestEnd = null

      // Сбрасываем выбранные значения к исходным границам диапазона
      this.square.selected = {
        min: this.square.min,
        max: this.square.max,
      }

      this.price.selected = {
        min: this.price.min,
        max: this.price.max,
      }
      this.loadCatalogData()
      console.log('CatalogStore - Фильтры сброшены')
    },

    // Вспомогательный метод для получения списка только регионов (без ФО)
    getSelectedRegions() {
      if (!this.subjectRf || this.subjectRf.length === 0) {
        return []
      }

      // Фильтруем только реальные идентификаторы регионов (не ФО)
      return this.subjectRf.filter(id => !id.startsWith('fo_'))
    },

    // Метод для применения фильтров и формирования параметров запроса
    applyFilters() {
      // Формируем параметры запроса
      const queryParams = {}

      // Добавляем номер аукциона, если он указан
      if (this.auctionNumber) {
        queryParams.auction_number = this.auctionNumber
      }

      // Добавляем регионы, игнорируя федеральные округа
      const selectedRegions = this.getSelectedRegions()
      if (selectedRegions.length > 0) {
        queryParams.regions = selectedRegions.join(',')
      }

      // Добавляем фильтр по статусу, если выбран не "все"
      if (this.selectedStatusTab !== 'all') {
        queryParams.status = this.selectedStatusTab
      }

      // Добавляем проекты
      if (this.project.length > 0) {
        queryParams.projects = this.project.join(',')
      }

      // Добавляем планируемые кварталы, если это применимо к текущему выбранному статусу
      if (
        (this.selectedStatusTab === 'all' ||
          this.selectedStatusTab === 'prepare_bidding') &&
        this.planningQuarter.length > 0
      ) {
        queryParams.quarters = this.planningQuarter.join(',')
      }

      // Добавляем дату окончания, если она установлена и применима к текущему статусу
      if (
        this.selectedStatusTab === 'published_bidding' &&
        this.dateRequestEnd
      ) {
        if (this.dateRequestEnd.date_from) {
          queryParams.date_request_end_from = this.dateRequestEnd.date_from
        }
        if (this.dateRequestEnd.date_to) {
          queryParams.date_request_end_to = this.dateRequestEnd.date_to
        }
      }

      // Добавляем параметры площади
      if (
        this.square.selected.min !== this.square.min ||
        this.square.selected.max !== this.square.max
      ) {
        queryParams.square_min = this.square.selected.min
        queryParams.square_max = this.square.selected.max
      }

      // Добавляем параметры цены, если это применимо
      if (
        (this.selectedStatusTab === 'all' ||
          this.selectedStatusTab === 'published_bidding') &&
        (this.price.selected.min !== this.price.min ||
          this.price.selected.max !== this.price.max)
      ) {
        queryParams.price_min = this.price.selected.min
        queryParams.price_max = this.price.selected.max
      }

      // Добавляем параметр количества элементов на странице (если не "Все")
      if (this.pagination.perPage > 0) {
        queryParams.limit = this.pagination.perPage
      }

      console.log('CatalogStore - Применяем фильтры:', queryParams)
      return queryParams
    },

    // Установка статуса
    setStatusTab(statusId) {
      // Если выбран тот же таб, ничего не делаем
      if (this.selectedStatusTab === statusId) {
        return
      }

      console.log(
        `CatalogStore - Смена статуса с "${this.selectedStatusTab}" на "${statusId}"`
      )

      // Устанавливаем новый статус
      this.selectedStatusTab = statusId

      // Сбрасываем значения в зависимости от выбранного таба
      if (statusId === 'published_bidding') {
        // Для "Объявленных" сбрасываем поле "Планируемый квартал"
        this.planningQuarter = []
      } else if (statusId === 'prepare_bidding') {
        // Для "Подготовка к торгам" сбрасываем дату окончания и цену
        this.dateRequestEnd = null

        // Сбрасываем значения цены до начальных
        this.price.selected = {
          min: this.price.min,
          max: this.price.max,
        }
      } else if (statusId === 'all') {
        // При переходе на "Все" сбрасываем datepicker
        this.dateRequestEnd = null
      }

      // После изменения фильтра загружаем новые данные
      this.loadCatalogData()
    },

    // --- Действия для каталога ---

    // Загрузка данных каталога на основе фильтров
    async loadCatalogData() {
      // Если уже идет загрузка, не начинаем новый запрос
      // if (this.isLoading) return

      this.isLoading = true
      this.error = null

      try {
        // Получаем параметры фильтров
        const params = this.applyFilters()

        // Добавляем параметры пагинации и сортировки
        params.page = this.pagination.currentPage
        params.limit = this.pagination.perPage
        params.sort = this.sortBy

        console.log('CatalogStore - Загрузка данных с параметрами:', params)

        const response = await axios.get('/api/properties', { params })

        // Проверяем успешность запроса
        if (response.data && response.data.success) {
          this.items = response.data.data || []

          // Обрабатываем навигацию
          if (response.data.nav) {
            this.pagination.currentPage = response.data.nav.NavPageNomer || 1
            this.pagination.totalPages = response.data.nav.NavPageCount || 1
            this.pagination.totalItems = response.data.nav.NavRecordCount || 0
            this.pagination.perPage =
              response.data.nav.NavPageSize || this.pagination.perPage

            console.log('CatalogStore - Данные пагинации:', this.pagination)
          }

          // Устанавливаем заголовок, если он есть
          if (response.data.meta && response.data.meta.content) {
            this.catalogTitle = response.data.meta.content.title || ''
          }

          console.log('CatalogStore - Данные успешно загружены')
          return response.data
        } else {
          throw new Error('Неверный формат ответа API')
        }
      } catch (error) {
        this.error =
          'Ошибка при загрузке данных: ' +
          (error.message || 'Неизвестная ошибка')
        console.error('CatalogStore - Ошибка при загрузке данных:', error)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Смена страницы
    async changePage(page) {
      if (page < 1 || page > this.pagination.totalPages) return

      console.log(
        `CatalogStore - Смена страницы с ${this.pagination.currentPage} на ${page}`
      )
      this.pagination.currentPage = page

      return this.loadCatalogData()
    },

    // Изменение сортировки
    async changeSort(sortBy) {
      console.log(`CatalogStore - Изменение сортировки: ${sortBy}`)
      this.sortBy = sortBy
      return this.loadCatalogData()
    },

    // Изменение типа каталога (проекты или объекты)
    setCatalogTabType(type) {
      console.log(`CatalogStore - Изменение типа каталога: ${type}`)
      this.catalogTabType = type
    },

    // Изменение количества элементов на странице
    async setPageSize(size) {
      console.log(
        `CatalogStore - Изменение количества элементов на странице: ${size}`
      )
      this.pagination.perPage = size
      this.pagination.currentPage = 1 // Сбрасываем на первую страницу

      return this.loadCatalogData()
    },
  },
})
