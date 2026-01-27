'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ChatWidget } from '@/components/ChatWidget'
import { Loader2 } from 'lucide-react'

function EmbedContent() {
  const searchParams = useSearchParams()

  // Get configuration from URL params (allows dynamic configuration)
  const notebookId =
    searchParams.get('notebook_id') ||
    process.env.NEXT_PUBLIC_DEFAULT_NOTEBOOK_ID ||
    ''
  const avatarName =
    searchParams.get('avatar') ||
    process.env.NEXT_PUBLIC_AVATAR_NAME ||
    'Tang'
  const welcomeMessage =
    searchParams.get('welcome') ||
    process.env.NEXT_PUBLIC_WELCOME_MESSAGE ||
    `Hi! I'm ${avatarName}, your learning assistant. How can I help you today?`

  if (!notebookId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center text-gray-500">
          <p>Missing notebook_id parameter</p>
          <p className="text-sm mt-2">
            Add <code>?notebook_id=YOUR_ID</code> to the URL
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <ChatWidget
        notebookId={notebookId}
        avatarName={avatarName}
        welcomeMessage={welcomeMessage}
        className="h-full rounded-none"
      />
    </div>
  )
}

export default function EmbedPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-sagar" />
        </div>
      }
    >
      <EmbedContent />
    </Suspense>
  )
}
