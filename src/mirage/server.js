// src/mirage/server.js
import { createServer, Response } from 'miragejs'

// Функция для загрузки JSON-файлов
function loadJsonFixtures() {
  const fixtures = {}
  const modules = import.meta.glob('./fixtures/*.json', { eager: true })

  Object.keys(modules).forEach(path => {
    const fileName = path.split('/').pop().replace('.json', '')
    fixtures[fileName] = modules[path].default || modules[path]
  })

  return fixtures
}

export function makeServer({ environment = 'development' } = {}) {
  const fixtures = loadJsonFixtures()

  return createServer({
    environment,

    routes() {
      this.namespace = 'api'

      // Специальный маршрут для filters.json
      this.get('/filters', () => {
        return {
          success: true,
          data: {
            status: {
              values: {
                published_bidding: 'Объявленные',
                prepare_bidding: 'Подготовка к торгам',
              },
            },
            search: [],
            subject_rf: {
              values: {
                '75_168': 'Забайкальский край',
                '55_148': 'Омская область',
                '77_495': 'Москва',
                '78_812': 'Санкт-Петербург',
                '23_861': 'Краснодарский край',
                '66_343': 'Свердловская область',
                '54_383': 'Новосибирская область',
              },
              structure: {
                'Сибирский ФО': {
                  '55_148': 'Омская область',
                  '54_383': 'Новосибирская область',
                },
                'Дальневосточный ФО': {
                  '75_168': 'Забайкальский край',
                },
                'Центральный ФО': {
                  '77_495': 'Москва',
                },
                'Северо-Западный ФО': {
                  '78_812': 'Санкт-Петербург',
                },
                'Южный ФО': {
                  '23_861': 'Краснодарский край',
                },
                'Уральский ФО': {
                  '66_343': 'Свердловская область',
                },
              },
              url: {
                '55_148': 'omsk-region',
                '75_168': 'trans-baikal-territory',
                '77_495': 'moscow',
                '78_812': 'saint-petersburg',
                '23_861': 'krasnodar-region',
                '66_343': 'sverdlovsk-region',
                '54_383': 'novosibirsk-region',
              },
            },
            complex: {
              values: {
                535663: 'Новый ЖК в Омске',
                535665: 'Новый ЖК в Омске 2',
                535667: 'Новый ЖК в Омске 3',
              },
            },
            'planning-quarter': {
              values: {
                q1_2023: 'Q1 2023',
                q2_2023: 'Q2 2023',
                q3_2023: 'Q3 2023',
                q4_2023: 'Q4 2023',
              },
            },
            'date-request-end': {
              from: {
                min: '30.04.2025',
                min_timestamp: 1745960400,
              },
              to: {
                max: '30.04.2025',
                max_timestamp: 1745960400,
              },
            },
            square: {
              from: {
                min: '70.0',
              },
              to: {
                max: '130.0',
              },
            },
            price: {
              from: {
                min: '1000000',
              },
              to: {
                max: '5000000',
              },
            },
            fo: {
              values: {
                'tsentralny-fo': 'Центральный ФО',
                'severo-zapadny-fo': 'Северо-Западный ФО',
                'yuzhny-fo': 'Южный ФО',
                'privolzhskiy-fo': 'Приволжский ФО',
                'uralskiy-fo': 'Уральский ФО',
                'sibirskiy-fo': 'Сибирский ФО',
                'dalnevostochny-fo': 'Дальневосточный ФО',
                'severo-kavkazskiy-fo': 'Северо-Кавказский ФО',
              },
            },
          },
        }
      })

      // Для каждого JSON-файла создаем простой маршрут, возвращающий данные напрямую
      Object.keys(fixtures).forEach(collectionName => {
        // GET для получения всей коллекции
        this.get(`/${collectionName}`, () => {
          // Проверяем структуру данных в JSON-файле
          if (
            fixtures[collectionName][collectionName] &&
            Array.isArray(fixtures[collectionName][collectionName])
          ) {
            // Если данные в JSON имеют формат { "users": [...] }
            return fixtures[collectionName]
          } else {
            // Если данные в JSON имеют формат [...] или другую структуру
            return fixtures[collectionName]
          }
        })

        // GET для получения элемента по ID
        this.get(`/${collectionName}/:id`, (_, request) => {
          const id = request.params.id

          // Определяем, где находятся данные
          let items
          if (
            fixtures[collectionName][collectionName] &&
            Array.isArray(fixtures[collectionName][collectionName])
          ) {
            items = fixtures[collectionName][collectionName]
          } else if (Array.isArray(fixtures[collectionName])) {
            items = fixtures[collectionName]
          } else {
            return new Response(404, {}, { error: 'Данные не найдены' })
          }

          // Ищем элемент по ID
          const item = items.find(item => String(item.id) === String(id))

          if (item) {
            return item // Возвращаем объект напрямую
          } else {
            return new Response(404, {}, { error: 'Элемент не найден' })
          }
        })
      })

      // Сбрасываем namespace
      this.namespace = ''
      this.passthrough()
    },
  })
}
