import env from '#start/env'
import { defineConfig } from '@adonisjs/redis'

const redisConfig = defineConfig({
  connection: 'main',
  connections: {
    main: {
      host: env.get('REDIS_HOST', '127.0.0.1'),
      port: env.get('REDIS_PORT', 6379),
      password: env.get('REDIS_PASSWORD', ''),
      db: 0,
      keyPrefix: 'spur:',
    },
  },
})

export default redisConfig

declare module '@adonisjs/redis/types' {
  interface RedisConnections extends InferConnections<typeof redisConfig> {}
}
