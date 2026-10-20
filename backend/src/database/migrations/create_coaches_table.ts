import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'coaches'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('train_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('trains')
        .onDelete('CASCADE')

      table.string('coach_code', 10).notNullable() // e.g. B1, B2, A1, S1
      table
        .enum('coach_type', ['1A', '2A', '3A', 'SL', 'CC', '2S'])
        .notNullable()
      table.integer('total_seats').unsigned().defaultTo(72).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.unique(['train_id', 'coach_code'], 'uq_train_coach')
      table.index(['train_id', 'coach_type'], 'idx_train_coach_type')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}