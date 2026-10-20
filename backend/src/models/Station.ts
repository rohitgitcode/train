import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import TrainSchedule from './TrainSchedule'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Station extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public code: string

  @column()
  public name: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // One Station has many Train Schedules (stops)
  @hasMany(() => TrainSchedule, {
    foreignKey: 'stationId',
  })
  public schedules: HasMany<typeof TrainSchedule>
}