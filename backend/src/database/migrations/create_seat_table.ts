import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'seat_inventories'

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

      table.date('journey_date').notNullable()
      table
        .enum('coach_type', ['1A', '2A', '3A', 'SL', 'CC', '2S'])
        .notNullable()
      table
        .enum('quota', ['GENERAL', 'TATKAL', 'PREMIUM_TATKAL', 'LADIES'])
        .defaultTo('GENERAL')
        .notNullable()

      table.integer('total_seats').unsigned().notNullable()
      table.integer('available_seats').unsigned().notNullable()

      // Concurrency control: Optimistic locking version
      table.integer('version').unsigned().defaultTo(0).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      // Unique entry for a train, specific date, class, and quota
      table.unique(
        ['train_id', 'journey_date', 'coach_type', 'quota'],
        'uq_train_date_class_quota'
      )
      table.index(
        ['train_id', 'journey_date', 'quota'],
        'idx_inventory_lookup'
      )
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}