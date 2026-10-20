import { BaseModel, column, beforeSave } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import argon2 from 'argon2'
import { UserRole } from '../constants/roles.js'
import { db } from '../config/database.js'


BaseModel.useAdapter(db.modelAdapter())

export default class User extends BaseModel {
  public static table = 'users'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string

  @column()
  declare email: string

  @column({ serializeAs: null }) 
  declare password: string

  @column()
  declare role: UserRole

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await argon2.hash(user.password)
    }
  }

  public async verifyPassword(plainPassword: string): Promise<boolean> {
    return argon2.verify(this.password, plainPassword)
  }
}