'use client'

import { useState } from 'react'
import { MessageSquare, Headphones, Layers } from 'lucide-react'
import { ChatWidget } from '@/components/ChatWidget'
import { PodcastPanel } from '@/components/PodcastPanel'
import { FlashCardsPanel } from '@/components/FlashCardsPanel'
import { quantumComputingFlashCards } from '@/data/flashcards'
import { cn } from '@/lib/utils'

// Get configuration from environment variables
const NOTEBOOK_ID = process.env.NEXT_PUBLIC_DEFAULT_NOTEBOOK_ID || ''
const AVATAR_NAME = process.env.NEXT_PUBLIC_AVATAR_NAME || 'Tang'
const WELCOME_MESSAGE =
  process.env.NEXT_PUBLIC_WELCOME_MESSAGE ||
  "Hi! I'm Tang, your learning assistant. How can I help you with your studies today?"

type Tab = 'chat' | 'flashcards' | 'podcasts' 

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('chat')

  if (!NOTEBOOK_ID) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Configuration Required</h1>
          <p className="text-gray-600 mb-4">
            Please configure your notebook ID in the environment variables.
          </p>
          <div className="bg-gray-100 rounded-lg p-3 text-left">
            <p className="text-sm text-gray-700 font-mono">
              NEXT_PUBLIC_DEFAULT_NOTEBOOK_ID=your-notebook-id
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Copy <code className="bg-gray-100 px-1 rounded">.env.local.example</code> to{' '}
            <code className="bg-gray-100 px-1 rounded">.env.local</code> and update the values.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meet {AVATAR_NAME}
          </h1>
          <p className="text-gray-600">
            Your AI-powered learning companion
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'chat'
                  ? 'bg-white text-sagar shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'flashcards'
                  ? 'bg-white text-sagar shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Layers className="w-4 h-4" />
              Flash Cards
            </button>
            <button
              onClick={() => setActiveTab('podcasts')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === 'podcasts'
                  ? 'bg-white text-sagar shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Headphones className="w-4 h-4" />
              Podcasts
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="h-[600px] bg-white rounded-xl shadow-lg overflow-hidden">
          {activeTab === 'chat' && (
            <ChatWidget
              notebookId={NOTEBOOK_ID}
              avatarName={AVATAR_NAME}
              welcomeMessage={WELCOME_MESSAGE}
              className="h-full"
            />
          )}
          {activeTab === 'flashcards' && (
            <FlashCardsPanel
              flashCards={quantumComputingFlashCards}
              className="h-full"
            />
          )}
          {activeTab === 'podcasts' && (
            <PodcastPanel className="h-full" />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-sm text-gray-500">
          Powered by{' '}
          <a
            href="https://github.com/lfnovo/open-notebook"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sagar hover:underline"
          >
            Open Notebook
          </a>
        </div>
      </div>
    </main>
  )
}
