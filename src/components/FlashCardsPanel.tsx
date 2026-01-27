'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  CheckCircle2,
  Circle,
  Keyboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FlashCard } from '@/lib/types'

interface FlashCardsPanelProps {
  flashCards?: FlashCard[]
  className?: string
}

export function FlashCardsPanel({
  flashCards = [],
  className,
}: FlashCardsPanelProps) {
  const [cards, setCards] = useState<FlashCard[]>(flashCards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set())
  const [showKeyboardHint, setShowKeyboardHint] = useState(true)

  const currentCard = cards[currentIndex]
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0

  const goToPrevious = useCallback(() => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1))
  }, [cards.length])

  const goToNext = useCallback(() => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0))
  }, [cards.length])

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  const toggleMastered = useCallback(() => {
    if (!currentCard) return
    setMasteredCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(currentCard.id)) {
        newSet.delete(currentCard.id)
      } else {
        newSet.add(currentCard.id)
      }
      return newSet
    })
  }, [currentCard])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        flipCard()
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMastered()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrevious, goToNext, flipCard, toggleMastered])

  // Hide keyboard hint after first interaction
  useEffect(() => {
    if (showKeyboardHint) {
      const timer = setTimeout(() => setShowKeyboardHint(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showKeyboardHint])

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const resetProgress = () => {
    setCards(flashCards)
    setCurrentIndex(0)
    setIsFlipped(false)
    setMasteredCards(new Set())
  }

  const difficultyColors = {
    easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    hard: 'bg-rose-100 text-rose-700 border-rose-200',
  }

  const difficultyGradients = {
    easy: 'from-emerald-400 to-teal-500',
    medium: 'from-amber-400 to-orange-500',
    hard: 'from-rose-400 to-pink-500',
  }

  // Count cards by difficulty
  const difficultyCounts = cards.reduce(
    (acc, card) => {
      const diff = card.difficulty || 'medium'
      acc[diff] = (acc[diff] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  if (cards.length === 0) {
    return (
      <div className={cn('flex flex-col h-full bg-gradient-to-br from-amber-50 to-orange-50', className)}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Layers className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Flash Cards Available</h3>
            <p className="text-gray-600 max-w-xs mx-auto">
              Flash cards will appear here when available for your study materials.
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Flash Cards</h3>
            <p className="text-xs text-gray-500">
              {masteredCards.size} of {cards.length} mastered
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={shuffleCards}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title="Shuffle cards"
          >
            <Shuffle className="w-5 h-5" />
          </button>
          <button
            onClick={resetProgress}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title="Reset progress"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-white/50">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{currentIndex + 1} / {cards.length}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Difficulty Stats */}
      <div className="flex justify-center gap-3 px-4 py-2">
        {(['easy', 'medium', 'hard'] as const).map((diff) => (
          <div
            key={diff}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border',
              difficultyColors[diff]
            )}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}: {difficultyCounts[diff] || 0}
          </div>
        ))}
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Current Card Info */}
        <div className="flex items-center gap-3 mb-4">
          {currentCard?.difficulty && (
            <span
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border',
                difficultyColors[currentCard.difficulty]
              )}
            >
              {currentCard.difficulty.charAt(0).toUpperCase() + currentCard.difficulty.slice(1)}
            </span>
          )}
          <button
            onClick={toggleMastered}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors',
              masteredCards.has(currentCard?.id || '')
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            )}
          >
            {masteredCards.has(currentCard?.id || '') ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mastered
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5" />
                Mark as Mastered
              </>
            )}
          </button>
        </div>

        {/* Flash Card */}
        <div
          onClick={flipCard}
          className="relative w-full max-w-md h-56 cursor-pointer"
        >
          <div
            className="absolute inset-0 w-full h-full transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
            }}
          >
            {/* Front (Question) */}
            <div
              className={cn(
                'absolute inset-0 w-full h-full',
                'flex flex-col items-center justify-center p-6',
                'bg-gradient-to-br rounded-2xl shadow-xl',
                'text-white',
                currentCard?.difficulty
                  ? difficultyGradients[currentCard.difficulty]
                  : 'from-amber-400 to-orange-500'
              )}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <span className="text-xs uppercase tracking-wider opacity-80 mb-3 font-medium">
                Question
              </span>
              <p className="text-base font-medium text-center leading-relaxed overflow-y-auto max-h-32 px-2">
                {currentCard?.question}
              </p>
              <span className="absolute bottom-4 text-xs opacity-60">
                Click to reveal answer
              </span>
            </div>

            {/* Back (Answer) */}
            <div
              className={cn(
                'absolute inset-0 w-full h-full',
                'flex flex-col items-center justify-center p-6',
                'bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl shadow-xl',
                'text-white'
              )}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <span className="text-xs uppercase tracking-wider opacity-80 mb-3 font-medium text-emerald-400">
                Answer
              </span>
              <p className="text-sm font-medium text-center leading-relaxed overflow-y-auto max-h-32 px-2">
                {currentCard?.answer}
              </p>
              <span className="absolute bottom-4 text-xs opacity-60">
                Click to see question
              </span>
            </div>
          </div>
        </div>

        {/* Keyboard Hint */}
        {showKeyboardHint && (
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 animate-pulse">
            <Keyboard className="w-4 h-4" />
            <span>Arrow keys to navigate • Space to flip • M to mark mastered</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <button
          onClick={goToPrevious}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        {/* Card Dots */}
        <div className="flex items-center gap-1 max-w-[200px] overflow-hidden">
          {cards.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((card, idx) => {
            const actualIndex = Math.max(0, currentIndex - 3) + idx
            return (
              <button
                key={card.id}
                onClick={() => {
                  setCurrentIndex(actualIndex)
                  setIsFlipped(false)
                }}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  actualIndex === currentIndex
                    ? 'w-6 bg-amber-500'
                    : masteredCards.has(card.id)
                    ? 'bg-emerald-400'
                    : 'bg-gray-300 hover:bg-gray-400'
                )}
              />
            )
          })}
        </div>

        <button
          onClick={goToNext}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
