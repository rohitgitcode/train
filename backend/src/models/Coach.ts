import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Train from './Train'

export default class Coach extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public trainId: number

  @column()
  public coachCode: string // e.g. B1, B2, A1, S1

  @column()
  public coachType: '1A' | '2A' | '3A' | 'SL' | 'CC' | '2S'

  @column()
  public totalSeats: number

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