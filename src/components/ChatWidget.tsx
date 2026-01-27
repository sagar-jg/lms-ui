'use client'

import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { ChatHeader } from './ChatHeader'
import { ChatInput } from './ChatInput'
import { MessageBubble } from './MessageBubble'
import { cn } from '@/lib/utils'

interface ChatWidgetProps {
  notebookId: string
  avatarName?: string
  welcomeMessage?: string
  className?: string
}

export function ChatWidget({
  notebookId,
  avatarName = 'Assistant',
  welcomeMessage = "Hi! I'm your learning assistant. How can I help you today?",
  className,
}: ChatWidgetProps) {
  const {
    messages,
    sessions,
    currentSession,
    isLoading,
    isSending,
    error,
    sendMessage,
    switchSession,
    deleteSession,
    clearMessages,
  } = useChat({
    notebookId,
    welcomeMessage,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <ChatHeader
        avatarName={avatarName}
        sessions={sessions}
        currentSession={currentSession}
        onNewChat={clearMessages}
        onSelectSession={switchSession}
        onDeleteSession={deleteSession}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-sagar" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-sagar to-sagar-dark flex items-center justify-center">
              <span className="text-2xl text-white font-bold">
                {avatarName.charAt(0)}
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chat with {avatarName}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Ask me anything about your study materials. I have access to all your uploaded content.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <SuggestedQuestion
                text="Summarize the main concepts"
                onClick={() => sendMessage('Summarize the main concepts from my study materials')}
              />
              <SuggestedQuestion
                text="What are the key takeaways?"
                onClick={() => sendMessage('What are the key takeaways from my materials?')}
              />
              <SuggestedQuestion
                text="Quiz me on this"
                onClick={() => sendMessage('Can you quiz me on the content?')}
              />
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                message={message}
                avatarName={avatarName}
                isStreaming={
                  isSending &&
                  index === messages.length - 1 &&
                  message.type === 'ai'
                }
              />
            ))}
            {isSending && messages[messages.length - 1]?.type === 'human' && (
              <MessageBubble
                message={{
                  id: 'typing',
                  type: 'ai',
                  content: '',
                }}
                avatarName={avatarName}
                isStreaming={true}
              />
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        isSending={isSending}
        disabled={isLoading}
        placeholder={`Ask ${avatarName} anything...`}
      />
    </div>
  )
}

function SuggestedQuestion({
  text,
  onClick,
}: {
  text: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
    >
      {text}
    </button>
  )
}
