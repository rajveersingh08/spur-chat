import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Conversation from '#app/Models/Conversation'

export type MessageSender = 'user' | 'ai'

export default class Message extends BaseModel {
  public static table = 'messages'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare conversationId: string

  @column()
  declare sender: MessageSender

  @column()
  declare text: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Conversation, {
    foreignKey: 'conversationId',
  })
  declare conversation: BelongsTo<typeof Conversation>
}
