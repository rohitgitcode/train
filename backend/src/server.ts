import app from './app.js'
import { env } from './config/env.js'
import { db } from './config/database.js'

async function startServer() {
  try {
    await db.rawQuery('SELECT 1 + 1 AS result')
    console.log('✅ MySQL Database connected successfully with Lucid ORM!')

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`)
    })
  } catch (error) {
    console.error('❌ [FATAL] Server boot failed:', error)
    process.exit(1)
  }
}

startServer()