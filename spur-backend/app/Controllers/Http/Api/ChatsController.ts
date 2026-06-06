import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import { sendMessageSchema, historyParamsSchema } from '#app/Validators/ChatValidator'
import { ChatService } from '#app/Services/ChatService'
import { LlmService } from '#app/Services/LlmService'

export default class ChatsController {
  private readonly chatService: ChatService

  constructor() {
    this.chatService = new ChatService(new LlmService())
  }

  async sendMessage({ request, response }: HttpContext) {
    const payload = await request.validateUsing(sendMessageSchema)

    try {
      const result = await this.chatService.sendMessage(payload.message, payload.sessionId)

      return response.ok(result)
    } catch (error: unknown) {
      logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        'Unhandled error in ChatsController.sendMessage'
      )

      return response.internalServerError({
        message: 'An unexpected error occurred. Please try again.',
      })
    }
  }

  async getHistory({ params, response }: HttpContext) {
    const { sessionId } = await historyParamsSchema.validate(params)

    try {
      const history = await this.chatService.getHistory(sessionId)

      if (!history) {
        return response.notFound({ message: 'Conversation not found.' })
      }

      return response.ok(history)
    } catch (error: unknown) {
      logger.error(
        { sessionId, error: error instanceof Error ? error.message : String(error) },
        'Unhandled error in ChatsController.getHistory'
      )

      return response.internalServerError({
        message: 'An unexpected error occurred. Please try again.',
      })
    }
  }
}
