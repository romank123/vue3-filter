// src/mocks/browser.js
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Экспортируем сконфигурированный сервис-воркер
export const worker = setupWorker(...handlers)

// НЕ запускайте worker.start() здесь, только в main.js
