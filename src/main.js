// src/main.js или src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
// Импортируем функцию создания сервера
import { makeServer } from './mirage/server'

// Проверяем окружение и создаем сервер только в режиме разработки
if (
  process.env.NODE_ENV === 'development' ||
  import.meta.env.VITE_USE_MIRAGE === 'true'
) {
  makeServer()
}

createApp(App).mount('#app')
