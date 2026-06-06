import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.post('/chat/message', [
      () => import('#app/Controllers/Http/Api/ChatsController'),
      'sendMessage',
    ])

    router.get('/chat/history/:sessionId', [
      () => import('#app/Controllers/Http/Api/ChatsController'),
      'getHistory',
    ])
  })
  .prefix('/api/v1')
