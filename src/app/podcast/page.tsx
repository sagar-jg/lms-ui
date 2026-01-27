'use client'

import { Suspense } from 'react'
import { PodcastPanel } from '@/components/PodcastPanel'
import { Loader2, Headphones } from 'lucide-react'

function PodcastContent() {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
          <Headphones className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Study Podcasts</h3>
          <p className="text-xs text-gray-500">Listen to your learning materials</p>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-64px)] overflow-hidden">
        <PodcastPanel className="h-full" />
      </div>
    </div>
  )
}

export default function PodcastPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <PodcastContent />
    </Suspense>
  )
}
