import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type Conversation from '#app/Models/Conversation'

type Builder = ModelQueryBuilderContract<typeof Conversation>

export class ConversationFilter {
  constructor(private query: Builder) {}

  byId(id: string): this {
    this.query = this.query.where('id', id)
    return this
  }

  withMessages(): this {
    this.query = this.query.preload('messages', (msgQuery) => {
      msgQuery.orderBy('created_at', 'asc')
    })
    return this
  }

  async first() {
    return this.query.first()
  }
}
