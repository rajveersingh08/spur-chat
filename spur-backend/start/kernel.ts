import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

server.errorHandler(() => import('#app/Exceptions/Handler'))

server.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
])

export const middleware = router.named({})
