import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo,  hasMany} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Station from './Station'
import TrainSchedule from './TrainSchedule'
import Coach from './Coach'
import SeatInventory from './SeatInventory'
import Booking from './Booking.js'

export default class Train extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public trainNumber: string

  @column()
  public name: string

  @column()
  public type: 'EXP' | 'SUPERFAST' | 'RAJDHANI' | 'SHATABDI' | 'VANDE_BHARAT'

  @column()
  public sourceStationId: number

  @column()
  public destinationStationId: number

  @column()
  public daysOfRun: string // e.g. "1111111"

  @column()
  public isActive: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // Relationships
  @belongsTo(() => Station, {
    foreignKey: 'sourceStationId',
  })
  public sourceStation: BelongsTo<typeof Station>

  @belongsTo(() => Station, {
    foreignKey: 'destinationStationId',
  })
  public destinationStation: BelongsTo<typeof Station>

  @hasMany(() => TrainSchedule, {
    foreignKey: 'trainId',
  })
  public schedules: HasMany<typeof TrainSchedule>

  @hasMany(() => Coach, {
    foreignKey: 'trainId',
  })
  public coaches: HasMany<typeof Coach>

  @hasMany(() => SeatInventory, {
    foreignKey: 'trainId',
  })
  public inventories: HasMany<typeof SeatInventory>

  @hasMany(() => Booking, {
    foreignKey: 'trainId',
  })
  public bookings: HasMany<typeof Booking>
}