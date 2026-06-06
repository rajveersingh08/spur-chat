import vine from '@vinejs/vine'

export const sendMessageSchema = vine.compile(
  vine.object({
    message: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(2_000),

    sessionId: vine
      .string()
      .uuid({ version: [4] })
      .optional(),
  })
)

export const historyParamsSchema = vine.compile(
  vine.object({
    sessionId: vine
      .string()
      .uuid({ version: [4] }),
  })
)
