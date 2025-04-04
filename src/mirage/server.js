// src/mirage/server.js - упрощенная версия
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
