import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { db } from '../config/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function run() {
  try {
    console.log('⏳ Running database migrations...')

    const migrationsDir = path.join(__dirname, 'migrations')
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
      .sort()

    for (const file of files) {
      // 01create_users_table skip karo kyunki wo already exist karti hai
      if (file.includes('create_users')) continue

      const filePath = path.join(migrationsDir, file)
      const fileUrl = pathToFileURL(filePath).href
      const migrationModule = await import(fileUrl)

      console.log(`📦 Migrating: ${file}...`)

      if (migrationModule.default && typeof migrationModule.default === 'function') {
        const SchemaClass = migrationModule.default
        const schemaInstance = new SchemaClass(db, 'mysql')

        // Bind schema builder directly from Knex client
        const schemaBuilder = db.connection().schema

        Object.defineProperty(schemaInstance, 'schema', {
          get: () => schemaBuilder,
          configurable: true,
        })

        // Execute and ensure Promise resolves
        await schemaInstance.up()
      } else if (typeof migrationModule.up === 'function') {
        await migrationModule.up()
      }

      console.log(`✅ Success: ${file}`)
    }

    console.log('🚀 All migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await db.manager.closeAll()
    process.exit(0)
  }
}

run()