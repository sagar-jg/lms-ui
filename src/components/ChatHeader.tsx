'use client'

import { useState } from 'react'
import { MessageSquare, Trash2, Plus, Clock, ChevronDown, X } from 'lucide-react'
import { Avatar } from './Avatar'
import { ChatSession } from '@/lib/types'
import { cn, formatDate, truncateText } from '@/lib/utils'

interface ChatHeaderProps {
  avatarName?: string
  sessions?: ChatSession[]
  currentSession?: ChatSession | null
  onNewChat?: () => void
  onSelectSession?: (sessionId: string) => void
  onDeleteSession?: (sessionId: string) => void
}

export function ChatHeader({
  avatarName = 'Assistant',
  sessions = [],
  currentSession,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}: ChatHeaderProps) {
  const [showSessions, setShowSessions] = useState(false)

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Avatar name={avatarName} size="md" />
          <div>
            <h2 className="font-semibold text-gray-900">{avatarName}</h2>
            <p className="text-xs text-gray-500">Your Learning Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sessions.length > 0 && (
            <button
              onClick={() => setShowSessions(!showSessions)}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm',
                'text-gray-600 hover:bg-gray-100 transition-colors',
                showSessions && 'bg-gray-100'
              )}
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform',
                  showSessions && 'rotate-180'
                )}
              />
            </button>
          )}
          <button
            onClick={onNewChat}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm',
              'bg-sagar text-white hover:bg-sagar-dark transition-colors'
            )}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* Session History Dropdown */}
      {showSessions && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowSessions(false)}
          />
          <div className="absolute right-4 top-full mt-2 w-72 max-h-80 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">
                Chat History
              </span>
              <button
                onClick={() => setShowSessions(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {sessions.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No previous chats
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer',
                      currentSession?.id === session.id && 'bg-sagar-light'
                    )}
                    onClick={() => {
                      onSelectSession?.(session.id)
                      setShowSessions(false)
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-900 truncate">
                          {truncateText(session.title, 30)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 ml-6">
                        {formatDate(session.updated)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSession?.(session.id)
                      }}
                      className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
