import axios from 'axios'

export interface ApiMessage {
  id: string
  sender: 'user' | 'ai'
  text: string
  createdAt: string
}

interface SendMessageResponse {
  sessionId: string
  userMessage: ApiMessage
  aiMessage: ApiMessage
}

interface HistoryResponse {
  sessionId: string
  messages: ApiMessage[]
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30_000,
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage: string =
      error?.response?.data?.message ?? error?.message ?? 'An unexpected error occurred.'

    return Promise.reject(new Error(serverMessage))
  }
)

export async function sendMessage(
  message: string,
  sessionId?: string
): Promise<SendMessageResponse> {
  const { data } = await http.post<SendMessageResponse>('/chat/message', {
    message,
    sessionId,
  })
  return data
}

export async function fetchHistory(sessionId: string): Promise<HistoryResponse | null> {
  try {
    const { data } = await http.get<HistoryResponse>(`/chat/history/${sessionId}`)
    return data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw error
  }
}
