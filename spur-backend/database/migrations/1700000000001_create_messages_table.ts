import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table
        .uuid('conversation_id')
        .notNullable()
        .references('id')
        .inTable('conversations')
        .onDelete('CASCADE')
        .index()

      table
        .enu('sender', ['user', 'ai'], {
          useNative: true,
          enumName: 'message_sender_enum',
          existingType: false,
          schemaName: 'public',
        })
        .notNullable()

      table.text('text').notNullable()

      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS "message_sender_enum"')
  }
}
