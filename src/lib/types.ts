// Chat Types
export interface ChatMessage {
  id: string
  type: 'human' | 'ai'
  content: string
  timestamp?: string
}

// Web Enhanced Chat Message (returned from backend when web search is used)
export interface WebSource {
  title: string
  url: string
  snippet?: string
}

export interface EnhancedChatMessage extends ChatMessage {
  webSources?: WebSource[]
  isWebEnhanced?: boolean
}

export interface ChatSession {
  id: string
  title: string
  notebook_id?: string
  created: string
  updated: string
  message_count?: number
  model_override?: string | null
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[]
}

// API Request/Response Types
export interface CreateSessionRequest {
  notebook_id: string
  title?: string
  model_override?: string
}

export interface UpdateSessionRequest {
  title?: string
  model_override?: string
}

export interface SendMessageRequest {
  session_id: string
  message: string
  context: ChatContext
  model_override?: string
  notebook_id?: string
  enable_web_search?: boolean
}

export interface ChatContext {
  sources: Record<string, unknown>[]
  notes: Record<string, unknown>[]
}

export interface BuildContextRequest {
  notebook_id: string
  context_config: {
    sources: Record<string, string>
    notes: Record<string, string>
  }
}

export interface BuildContextResponse {
  context: ChatContext
  token_count: number
  char_count: number
}

export interface SendMessageResponse {
  session_id: string
  messages: EnhancedChatMessage[]
}

// Notebook Types
export interface Notebook {
  id: string
  name: string
  description?: string
  created: string
  updated: string
}

// Source Types
export interface Source {
  id: string
  title: string
  asset_type: string
  full_text?: string
  insights?: string
  created: string
  updated: string
}

// Note Types
export interface Note {
  id: string
  title: string
  content: string
  note_type?: string
  created: string
  updated: string
}

// Search Types
export interface SearchRequest {
  query: string
  type: 'text' | 'vector'
  limit?: number
  search_sources?: boolean
  search_notes?: boolean
  minimum_score?: number
}

export interface SearchResult {
  id: string
  title: string
  content: string
  score: number
  type: 'source' | 'note'
}

export interface SearchResponse {
  results: SearchResult[]
  total_count: number
  search_type: string
}

// Ask Types (Intelligent Multi-Stage Search)
export interface AskRequest {
  question: string
  notebook_id?: string
}

export interface AskResponse {
  answer: string
  sources?: string[]
}

// Streaming Ask Types
export interface AskStreamEvent {
  type: 'strategy' | 'answer' | 'final_answer' | 'complete' | 'error'
  content?: string
  data?: {
    reasoning?: string
    searches?: Array<{ search: string; instructions: string }>
    source_ids?: string[]
  }
}

export type AskStreamCallback = (event: AskStreamEvent) => void

// Flash Card Types
export interface FlashCard {
  id: string
  question: string
  answer: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

// Keynote Types
export interface Keynote {
  id: string
  title: string
  summary: string
  keyPoints: string[]
}

// Podcast Types
export type EpisodeStatus =
  | 'running'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'error'
  | 'pending'
  | 'submitted'
  | 'unknown'

export interface SpeakerVoiceConfig {
  name: string
  voice_id: string
  backstory: string
  personality: string
}

export interface SpeakerProfile {
  id: string
  name: string
  description: string
  tts_provider: string
  tts_model: string
  speakers: SpeakerVoiceConfig[]
}

export interface EpisodeProfile {
  id: string
  name: string
  description: string
  speaker_config: string
  outline_provider: string
  outline_model: string
  transcript_provider: string
  transcript_model: string
  default_briefing: string
  num_segments: number
}

export interface TranscriptEntry {
  speaker?: string
  dialogue?: string
}

export interface OutlineSegment {
  name?: string
  description?: string
  size?: string
}

export interface PodcastEpisode {
  id: string
  name: string
  episode_profile: EpisodeProfile
  speaker_profile: SpeakerProfile
  briefing: string
  audio_file?: string | null
  audio_url?: string | null
  transcript?: { transcript?: TranscriptEntry[] } | null
  outline?: { segments?: OutlineSegment[] } | null
  created?: string | null
  job_status?: EpisodeStatus | null
}

// Widget Configuration
export interface WidgetConfig {
  apiBaseUrl: string
  apiPassword?: string
  notebookId: string
  avatarName: string
  welcomeMessage: string
  theme?: 'light' | 'dark'
}
