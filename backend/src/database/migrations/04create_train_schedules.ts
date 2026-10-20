import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'train_schedules'

  public async up() {
    await this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Foreign Keys
      table
        .integer('train_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('trains')
        .onDelete('CASCADE')

      table
        .integer('station_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('stations')
        .onDelete('RESTRICT')

      // Stop Sequence & Timings
      table.integer('stop_sequence').unsigned().notNullable() // 1, 2, 3...
      table.time('arrival_time').nullable()                    // NULL for source station
      table.time('departure_time').nullable()                  // NULL for destination station
      table.integer('day_count').unsigned().defaultTo(1).notNullable() // Overnight journey tracking
      table.decimal('distance_from_source_km', 8, 2).defaultTo(0.0).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      // Constraints & Indexes
      table.unique(['train_id', 'station_id'], 'uq_train_station')
      table.unique(['train_id', 'stop_sequence'], 'uq_train_stop_sequence')
      table.index(['station_id', 'train_id'], 'idx_station_train_lookup')
    })
  }

  public async down() {
   return this.schema.dropTable(this.tableName)
  }
}