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
  }),

  actions: {
    async fetchFilters() {
      this.isLoading = true
      this.error = null

      try {
        const response = await axios.get('/api/filters')
        const { data } = response.data

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
          this.planningQuarterOptions = Object.entries(
            data['planning-quarter'].values
          ).map(([id, label]) => ({
            id,
            label,
          }))
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

    resetFilters() {
      this.auctionNumber = ''
      this.subjectRf = []
      this.project = []
      this.planningQuarter = []

      // Сбрасываем выбранные значения к исходным границам диапазона
      this.square.selected = {
        min: this.square.min,
        max: this.square.max,
      }

      this.price.selected = {
        min: this.price.min,
        max: this.price.max,
      }
    },

    // Вспомогательный метод для получения списка только регионов (без ФО)
    getSelectedRegions() {
      if (!this.subjectRf || this.subjectRf.length === 0) {
        return []
      }

      // Фильтруем только реальные идентификаторы регионов (не ФО)
      return this.subjectRf.filter(id => !id.startsWith('fo_'))
    },

    applyFilters() {
      console.log('tt', this)
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

      // Добавляем проекты
      if (this.project.length > 0) {
        queryParams.projects = this.project.join(',')
      }

      // Добавляем кварталы
      if (this.planningQuarter.length > 0) {
        queryParams.quarters = this.planningQuarter.join(',')
      }

      // Добавляем параметры площади (используем выбранные значения, а не границы диапазона)
      if (
        this.square.selected.min !== this.square.min ||
        this.square.selected.max !== this.square.max
      ) {
        queryParams.square_min = this.square.selected.min
        queryParams.square_max = this.square.selected.max
      }

      // Добавляем параметры цены (используем выбранные значения, а не границы диапазона)
      if (
        this.price.selected.min !== this.price.min ||
        this.price.selected.max !== this.price.max
      ) {
        queryParams.price_min = this.price.selected.min
        queryParams.price_max = this.price.selected.max
      }

      // Метод для применения фильтров
      console.log('Применяем фильтры:', queryParams)

      // Здесь можно добавить вызов API или другую логику
      // Например:
      // this.fetchFilteredData(queryParams);

      // Возвращаем параметры запроса для возможного использования
      return queryParams
    },

    // Метод для получения данных с примененными фильтрами (будет реализован позже)
    async fetchFilteredData(params) {
      // TODO: Реализовать запрос к API
      console.log('Будет выполнен запрос с параметрами:', params)
    },
  },
})
