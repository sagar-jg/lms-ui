import {
  ChatMessage,
  ChatSession,
  ChatSessionWithMessages,
  CreateSessionRequest,
  UpdateSessionRequest,
  SendMessageRequest,
  SendMessageResponse,
  BuildContextRequest,
  BuildContextResponse,
  Notebook,
  Source,
  Note,
  AskRequest,
  AskResponse,
  SearchRequest,
  SearchResponse,
  AskStreamEvent,
  AskStreamCallback,
  PodcastEpisode,
} from './types'

// Default model ID for chat (gpt-4o-mini)
const DEFAULT_CHAT_MODEL_ID = 'model:mmbufzrwj11zbcq7kqve'

class ApiClient {
  private baseUrl: string
  private password?: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5055'
    this.password = process.env.NEXT_PUBLIC_API_PASSWORD
  }

  // Helper to ensure notebook ID has the correct format (notebook:id)
  private formatNotebookId(id: string): string {
    if (!id) return id
    return id.startsWith('notebook:') ? id : `notebook:${id}`
  }

  // Helper to ensure source ID has the correct format (source:id)
  private formatSourceId(id: string): string {
    if (!id) return id
    return id.startsWith('source:') ? id : `source:${id}`
  }

  // Helper to ensure session ID has the correct format (chat_session:id)
  private formatSessionId(id: string): string {
    if (!id) return id
    return id.startsWith('chat_session:') ? id : `chat_session:${id}`
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.password) {
      headers['Authorization'] = `Bearer ${this.password}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error (${response.status}): ${errorText}`)
    }

    return response.json()
  }

  // Notebook API
  async getNotebooks(): Promise<Notebook[]> {
    return this.request<Notebook[]>('/api/notebooks')
  }

  async getNotebook(notebookId: string): Promise<Notebook> {
    const id = this.formatNotebookId(notebookId)
    return this.request<Notebook>(`/api/notebooks/${encodeURIComponent(id)}`)
  }

  // Sources API
  async getSources(notebookId: string): Promise<Source[]> {
    const id = this.formatNotebookId(notebookId)
    return this.request<Source[]>(`/api/sources?notebook_id=${encodeURIComponent(id)}`)
  }

  async getSource(sourceId: string): Promise<Source> {
    const id = this.formatSourceId(sourceId)
    return this.request<Source>(`/api/sources/${encodeURIComponent(id)}`)
  }

  // Notes API
  async getNotes(notebookId: string): Promise<Note[]> {
    const id = this.formatNotebookId(notebookId)
    return this.request<Note[]>(`/api/notes?notebook_id=${encodeURIComponent(id)}`)
  }

  // Chat Session API
  async listChatSessions(notebookId: string): Promise<ChatSession[]> {
    const id = this.formatNotebookId(notebookId)
    return this.request<ChatSession[]>(`/api/chat/sessions?notebook_id=${encodeURIComponent(id)}`)
  }

  async createChatSession(data: CreateSessionRequest): Promise<ChatSession> {
    const formattedData = {
      ...data,
      notebook_id: this.formatNotebookId(data.notebook_id),
    }
    return this.request<ChatSession>('/api/chat/sessions', {
      method: 'POST',
      body: JSON.stringify(formattedData),
    })
  }

  async getChatSession(sessionId: string): Promise<ChatSessionWithMessages> {
    const id = this.formatSessionId(sessionId)
    return this.request<ChatSessionWithMessages>(`/api/chat/sessions/${encodeURIComponent(id)}`)
  }

  async updateChatSession(
    sessionId: string,
    data: UpdateSessionRequest
  ): Promise<ChatSession> {
    const id = this.formatSessionId(sessionId)
    return this.request<ChatSession>(`/api/chat/sessions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    const id = this.formatSessionId(sessionId)
    await this.request(`/api/chat/sessions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  }

  // Chat Execution
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const formattedData = {
      ...data,
      session_id: this.formatSessionId(data.session_id),
      model_override: data.model_override || DEFAULT_CHAT_MODEL_ID,
      notebook_id: data.notebook_id ? this.formatNotebookId(data.notebook_id) : undefined,
      enable_web_search: data.enable_web_search ?? true,
    }

    // Define raw API response type with snake_case fields
    interface RawApiMessage extends ChatMessage {
      is_web_enhanced?: boolean
      web_sources?: Array<{ title: string; url: string; snippet?: string }>
    }
    interface RawApiResponse {
      session_id: string
      messages: RawApiMessage[]
    }

    const response = await this.request<RawApiResponse>('/api/chat/execute', {
      method: 'POST',
      body: JSON.stringify(formattedData),
    })

    // Transform snake_case fields to camelCase for web enhanced messages
    return {
      ...response,
      messages: response.messages.map((msg) => ({
        ...msg,
        // Convert snake_case from backend to camelCase for frontend
        isWebEnhanced: msg.is_web_enhanced,
        webSources: msg.web_sources,
      })),
    }
  }

  async buildContext(data: BuildContextRequest): Promise<BuildContextResponse> {
    const formattedData = {
      ...data,
      notebook_id: this.formatNotebookId(data.notebook_id),
    }
    return this.request<BuildContextResponse>('/api/chat/context', {
      method: 'POST',
      body: JSON.stringify(formattedData),
    })
  }

  // Ask API (Simple Q&A without session)
  async ask(data: AskRequest): Promise<AskResponse> {
    return this.request<AskResponse>('/api/search/ask', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async askSimple(question: string, notebookId: string): Promise<AskResponse> {
    const id = this.formatNotebookId(notebookId)
    return this.request<AskResponse>('/api/search/ask/simple', {
      method: 'POST',
      body: JSON.stringify({ question, notebook_id: id }),
    })
  }

  // Vector/Text Search API
  async search(data: SearchRequest): Promise<SearchResponse> {
    return this.request<SearchResponse>('/api/search', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Semantic vector search
  async vectorSearch(
    query: string,
    limit: number = 10,
    minimumScore: number = 0.2
  ): Promise<SearchResponse> {
    return this.search({
      query,
      type: 'vector',
      limit,
      search_sources: true,
      search_notes: true,
      minimum_score: minimumScore,
    })
  }

  // Streaming Ask API with SSE
  async askStreaming(
    question: string,
    onEvent: AskStreamCallback,
    abortSignal?: AbortSignal
  ): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    }

    if (this.password) {
      headers['Authorization'] = `Bearer ${this.password}`
    }

    const response = await fetch(`${this.baseUrl}/api/search/ask`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ question }),
      signal: abortSignal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error (${response.status}): ${errorText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              onEvent(data as AskStreamEvent)
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.slice(6))
          onEvent(data as AskStreamEvent)
        } catch {
          // Skip invalid JSON
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  // Podcast API
  // Helper to ensure episode ID has the correct format (episode:id)
  private formatEpisodeId(id: string): string {
    if (!id) return id
    return id.startsWith('episode:') ? id : `episode:${id}`
  }

  async listPodcastEpisodes(): Promise<PodcastEpisode[]> {
    return this.request<PodcastEpisode[]>('/api/podcasts/episodes')
  }

  async getPodcastEpisode(episodeId: string): Promise<PodcastEpisode> {
    const id = this.formatEpisodeId(episodeId)
    return this.request<PodcastEpisode>(
      `/api/podcasts/episodes/${encodeURIComponent(id)}`
    )
  }

  // Get podcast audio URL (for use with audio element)
  getPodcastAudioUrl(episodeId: string): string {
    const id = this.formatEpisodeId(episodeId)
    return `${this.baseUrl}/api/podcasts/episodes/${encodeURIComponent(id)}/audio`
  }

  // Fetch podcast audio as blob (with auth headers)
  async fetchPodcastAudio(episodeId: string): Promise<Blob> {
    const id = this.formatEpisodeId(episodeId)

    const headers: Record<string, string> = {}
    if (this.password) {
      headers['Authorization'] = `Bearer ${this.password}`
    }

    const response = await fetch(
      `${this.baseUrl}/api/podcasts/episodes/${encodeURIComponent(id)}/audio`,
      { headers }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`)
    }

    return response.blob()
  }
}

// Singleton instance
export const api = new ApiClient()
