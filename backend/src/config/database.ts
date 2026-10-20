import { Database } from '@adonisjs/lucid/database'
import { EventEmitter } from 'node:events'
import { env } from './env.js'

// Native Node.js EventEmitter me hasListeners add kar diya
const emitter = new EventEmitter() as any
emitter.hasListeners = (event: string) => emitter.listenerCount(event) > 0

const dummyLogger = {
  log: () => {},
  info: () => {},
  error: console.error,
  warn: console.warn,
  trace: () => {},
  debug: () => {},
}

export const db = new Database(
  {
    connection: 'mysql',
    connections: {
      mysql: {
        client: 'mysql2',
        connection: {
          host: env.DB_HOST,
          port: env.DB_PORT,
          user: env.DB_USER,
          password: env.DB_PASSWORD,
          database: env.DB_NAME,
        },
        pool: {
          min: 2,
          max: 10,
          idleTimeoutMillis: 30000,
        },
        useNullAsDefault: true,
      },
    },
  },
  dummyLogger as any,
  emitter
)