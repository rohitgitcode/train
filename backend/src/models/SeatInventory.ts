import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo} from '@adonisjs/lucid/orm'
import Train from './Train'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class SeatInventory extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public trainId: number

  @column.date()
  public journeyDate: DateTime

  @column()
  public coachType: '1A' | '2A' | '3A' | 'SL' | 'CC' | '2S'

  @column()
  public quota: 'GENERAL' | 'TATKAL' | 'PREMIUM_TATKAL' | 'LADIES'

  @column()
  public totalSeats: number

  @column()
  public availableSeats: number

  @column()
  public version: number // Optimistic locking version counter

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // Relationships
  @belongsTo(() => Train, {
    foreignKey: 'trainId',
  })
  public train: BelongsTo<typeof Train>
}