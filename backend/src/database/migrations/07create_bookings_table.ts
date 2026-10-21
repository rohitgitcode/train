import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bookings'

  public async up() {
    await this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table
        .integer('train_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('trains')
        .onDelete('CASCADE')

      table.string('pnr_number', 10).notNullable().unique()
      table.date('journey_date').notNullable()
      table.enum('coach_type', ['1A', '2A', '3A', 'SL', 'CC', '2S']).notNullable()
      table.integer('passengers_count').unsigned().notNullable()
      table.decimal('total_fare', 10, 2).notNullable()
      table.enum('status', ['CONFIRMED', 'CANCELLED', 'WAITING']).defaultTo('CONFIRMED').notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.index(['user_id'], 'idx_bookings_user')
      table.index(['train_id', 'journey_date'], 'idx_bookings_train_date')
    })
  }

  public async down() {
    return this.schema.dropTable(this.tableName)
  }
}
