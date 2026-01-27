'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Globe } from 'lucide-react'
import { Avatar, UserAvatar } from './Avatar'
import { EnhancedChatMessage } from '@/lib/types'
import { cn, formatDate } from '@/lib/utils'

interface MessageBubbleProps {
  message: EnhancedChatMessage
  avatarName?: string
  isStreaming?: boolean
}

export function MessageBubble({
  message,
  avatarName = 'Assistant',
  isStreaming = false,
}: MessageBubbleProps) {
  const isAI = message.type === 'ai'

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3',
        isAI ? 'bg-gray-50' : 'bg-white'
      )}
    >
      <div className="flex-shrink-0">
        {isAI ? (
          <Avatar name={avatarName} isTyping={isStreaming} />
        ) : (
          <UserAvatar />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900">
            {isAI ? avatarName : 'You'}
          </span>
          {message.timestamp && (
            <span className="text-xs text-gray-500">
              {formatDate(message.timestamp)}
            </span>
          )}
          {message.isWebEnhanced && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              <Globe className="w-3 h-3" />
              Web Enhanced
            </span>
          )}
        </div>
        <div
          className={cn(
            'prose prose-sm max-w-none',
            isAI ? 'text-gray-700' : 'text-gray-800'
          )}
        >
          {isStreaming && !message.content ? (
            <TypingIndicator />
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom rendering for code blocks
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const isInline = !match
                  return isInline ? (
                    <code
                      className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  )
                },
                // Custom link rendering
                a({ href, children }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sagar hover:text-sagar-dark underline"
                    >
                      {children}
                    </a>
                  )
                },
                // Custom list rendering
                ul({ children }) {
                  return (
                    <ul className="list-disc list-inside space-y-1 my-2">
                      {children}
                    </ul>
                  )
                },
                ol({ children }) {
                  return (
                    <ol className="list-decimal list-inside space-y-1 my-2">
                      {children}
                    </ol>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing [animation-delay:0ms]"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing [animation-delay:150ms]"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing [animation-delay:300ms]"></span>
    </div>
  )
}
