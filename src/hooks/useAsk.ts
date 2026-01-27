'use client'

import { useState, useCallback, useRef } from 'react'
import { api } from '@/lib/api'
import { AskStreamEvent, SearchResult } from '@/lib/types'
import { generateId } from '@/lib/utils'

export interface AskMessage {
  id: string
  type: 'human' | 'ai' | 'strategy' | 'searching'
  content: string
  timestamp: string
  sources?: SearchResult[]
  strategy?: {
    reasoning: string
    searches: Array<{ search: string; instructions: string }>
  }
}

interface UseAskOptions {
  notebookId: string
  showStrategy?: boolean
}

interface UseAskReturn {
  messages: AskMessage[]
  isAsking: boolean
  error: string | null
  ask: (question: string) => Promise<void>
  cancelAsk: () => void
  clearMessages: () => void
}

export function useAsk({
  notebookId,
  showStrategy = false,
}: UseAskOptions): UseAskReturn {
  const [messages, setMessages] = useState<AskMessage[]>([])
  const [isAsking, setIsAsking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const ask = useCallback(
    async (question: string) => {
      if (!question.trim() || isAsking) return

      setError(null)
      setIsAsking(true)

      // Add user message
      const userMessage: AskMessage = {
        id: generateId(),
        type: 'human',
        content: question.trim(),
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])

      // Create abort controller
      abortControllerRef.current = new AbortController()

      // Add placeholder for AI response
      const aiMessageId = generateId()
      let aiContent = ''
      let strategyData: AskMessage['strategy'] | undefined

      try {
        await api.askStreaming(
          question,
          (event: AskStreamEvent) => {
            switch (event.type) {
              case 'strategy':
                if (showStrategy && event.data) {
                  strategyData = {
                    reasoning: event.data.reasoning || '',
                    searches: event.data.searches || [],
                  }
                  // Add strategy message
                  setMessages((prev) => [
                    ...prev.filter((m) => m.type !== 'searching'),
                    {
                      id: generateId(),
                      type: 'strategy',
                      content: `Searching: ${event.data?.searches?.map((s) => s.search).join(', ')}`,
                      timestamp: new Date().toISOString(),
                      strategy: strategyData,
                    },
                  ])
                } else {
                  // Add searching indicator
                  setMessages((prev) => {
                    const hasSearching = prev.some((m) => m.type === 'searching')
                    if (hasSearching) return prev
                    return [
                      ...prev,
                      {
                        id: 'searching',
                        type: 'searching',
                        content: 'Searching through your materials...',
                        timestamp: new Date().toISOString(),
                      },
                    ]
                  })
                }
                break

              case 'answer':
                // Intermediate answers (can be ignored or shown)
                break

              case 'final_answer':
                aiContent = event.content || ''
                // Remove searching indicator and add final answer
                setMessages((prev) => [
                  ...prev.filter((m) => m.type !== 'searching'),
                  {
                    id: aiMessageId,
                    type: 'ai',
                    content: aiContent,
                    timestamp: new Date().toISOString(),
                    strategy: strategyData,
                  },
                ])
                break

              case 'error':
                setError(event.content || 'An error occurred')
                setMessages((prev) => prev.filter((m) => m.type !== 'searching'))
                break

              case 'complete':
                // Stream completed
                break
            }
          },
          abortControllerRef.current.signal
        )
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          // Request was cancelled
          setMessages((prev) => prev.filter((m) => m.type !== 'searching'))
        } else {
          console.error('Ask failed:', err)
          setError('Failed to get answer. Please try again.')
          setMessages((prev) => prev.filter((m) => m.type !== 'searching'))
        }
      } finally {
        setIsAsking(false)
        abortControllerRef.current = null
      }
    },
    [isAsking, showStrategy]
  )

  const cancelAsk = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsAsking(false)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isAsking,
    error,
    ask,
    cancelAsk,
    clearMessages,
  }
}
