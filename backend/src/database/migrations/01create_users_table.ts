import { db } from '../../config/database.js'
import { UserRole } from '../../constants/roles.js'

export async function up(): Promise<void> {
  const schema = db.connection().schema

  const hasTable = await schema.hasTable('users')
  if (!hasTable) {
    await schema.createTable('users', (table) => {
      table.bigIncrements('id').primary()
      table.string('full_name', 100).notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('password', 255).notNullable()
      table
        .enum('role', [UserRole.CUSTOMER, UserRole.ADMIN])
        .defaultTo(UserRole.CUSTOMER)
        .notNullable()
      table.timestamps(true, true)
    })
  } else {
    console.log('ℹ️ Table `users` already exists.')
  }
}

export async function down(): Promise<void> {
  const schema = db.connection().schema
  await schema.dropTableIfExists('users')
  console.log('⚠️ Migration: `users` table dropped.')
}