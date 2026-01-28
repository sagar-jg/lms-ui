'use client'

import { Suspense } from 'react'
import { InsightsPanel } from '@/components/InsightsPanel'
import { Loader2, Lightbulb } from 'lucide-react'

// Get notebook ID from environment
const NOTEBOOK_ID = process.env.NEXT_PUBLIC_DEFAULT_NOTEBOOK_ID || ''

function InsightsContent() {
  if (!NOTEBOOK_ID) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
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
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-md">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Source Insights</h3>
          <p className="text-xs text-gray-500">Generate AI insights from your sources</p>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-64px)] overflow-hidden">
        <InsightsPanel notebookId={NOTEBOOK_ID} className="h-full" />
      </div>
    </div>
  )
}

export default function InsightsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <InsightsContent />
    </Suspense>
  )
}
