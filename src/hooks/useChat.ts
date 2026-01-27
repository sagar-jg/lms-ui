'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import {
  ChatSession,
  Source,
  Note,
  ChatContext,
  EnhancedChatMessage,
} from '@/lib/types'
import { generateId } from '@/lib/utils'

interface UseChatOptions {
  notebookId: string
  welcomeMessage?: string
  autoCreateSession?: boolean
}

interface UseChatReturn {
  // State
  messages: EnhancedChatMessage[]
  sessions: ChatSession[]
  currentSession: ChatSession | null
  isLoading: boolean
  isSending: boolean
  error: string | null
  sources: Source[]
  notes: Note[]

  // Actions
  sendMessage: (content: string) => Promise<void>
  createSession: (title?: string) => Promise<ChatSession>
  switchSession: (sessionId: string) => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
  clearMessages: () => void
  refreshSessions: () => Promise<void>
}

export function useChat({
  notebookId,
  welcomeMessage,
  autoCreateSession = true,
}: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [context, setContext] = useState<ChatContext>({ sources: [], notes: [] })

  const initializedRef = useRef(false)

  // Load notebook sources and notes and build context
  const loadNotebookData = useCallback(async () => {
    try {
      const [sourcesData, notesData] = await Promise.all([
        api.getSources(notebookId).catch(() => []),
        api.getNotes(notebookId).catch(() => []),
      ])
      setSources(sourcesData)
      setNotes(notesData)

      // Only build context if we have sources or notes
      if (sourcesData.length > 0 || notesData.length > 0) {
        const contextConfig = {
          sources: Object.fromEntries(
            sourcesData.map((s) => [s.id, 'insights'])
          ),
          notes: Object.fromEntries(
            notesData.map((n) => [n.id, 'full content'])
          ),
        }

        try {
          const contextResponse = await api.buildContext({
            notebook_id: notebookId,
            context_config: contextConfig,
          })
          setContext(contextResponse.context)
        } catch (err) {
          console.error('Failed to build context:', err)
          // Use empty context if build fails
          setContext({ sources: [], notes: [] })
        }
      }
    } catch (err) {
      console.error('Failed to load notebook data:', err)
    }
  }, [notebookId])

  // Load chat sessions
  const loadSessions = useCallback(async () => {
    try {
      const sessionsData = await api.listChatSessions(notebookId)
      setSessions(sessionsData)
      return sessionsData
    } catch (err) {
      console.error('Failed to load sessions:', err)
      return []
    }
  }, [notebookId])

  // Load messages for a session
  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const sessionData = await api.getChatSession(sessionId)
      setMessages(sessionData.messages || [])
      setCurrentSession(sessionData)
    } catch (err) {
      console.error('Failed to load session messages:', err)
      setError('Failed to load chat history')
    }
  }, [])

  // Initialize
  useEffect(() => {
    if (initializedRef.current || !notebookId) return
    initializedRef.current = true

    const initialize = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Load notebook data (sources/notes) and sessions in parallel
        const [, sessionsData] = await Promise.all([
          loadNotebookData(),
          loadSessions(),
        ])

        // If we have an existing session, load it
        if (sessionsData.length > 0) {
          await loadSessionMessages(sessionsData[0].id)
        } else if (welcomeMessage) {
          // No sessions - show welcome message
          setMessages([
            {
              id: 'welcome',
              type: 'ai',
              content: welcomeMessage,
              timestamp: new Date().toISOString(),
            },
          ])
        }
      } catch (err) {
        console.error('Initialization failed:', err)
        setError('Failed to initialize chat')
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [notebookId, welcomeMessage, loadNotebookData, loadSessions, loadSessionMessages])

  // Create new session
  const createSession = useCallback(
    async (title?: string) => {
      try {
        const session = await api.createChatSession({
          notebook_id: notebookId,
          title: title || `Chat ${new Date().toLocaleDateString()}`,
        })
        setSessions((prev) => [session, ...prev])
        setCurrentSession(session)
        setMessages([])
        return session
      } catch (err) {
        console.error('Failed to create session:', err)
        setError('Failed to create chat session')
        throw err
      }
    },
    [notebookId]
  )

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isSending) return

      setError(null)
      setIsSending(true)

      // Optimistically add user message
      const userMessage: EnhancedChatMessage = {
        id: generateId(),
        type: 'human',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => {
        // Remove welcome message if present
        const filtered = prev.filter((m) => m.id !== 'welcome')
        return [...filtered, userMessage]
      })

      try {
        // Create session if needed
        let sessionId = currentSession?.id
        if (!sessionId) {
          const newSession = await api.createChatSession({
            notebook_id: notebookId,
            title: content.slice(0, 50),
          })
          setCurrentSession(newSession)
          setSessions((prev) => [newSession, ...prev])
          sessionId = newSession.id
        }

        // Send message to API with context and notebook_id for web search
        const response = await api.sendMessage({
          session_id: sessionId,
          message: content.trim(),
          context,
          notebook_id: notebookId,
          enable_web_search: true,
        })

        // Update messages with response from API
        // The backend will include isWebEnhanced and webSources if web search was used
        setMessages(response.messages as EnhancedChatMessage[])
      } catch (err) {
        console.error('Failed to send message:', err)
        setError('Failed to send message. Please try again.')
        // Remove optimistic user message on error
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
      } finally {
        setIsSending(false)
      }
    },
    [currentSession, notebookId, context, isSending]
  )

  // Switch session
  const switchSession = useCallback(
    async (sessionId: string) => {
      setIsLoading(true)
      setError(null)
      try {
        await loadSessionMessages(sessionId)
        const session = sessions.find((s) => s.id === sessionId)
        if (session) {
          setCurrentSession(session)
        }
      } catch (err) {
        setError('Failed to switch session')
      } finally {
        setIsLoading(false)
      }
    },
    [sessions, loadSessionMessages]
  )

  // Delete session
  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await api.deleteChatSession(sessionId)
        setSessions((prev) => prev.filter((s) => s.id !== sessionId))
        if (currentSession?.id === sessionId) {
          setCurrentSession(null)
          setMessages([])
          // Show welcome message again
          if (welcomeMessage) {
            setMessages([
              {
                id: 'welcome',
                type: 'ai',
                content: welcomeMessage,
                timestamp: new Date().toISOString(),
              },
            ])
          }
        }
      } catch (err) {
        console.error('Failed to delete session:', err)
        setError('Failed to delete session')
      }
    },
    [currentSession, welcomeMessage]
  )

  // Clear messages (start new conversation)
  const clearMessages = useCallback(() => {
    setMessages([])
    setCurrentSession(null)
    // Show welcome message
    if (welcomeMessage) {
      setMessages([
        {
          id: 'welcome',
          type: 'ai',
          content: welcomeMessage,
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }, [welcomeMessage])

  // Refresh sessions
  const refreshSessions = useCallback(async () => {
    await loadSessions()
  }, [loadSessions])

  return {
    messages,
    sessions,
    currentSession,
    isLoading,
    isSending,
    error,
    sources,
    notes,
    sendMessage,
    createSession,
    switchSession,
    deleteSession,
    clearMessages,
    refreshSessions,
  }
}
