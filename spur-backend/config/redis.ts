import env from '#start/env'
import { defineConfig } from '@adonisjs/redis'

const redisHost = env.get('REDIS_HOST', '127.0.0.1')
const redisPassword = env.get('REDIS_PASSWORD')

const redisConfig = defineConfig({
  connection: 'main',
  connections: {
    main: {
      host: redisHost,
      port: env.get('REDIS_PORT', 6379),
      password: redisPassword || undefined,
      db: 0,
      keyPrefix: 'spur:',
      ...(redisHost.includes('upstash.io') ? { tls: {} } : {}),
    },
  },
})

export default redisConfig

declare module '@adonisjs/redis/types' {
  interface RedisConnections extends InferConnections<typeof redisConfig> {}
}
