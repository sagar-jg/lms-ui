'use client'

import { useState } from 'react'
import { FileText, ChevronRight, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Keynote } from '@/lib/types'

interface KeynotesPanelProps {
  keynotes?: Keynote[]
  onGenerate?: () => Promise<void>
  isGenerating?: boolean
  className?: string
}

export function KeynotesPanel({
  keynotes = [],
  onGenerate,
  isGenerating = false,
  className,
}: KeynotesPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className={cn('bg-white rounded-xl shadow-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Keynotes</h3>
        </div>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm',
            'bg-purple-600 text-white hover:bg-purple-700 transition-colors',
            'disabled:bg-purple-300 disabled:cursor-not-allowed'
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate</span>
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {keynotes.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">No Keynotes Yet</h4>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-4">
              Generate AI-powered keynotes from your study materials to quickly review key concepts.
            </p>
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
                'bg-purple-600 text-white hover:bg-purple-700 transition-colors',
                'disabled:bg-purple-300 disabled:cursor-not-allowed'
              )}
            >
              <Sparkles className="w-4 h-4" />
              Generate Keynotes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {keynotes.map((keynote) => (
              <div
                key={keynote.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedId(expandedId === keynote.id ? null : keynote.id)
                  }
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900 text-left">
                    {keynote.title}
                  </span>
                  <ChevronRight
                    className={cn(
                      'w-5 h-5 text-gray-400 transition-transform',
                      expandedId === keynote.id && 'rotate-90'
                    )}
                  />
                </button>
                {expandedId === keynote.id && (
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-3">{keynote.summary}</p>
                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Key Points
                      </h5>
                      <ul className="space-y-1">
                        {keynote.keyPoints.map((point, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-gray-700"
                          >
                            <span className="text-purple-500 mt-1">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
