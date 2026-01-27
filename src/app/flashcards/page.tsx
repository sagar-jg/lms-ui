'use client'

import { Suspense } from 'react'
import { FlashCardsPanel } from '@/components/FlashCardsPanel'
import { quantumComputingFlashCards } from '@/data/flashcards'
import { Loader2 } from 'lucide-react'

function FlashCardsContent() {
  return (
    <div className="h-screen">
      <FlashCardsPanel
        flashCards={quantumComputingFlashCards}
        className="h-full rounded-none"
      />
    </div>
  )
}

export default function FlashCardsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <FlashCardsContent />
    </Suspense>
  )
}
