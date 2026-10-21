import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './User.js'
import Train from './Train.js'

export default class Booking extends BaseModel {
  public static table = 'bookings'

  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public trainId: number

  @column()
  public pnrNumber: string

  @column.date()
  public journeyDate: DateTime

  @column()
  public coachType: '1A' | '2A' | '3A' | 'SL' | 'CC' | '2S'

  @column()
  public passengersCount: number

  @column()
  public totalFare: number

  @column()
  public status: 'CONFIRMED' | 'CANCELLED' | 'WAITING'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Train, { foreignKey: 'trainId' })
  public train: BelongsTo<typeof Train>
}
