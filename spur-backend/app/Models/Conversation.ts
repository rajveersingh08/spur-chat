import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Message from '#app/Models/Message'

export default class Conversation extends BaseModel {
  public static table = 'conversations'

  @column({ isPrimary: true })
  declare id: string

  @column({
    consume: (value: string) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Message, {
    foreignKey: 'conversationId',
  })
  declare messages: HasMany<typeof Message>
}
