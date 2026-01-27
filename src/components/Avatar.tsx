'use client'

import { cn } from '@/lib/utils'

interface AvatarProps {
  name?: string
  size?: 'sm' | 'md' | 'lg'
  isTyping?: boolean
  className?: string
}

export function Avatar({
  name = 'Assistant',
  size = 'md',
  isTyping = false,
  className,
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }

  const initial = name.charAt(0).toUpperCase()

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full bg-gradient-to-br from-sagar to-sagar-dark text-white font-semibold shadow-md',
        sizeClasses[size],
        className
      )}
    >
      {initial}
      {isTyping && (
        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      )}
    </div>
  )
}

export function UserAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-600 font-semibold',
        className
      )}
    >
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )
}
