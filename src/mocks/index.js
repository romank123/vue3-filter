export async function setupMocks() {
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('./browser')

    // Запускаем сервис-воркер с опциями
    return worker.start({
      // onUnhandledRequest: 'bypass', // Пропускаем необработанные запросы
      serviceWorker: {
        url: '/mockServiceWorker.js', // Путь к сервис-воркеру
      },
    })
  }

  // В продакшне ничего не делаем
  return Promise.resolve()
}
