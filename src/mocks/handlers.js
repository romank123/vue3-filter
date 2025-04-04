import { http, HttpResponse } from 'msw'

export const handlers = [
  // GET запрос к вашему API endpoint
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'Иван', email: 'ivan@example.com' },
      { id: 2, name: 'Мария', email: 'maria@example.com' },
    ])
  }),

  // GET запрос с параметрами
  http.get('https://api.yourproject.com/users/:id', ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      id: Number(id),
      name: `Пользователь ${id}`,
      email: `user${id}@example.com`,
    })
  }),

  // POST запрос
  http.post('https://api.yourproject.com/users', async ({ request }) => {
    const newUser = await request.json()
    return HttpResponse.json({ ...newUser, id: 999 }, { status: 201 })
  }),

  // Имитация ошибки
  http.get('https://api.yourproject.com/error', () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error',
    })
  }),
]
