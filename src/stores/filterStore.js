// src/stores/filterStore.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useFilterStore = defineStore('filters', {
  state: () => ({
    isLoading: false,
    error: null,

    // Данные фильтрации
    auctionNumber: '',
    subjectRf: [],
    project: [],
    planningQuarter: [],
    dateRequestEnd: null, // Добавляем поле для даты окончания
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
    pageSize: 12, // По умолчанию 12 элементов на странице
    pageSizeOptions: [
      { id: 12, label: '12' },
      { id: 24, label: '24' },
      { id: 48, label: '48' },
      { id: 0, label: 'Все' },
    ],
  }),

  actions: {
    async fetchFilters() {
      this.isLoading = true
      this.error = null

      try {
        const response = await axios.get('/api/filters')
        const { data } = response.data

        // Загружаем данные статусов
        if (data.status && data.status.values) {
          this.statusOptions = data.status.values
          console.log('FilterStore - Загружены статусы:', this.statusOptions)
        }

        // Преобразовываем данные для subject_rf с учетом структуры (вложенность)
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

          // Добавляем оставшиеся регионы, если они не входят в структуру
          if (data.subject_rf.values) {
            const structureRegionIds = new Set()

            // Собираем все ИД регионов из структуры
            Object.values(data.subject_rf.structure).forEach(regions => {
              Object.keys(regions).forEach(regionId => {
                structureRegionIds.add(regionId)
              })
            })

            // Добавляем регионы, которых нет в структуре
            Object.entries(data.subject_rf.values)
              .filter(([id]) => !structureRegionIds.has(id))
              .forEach(([id, label]) => {
                this.subjectOptions.push({
                  id,
                  label,
                })
              })
          }
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
            // Если values - это массив
            this.planningQuarterOptions = data['planning-quarter'].values.map(
              (value, index) => ({
                id: `q${index + 1}`,
                label: value,
              })
            )
          } else {
            // Если values - это объект
            this.planningQuarterOptions = Object.entries(
              data['planning-quarter'].values
            ).map(([id, label]) => ({
              id,
              label,
            }))
          }
        }

        // Устанавливаем значения для square (интервал 0.1)
        if (data.square) {
          // Корректное преобразование строковых значений в числа с плавающей точкой
          const squareMin = parseFloat(data.square.from?.min || '0')
          const squareMax = parseFloat(data.square.to?.max || '1000')

          console.log('FilterStore - Исходные значения площади:', {
            minRaw: data.square.from?.min,
            maxRaw: data.square.to?.max,
            min: squareMin,
            max: squareMax,
          })

          // Корректируем max так, чтобы (max - min) было кратно 0.1
          const squareRange = squareMax - squareMin
          const adjustedSquareMax =
            squareMin + Math.floor(squareRange / 0.1) * 0.1

          this.square = {
            // Граничные значения диапазона (не меняются при перемещении ползунка)
            min: squareMin,
            max: adjustedSquareMax,
            // Изначально выбранные значения совпадают с границами диапазона
            selected: {
              min: squareMin,
              max: adjustedSquareMax,
            },
          }

          console.log(
            'FilterStore - Установлены значения площади:',
            this.square
          )
        }

        // Устанавливаем значения для price (интервал 100)
        if (data.price) {
          // Используем parseInt для цен (целые числа)
          const priceMin = parseInt(data.price.from?.min || '0', 10)
          const priceMax = parseInt(data.price.to?.max || '2000000', 10)

          console.log('FilterStore - Исходные значения цены:', {
            minRaw: data.price.from?.min,
            maxRaw: data.price.to?.max,
            min: priceMin,
            max: priceMax,
          })

          // Корректируем max так, чтобы (max - min) было кратно 100
          const priceRange = priceMax - priceMin
          const adjustedPriceMax = priceMin + Math.floor(priceRange / 100) * 100

          this.price = {
            // Граничные значения диапазона (не меняются при перемещении ползунка)
            min: priceMin,
            max: adjustedPriceMax,
            // Изначально выбранные значения совпадают с границами диапазона
            selected: {
              min: priceMin,
              max: adjustedPriceMax,
            },
          }

          console.log('FilterStore - Установлены значения цены:', this.price)
        }
      } catch (error) {
        this.error =
          'Ошибка при загрузке фильтров: ' +
          (error.message || 'Неизвестная ошибка')
        console.error('Ошибка при загрузке фильтров:', error)
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
      // НЕ сбрасываем выбранный статус - selectedStatusTab

      // Сбрасываем выбранные значения к исходным границам диапазона
      this.square.selected = {
        min: this.square.min,
        max: this.square.max,
      }

      this.price.selected = {
        min: this.price.min,
        max: this.price.max,
      }

      console.log('FilterStore - Фильтры сброшены')
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

      // Добавляем параметры площади (используем выбранные значения, а не границы диапазона)
      if (
        this.square.selected.min !== this.square.min ||
        this.square.selected.max !== this.square.max
      ) {
        queryParams.square_min = this.square.selected.min
        queryParams.square_max = this.square.selected.max
      }

      // Добавляем параметры цены, если это применимо к текущему выбранному статусу
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
      if (this.pageSize > 0) {
        queryParams.limit = this.pageSize
      }

      // Логгирование параметров запроса
      console.log('FilterStore - Применяем фильтры:', queryParams)

      // Возвращаем параметры запроса для возможного использования
      return queryParams
    },

    // Метод для получения данных с примененными фильтрами
    async fetchFilteredData(params) {
      try {
        const response = await axios.get('/api/properties', { params })
        return response.data
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
        return { success: false, error: error.message }
      }
    },

    // Добавим метод для изменения количества элементов на странице
    setPageSize(size) {
      this.pageSize = size
      console.log(
        `FilterStore - Установлено количество элементов на странице: ${size}`
      )
    },
  },
})
