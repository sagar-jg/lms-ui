'use client'

import { useState } from 'react'
import { MessageSquare, FileText, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabType = 'chat' | 'keynotes' | 'flashcards'

interface FeatureTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  className?: string
}

export function FeatureTabs({
  activeTab,
  onTabChange,
  className,
}: FeatureTabsProps) {
  const tabs = [
    {
      id: 'chat' as TabType,
      label: 'Chat',
      icon: MessageSquare,
      color: 'sagar',
    },
    {
      id: 'keynotes' as TabType,
      label: 'Keynotes',
      icon: FileText,
      color: 'purple',
    },
    {
      id: 'flashcards' as TabType,
      label: 'Flash Cards',
      icon: Layers,
      color: 'amber',
    },
  ]

  const colorClasses = {
    sagar: {
      active: 'bg-sagar text-white',
      inactive: 'text-sagar hover:bg-sagar-light',
    },
    purple: {
      active: 'bg-purple-600 text-white',
      inactive: 'text-purple-600 hover:bg-purple-50',
    },
    amber: {
      active: 'bg-amber-600 text-white',
      inactive: 'text-amber-600 hover:bg-amber-50',
    },
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 p-2 bg-gray-100 rounded-xl',
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        const colors = colorClasses[tab.color as keyof typeof colorClasses]

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive ? colors.active : colors.inactive
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export type { TabType }
