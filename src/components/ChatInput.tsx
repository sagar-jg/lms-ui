'use client'

import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  isSending?: boolean
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  isSending = false,
  disabled = false,
  placeholder = 'Ask me anything...',
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    if (!input.trim() || isSending || disabled) return
    onSend(input.trim())
    setInput('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [input, isSending, disabled, onSend])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isSending || disabled}
            rows={1}
            className={cn(
              'w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12',
              'text-gray-900 placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-sagar focus:border-transparent',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || isSending || disabled}
          className={cn(
            'flex items-center justify-center w-11 h-11 rounded-full',
            'bg-sagar text-white shadow-md',
            'hover:bg-sagar-dark transition-colors duration-200',
            'disabled:bg-gray-300 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-sagar focus:ring-offset-2'
          )}
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}
