import { up as createUsersTable } from './migrations/create_users_table.js'
import { db } from '../config/database.js'

async function run() {
  try {
    console.log('⏳ Running database migrations...')
    await createUsersTable()
    console.log('🚀 All migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    // Lucid ORM connection pools ko close karne ke liye
    await db.manager.closeAll()
    process.exit(0)
  }
}

run()