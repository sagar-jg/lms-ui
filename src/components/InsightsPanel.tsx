'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Lightbulb,
  Plus,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { SourceInsight, Transformation, Source } from '@/lib/types'

interface InsightsPanelProps {
  notebookId: string
  className?: string
}

export function InsightsPanel({ notebookId, className }: InsightsPanelProps) {
  const [sources, setSources] = useState<Source[]>([])
  const [selectedSourceId, setSelectedSourceId] = useState<string>('')
  const [insights, setInsights] = useState<SourceInsight[]>([])
  const [transformations, setTransformations] = useState<Transformation[]>([])
  const [selectedTransformation, setSelectedTransformation] = useState<string>('')
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null)

  const [loadingSources, setLoadingSources] = useState(true)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [loadingTransformations, setLoadingTransformations] = useState(true)
  const [creatingInsight, setCreatingInsight] = useState(false)
  const [deletingInsightId, setDeletingInsightId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch sources for the notebook
  const fetchSources = useCallback(async () => {
    if (!notebookId) return
    try {
      setLoadingSources(true)
      setError(null)
      const data = await api.getSources(notebookId)
      setSources(data)
      if (data.length > 0 && !selectedSourceId) {
        setSelectedSourceId(data[0].id)
      }
    } catch (err) {
      console.error('Failed to fetch sources:', err)
      setError('Failed to load sources')
    } finally {
      setLoadingSources(false)
    }
  }, [notebookId, selectedSourceId])

  // Fetch transformations
  const fetchTransformations = useCallback(async () => {
    try {
      setLoadingTransformations(true)
      const data = await api.listTransformations()
      setTransformations(data)
      if (data.length > 0 && !selectedTransformation) {
        setSelectedTransformation(data[0].id)
      }
    } catch (err) {
      console.error('Failed to fetch transformations:', err)
    } finally {
      setLoadingTransformations(false)
    }
  }, [selectedTransformation])

  // Fetch insights for selected source
  const fetchInsights = useCallback(async () => {
    if (!selectedSourceId) {
      setInsights([])
      return
    }
    try {
      setLoadingInsights(true)
      setError(null)
      const data = await api.listInsightsForSource(selectedSourceId)
      setInsights(data)
    } catch (err) {
      console.error('Failed to fetch insights:', err)
      setError('Failed to load insights')
    } finally {
      setLoadingInsights(false)
    }
  }, [selectedSourceId])

  // Initial data fetch
  useEffect(() => {
    fetchSources()
    fetchTransformations()
  }, [fetchSources, fetchTransformations])

  // Fetch insights when source changes
  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  // Create new insight
  const handleCreateInsight = async () => {
    if (!selectedSourceId || !selectedTransformation) return

    try {
      setCreatingInsight(true)
      setError(null)
      await api.createInsight(selectedSourceId, {
        transformation_id: selectedTransformation,
      })
      await fetchInsights()
    } catch (err) {
      console.error('Failed to create insight:', err)
      setError('Failed to generate insight')
    } finally {
      setCreatingInsight(false)
    }
  }

  // Delete insight
  const handleDeleteInsight = async (insightId: string) => {
    try {
      setDeletingInsightId(insightId)
      setError(null)
      await api.deleteInsight(insightId)
      setInsights((prev) => prev.filter((i) => i.id !== insightId))
      if (expandedInsightId === insightId) {
        setExpandedInsightId(null)
      }
    } catch (err) {
      console.error('Failed to delete insight:', err)
      setError('Failed to delete insight')
    } finally {
      setDeletingInsightId(null)
    }
  }

  // Toggle insight expansion
  const toggleInsightExpansion = (insightId: string) => {
    setExpandedInsightId((prev) => (prev === insightId ? null : insightId))
  }

  // Get selected source name
  const selectedSource = sources.find((s) => s.id === selectedSourceId)

  if (loadingSources) {
    return (
      <div className={cn('flex flex-col h-full bg-gradient-to-br from-purple-50 to-indigo-50', className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-600">Loading sources...</p>
          </div>
        </div>
      </div>
    )
  }

  if (sources.length === 0) {
    return (
      <div className={cn('flex flex-col h-full bg-gradient-to-br from-purple-50 to-indigo-50', className)}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Sources Available</h3>
            <p className="text-gray-600 max-w-xs mx-auto">
              Add sources to your notebook to generate insights.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-md">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Insights</h3>
            <p className="text-xs text-gray-500">
              {insights.length} insight{insights.length !== 1 ? 's' : ''} generated
            </p>
          </div>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loadingInsights}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          title="Refresh insights"
        >
          <RefreshCw className={cn('w-5 h-5', loadingInsights && 'animate-spin')} />
        </button>
      </div>

      {/* Source Selector */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white/50">
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Select Source</label>
        <select
          value={selectedSourceId}
          onChange={(e) => setSelectedSourceId(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.title || 'Untitled Source'}
            </option>
          ))}
        </select>
      </div>

      {/* Generate Insight Section */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-700">Generate New Insight</span>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedTransformation}
            onChange={(e) => setSelectedTransformation(e.target.value)}
            disabled={loadingTransformations || creatingInsight}
            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          >
            {loadingTransformations ? (
              <option>Loading...</option>
            ) : transformations.length === 0 ? (
              <option>No transformations available</option>
            ) : (
              transformations.map((trans) => (
                <option key={trans.id} value={trans.id}>
                  {trans.title || trans.name}
                </option>
              ))
            )}
          </select>
          <button
            onClick={handleCreateInsight}
            disabled={!selectedSourceId || !selectedTransformation || creatingInsight || loadingTransformations}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
              'hover:from-purple-600 hover:to-indigo-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {creatingInsight ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      {/* Insights List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loadingInsights ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm">
              No insights yet for this source.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Select a transformation and click Generate.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Insight Header */}
                <div
                  onClick={() => toggleInsightExpansion(insight.id)}
                  className="flex items-start justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full uppercase">
                        {insight.insight_type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(insight.created).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {insight.content.slice(0, 150)}
                      {insight.content.length > 150 ? '...' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteInsight(insight.id)
                      }}
                      disabled={deletingInsightId === insight.id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Delete insight"
                    >
                      {deletingInsightId === insight.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                    {expandedInsightId === insight.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedInsightId === insight.id && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="pt-4 prose prose-sm prose-gray max-w-none">
                      <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                        {insight.content}
                      </div>
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
