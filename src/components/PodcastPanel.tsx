'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { PodcastEpisode, TranscriptEntry, OutlineSegment } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PodcastPanelProps {
  className?: string
}

export function PodcastPanel({ className }: PodcastPanelProps) {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null)
  const [playingEpisode, setPlayingEpisode] = useState<string | null>(null)
  const [loadingAudioEpisode, setLoadingAudioEpisode] = useState<string | null>(null)
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load episodes on mount
  useEffect(() => {
    const loadEpisodes = async () => {
      try {
        setIsLoading(true)
        const data = await api.listPodcastEpisodes()
        // Filter to only show completed episodes with audio
        const completedEpisodes = data.filter(
          (ep) => ep.job_status === 'completed' && (ep.audio_url || ep.audio_file)
        )
        setEpisodes(completedEpisodes)
      } catch (err) {
        console.error('Failed to load podcasts:', err)
        setError('Failed to load podcasts')
      } finally {
        setIsLoading(false)
      }
    }

    loadEpisodes()
  }, [])

  // Get the base API URL
  const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5055'
  }

  // Resolve audio URL (same approach as Open Notebook frontend)
  const resolveAudioUrl = (audioPath?: string | null): string | undefined => {
    if (!audioPath) return undefined

    // If already a full URL, return as-is
    if (/^https?:\/\//i.test(audioPath)) {
      return audioPath
    }

    const base = getBaseUrl()

    // If starts with /, append to base
    if (audioPath.startsWith('/')) {
      return `${base}${audioPath}`
    }

    return `${base}/${audioPath}`
  }

  // Load audio URL for an episode (fetch with auth headers like Open Notebook does)
  const loadAudioUrl = async (episode: PodcastEpisode) => {
    if (audioUrls[episode.id]) return audioUrls[episode.id]

    const audioPath = episode.audio_url || episode.audio_file
    const directAudioUrl = resolveAudioUrl(audioPath)

    if (!directAudioUrl) {
      console.error('No audio URL available for episode')
      return null
    }

    try {
      // Fetch with auth headers and ngrok bypass header
      const headers: Record<string, string> = {
        'ngrok-skip-browser-warning': 'true', // Required for ngrok to return audio instead of HTML
      }
      const password = process.env.NEXT_PUBLIC_API_PASSWORD
      if (password) {
        headers['Authorization'] = `Bearer ${password}`
      }

      const response = await fetch(directAudioUrl, { headers })
      if (!response.ok) {
        throw new Error(`Audio request failed with status ${response.status}`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrls((prev) => ({ ...prev, [episode.id]: url }))
      return url
    } catch (err) {
      console.error('Failed to load audio:', err)
      return null
    }
  }

  // Play/pause episode
  const togglePlay = async (episode: PodcastEpisode) => {
    if (playingEpisode === episode.id) {
      // Pause current
      audioRef.current?.pause()
      setPlayingEpisode(null)
    } else {
      // Show loading state while fetching audio
      setLoadingAudioEpisode(episode.id)
      try {
        // Load and play new episode
        const url = await loadAudioUrl(episode)
        if (url && audioRef.current) {
          audioRef.current.src = url
          audioRef.current.play()
          setPlayingEpisode(episode.id)
        }
      } finally {
        setLoadingAudioEpisode(null)
      }
    }
  }

  // Handle audio end
  const handleAudioEnd = () => {
    setPlayingEpisode(null)
  }

  // Extract transcript entries
  const getTranscriptEntries = (episode: PodcastEpisode): TranscriptEntry[] => {
    if (episode.transcript && 'transcript' in episode.transcript) {
      return episode.transcript.transcript || []
    }
    return []
  }

  // Extract outline segments
  const getOutlineSegments = (episode: PodcastEpisode): OutlineSegment[] => {
    if (episode.outline && 'segments' in episode.outline) {
      return episode.outline.segments || []
    }
    return []
  }

  // Format date
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-sagar" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center p-8 text-red-500', className)}>
        {error}
      </div>
    )
  }

  if (episodes.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
        <Volume2 className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Podcasts Yet</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Create podcasts from your study materials in Open Notebook to listen here.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={handleAudioEnd} className="hidden" />

      {/* Episode List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {episodes.map((episode) => {
            const isExpanded = expandedEpisode === episode.id
            const isPlaying = playingEpisode === episode.id
            const isLoadingAudio = loadingAudioEpisode === episode.id
            const transcript = getTranscriptEntries(episode)
            const outline = getOutlineSegments(episode)

            return (
              <div
                key={episode.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Episode Header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Play Button */}
                    <button
                      onClick={() => togglePlay(episode)}
                      disabled={isLoadingAudio}
                      className={cn(
                        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                        isPlaying
                          ? 'bg-sagar text-white'
                          : isLoadingAudio
                          ? 'bg-sagar/70 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {isLoadingAudio ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </button>

                    {/* Episode Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {episode.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {episode.episode_profile?.name || 'Unknown profile'}
                        {episode.created && ` • ${formatDate(episode.created)}`}
                      </p>
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() =>
                        setExpandedEpisode(isExpanded ? null : episode.id)
                      }
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Briefing Preview */}
                  {episode.briefing && !isExpanded && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {episode.briefing}
                    </p>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    {/* Briefing */}
                    {episode.briefing && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Briefing
                        </h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {episode.briefing}
                        </p>
                      </div>
                    )}

                    {/* Outline */}
                    {outline.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Outline
                        </h4>
                        <div className="space-y-2">
                          {outline.map((segment, idx) => (
                            <div
                              key={idx}
                              className="bg-white rounded p-2 text-sm border border-gray-100"
                            >
                              <span className="font-medium text-gray-900">
                                {segment.name || `Segment ${idx + 1}`}
                              </span>
                              {segment.description && (
                                <p className="text-gray-600 mt-1">
                                  {segment.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Transcript */}
                    {transcript.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Transcript
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {transcript.map((entry, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium text-sagar">
                                {entry.speaker || 'Speaker'}:
                              </span>{' '}
                              <span className="text-gray-700">
                                {entry.dialogue}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
