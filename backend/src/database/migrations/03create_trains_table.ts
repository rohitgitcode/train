import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'trains'

  public async up() {
    await this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('train_number', 10).notNullable().unique() // e.g. 12951
      table.string('name', 100).notNullable()
      table
        .enum('type', ['EXP', 'SUPERFAST', 'RAJDHANI', 'SHATABDI', 'VANDE_BHARAT'])
        .defaultTo('EXP')
        .notNullable()
      table.boolean('is_active').defaultTo(true).notNullable()
      table
        .integer('source_station_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('stations')
        .onDelete('RESTRICT')

      table
        .integer('destination_station_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('stations')
        .onDelete('RESTRICT')

      table.string('days_of_run', 7).defaultTo('1111111').notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.index(['train_number'], 'idx_trains_number')
    })
  }

  public async down() {
   return this.schema.dropTable(this.tableName)
  }
}