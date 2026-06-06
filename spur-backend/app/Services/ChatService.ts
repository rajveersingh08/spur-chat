import redis from '@adonisjs/redis/services/main'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'

import Conversation from '#app/Models/Conversation'
import Message from '#app/Models/Message'
import { ConversationFilter } from '#app/Models/Filters/ConversationFilter'
import { MessageFilter } from '#app/Models/Filters/MessageFilter'
import { LlmService, type ChatMessage } from '#app/Services/LlmService'

export interface SendMessageResult {
  sessionId: string
  userMessage: {
    id: string
    sender: 'user'
    text: string
    createdAt: string
  }
  aiMessage: {
    id: string
    sender: 'ai'
    text: string
    createdAt: string
  }
}

export interface HistoryResult {
  sessionId: string
  messages: Array<{
    id: string
    sender: 'user' | 'ai'
    text: string
    createdAt: string
  }>
}

const cacheKey = (sessionId: string) => `conversation:${sessionId}:context`

async function readContextFromCache(sessionId: string): Promise<ChatMessage[] | null> {
  try {
    const raw = await redis.get(cacheKey(sessionId))
    if (!raw) return null
    return JSON.parse(raw) as ChatMessage[]
  } catch {
    logger.warn({ sessionId }, 'Redis context cache read failed — falling back to DB')
    return null
  }
}

async function writeContextToCache(
  sessionId: string,
  context: ChatMessage[]
): Promise<void> {
  const ttl = env.get('REDIS_CACHE_TTL_SECONDS', 3600)
  try {
    await redis.setex(cacheKey(sessionId), ttl, JSON.stringify(context))
  } catch {
    logger.warn({ sessionId }, 'Redis context cache write failed — state preserved in DB only')
  }
}

export class ChatService {
  constructor(private readonly llmService: LlmService) {}

  async sendMessage(
    userText: string,
    sessionId?: string
  ): Promise<SendMessageResult> {
    const historyWindow = env.get('CONVERSATION_HISTORY_WINDOW', 20)

    let conversation: Conversation

    if (sessionId) {
      const found = await new ConversationFilter(Conversation.query())
        .byId(sessionId)
        .first()

      if (!found) {
        logger.warn({ sessionId }, 'sessionId not found — creating new conversation')
        conversation = await Conversation.create({
          metadata: { channel: 'widget' },
        })
      } else {
        conversation = found
      }
    } else {
      conversation = await Conversation.create({
        metadata: { channel: 'widget' },
      })
    }

    const userMessage = await Message.create({
      conversationId: conversation.id,
      sender: 'user',
      text: userText,
    })

    let context: ChatMessage[] | null = await readContextFromCache(conversation.id)

    if (!context) {
      const dbMessages = await new MessageFilter(Message.query())
        .byConversation(conversation.id)
        .latestN(historyWindow)
        .fetch()

      context = dbMessages
        .reverse()
        .filter((m) => m.id !== userMessage.id)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text,
        }))

      logger.info({ sessionId: conversation.id }, 'Context window rebuilt from DB (cache miss)')
    }

    const contextWithUserTurn: ChatMessage[] = [
      ...context,
      { role: 'user', content: userText },
    ]

    const { text: aiText } = await this.llmService.chat(context, userText)

    const aiMessage = await Message.create({
      conversationId: conversation.id,
      sender: 'ai',
      text: aiText,
    })

    const updatedContext: ChatMessage[] = [
      ...contextWithUserTurn,
      { role: 'model', content: aiText },
    ]

    const trimmedContext = updatedContext.slice(-historyWindow)
    await writeContextToCache(conversation.id, trimmedContext)

    return {
      sessionId: conversation.id,
      userMessage: {
        id: userMessage.id,
        sender: 'user',
        text: userMessage.text,
        createdAt: userMessage.createdAt.toISO()!,
      },
      aiMessage: {
        id: aiMessage.id,
        sender: 'ai',
        text: aiMessage.text,
        createdAt: aiMessage.createdAt.toISO()!,
      },
    }
  }

  async getHistory(sessionId: string): Promise<HistoryResult | null> {
    const conversation = await new ConversationFilter(Conversation.query())
      .byId(sessionId)
      .withMessages()
      .first()

    if (!conversation) return null

    return {
      sessionId: conversation.id,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        createdAt: m.createdAt.toISO()!,
      })),
    }
  }
}
