import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sendMessage, fetchHistory } from '@/services/api'
import type { ApiMessage } from '@/services/api'

const SESSION_KEY = 'spur_session_id'
const MAX_INPUT = 4000

export const useChatStore = defineStore('chat', () => {
  const mode = ref<'welcome' | 'chat'>('welcome')
  const messages = ref<ApiMessage[]>([])
  const inputText = ref('')
  const isTyping = ref(false)
  const errorMessage = ref('')
  const isLoadingHistory = ref(false)
  const sessionId = ref<string | null>(localStorage.getItem(SESSION_KEY))

  const inputLength = computed(() => inputText.value.length)
  const inputTooLong = computed(() => inputLength.value > MAX_INPUT)
  const canSubmit = computed(
    () => inputText.value.trim().length > 0 && !isTyping.value && !inputTooLong.value
  )
  const hasMessages = computed(() => messages.value.length > 0)

  function enterChat() {
    mode.value = 'chat'
  }

  function persistSession(id: string) {
    sessionId.value = id
    localStorage.setItem(SESSION_KEY, id)
  }

  function clearSession() {
    sessionId.value = null
    messages.value = []
    localStorage.removeItem(SESSION_KEY)
  }

  async function hydrateHistory() {
    if (!sessionId.value) return
    isLoadingHistory.value = true
    try {
      const history = await fetchHistory(sessionId.value)
      if (history) {
        messages.value = history.messages
        if (history.messages.length) mode.value = 'chat'
      } else {
        clearSession()
      }
    } catch {
      clearSession()
    } finally {
      isLoadingHistory.value = false
    }
  }

  async function submit() {
    const text = inputText.value.trim()
    if (!text || isTyping.value) return

    errorMessage.value = ''

    const optimistic: ApiMessage = {
      id: `opt-${Date.now()}`,
      sender: 'user',
      text,
      createdAt: new Date().toISOString(),
    }
    messages.value.push(optimistic)
    inputText.value = ''
    isTyping.value = true

    try {
      const result = await sendMessage(text, sessionId.value ?? undefined)
      const idx = messages.value.findIndex((m) => m.id === optimistic.id)
      if (idx !== -1) messages.value[idx] = result.userMessage
      messages.value.push(result.aiMessage)
      persistSession(result.sessionId)
    } catch (err: unknown) {
      messages.value = messages.value.filter((m) => m.id !== optimistic.id)
      errorMessage.value =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      inputText.value = text
    } finally {
      isTyping.value = false
    }
  }

  function startNewChat() {
    clearSession()
    errorMessage.value = ''
    inputText.value = ''
    mode.value = 'welcome'
  }

  return {
    mode, messages, inputText, isTyping, errorMessage,
    isLoadingHistory,
    inputLength, inputTooLong, canSubmit, hasMessages,
    enterChat, hydrateHistory, submit, startNewChat,
    MAX_INPUT,
  }
})
