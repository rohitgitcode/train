import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Train from './Train'
import Station from './Station'

export default class TrainSchedule extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public trainId: number

  @column()
  public stationId: number

  @column()
  public stopSequence: number

  @column()
  public arrivalTime: string | null

  @column()
  public departureTime: string | null

  @column()
  public dayCount: number

  @column()
  public distanceFromSourceKm: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // Relationships
  @belongsTo(() => Train, {
    foreignKey: 'trainId',
  })
  public train: BelongsTo<typeof Train>

  @belongsTo(() => Station, {
    foreignKey: 'stationId',
  })
  public station: BelongsTo<typeof Station>
}