// src/main.js или src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
// Импортируем Pinia
import { pinia } from './stores'
// Импортируем функцию создания сервера
import { makeServer } from './mirage/server'

// Проверяем окружение и создаем сервер только в режиме разработки
if (
  process.env.NODE_ENV === 'development' ||
  import.meta.env.VITE_USE_MIRAGE === 'true'
) {
  makeServer()
}
const app = createApp(App)
app.use(pinia) // Используем Pinia
app.mount('#app')
