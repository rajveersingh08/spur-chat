import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type Message from '#app/Models/Message'

type Builder = ModelQueryBuilderContract<typeof Message>

export class MessageFilter {
  constructor(private query: Builder) {}

  byConversation(conversationId: string): this {
    this.query = this.query.where('conversation_id', conversationId)
    return this
  }

  latestN(n: number): this {
    this.query = this.query.orderBy('created_at', 'desc').limit(n)
    return this
  }

  async fetch() {
    return this.query.exec()
  }
}
