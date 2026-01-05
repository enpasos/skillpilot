import React, { useState } from 'react'
import { Check, Target, Send, RefreshCw } from 'lucide-react'
import type { UiGoal as Goal } from '../goalTypes'

import { MasteryBar } from './MasteryBar'

interface GoalCardProps {
  goal: Goal
  masteryValue: number
  onMasteryChange?: (id: string, value: number) => void
  showLearnerTools: boolean
  isPlanned?: boolean
  isActive?: boolean
  onRefresh?: () => void
  onSetActive?: (id: string) => void
  nextCandidates?: Goal[]
  isFrontier?: boolean
}

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  masteryValue,
  onMasteryChange,
  showLearnerTools,
  isPlanned = false,
  isActive = false,
  onRefresh,
  onSetActive,
  nextCandidates = [],
  isFrontier = false
}) => {
  const handleChange = onMasteryChange ?? (() => { })
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Detect if Atomic Goal (no children)
  const isAtomic = !goal.contains || goal.contains.length === 0
  const canSetActive = Boolean(onSetActive && isAtomic && isFrontier && masteryValue < 1)

  // Determine Status Icon
  let StatusIcon = Target
  let iconColor = "text-red-500"
  let strokeWidth = 2

  if (masteryValue >= 1) {
    StatusIcon = Check
    iconColor = "text-emerald-500"
    strokeWidth = 3
  } else if (isActive) {
    StatusIcon = Send
    iconColor = "text-amber-500"
  } else if (isPlanned) {
    // Planned logic placeholder
  }

  const handleRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  return (
    <div className="bg-sidebar-bg border border-border-color rounded-3xl p-5 shadow-none dark:shadow-card-2xl transition-colors relative group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h2 className="text-2xl font-semibold text-text-primary leading-tight pr-8">{goal.title}</h2>
        <div className="flex items-center gap-2 shrink-0">
          {isAtomic && (
            canSetActive ? (
              <button
                type="button"
                onClick={() => onSetActive?.(goal.id)}
                className="shrink-0 text-amber-500 hover:text-amber-400 transition-colors"
                title="Als aktuelles Ziel auswählen"
              >
                <Send size={28} strokeWidth={2} />
              </button>
            ) : (
              <div className={`shrink-0 ${iconColor}`}>
                <StatusIcon size={28} strokeWidth={strokeWidth} />
              </div>
            )
          )}
        </div>
      </div>

      {/* Refresh Button - positioned absolute top-right but inside padding */}
      {showLearnerTools && onRefresh && (
        <button
          onClick={handleRefresh}
          className="absolute top-5 right-14 p-1 text-slate-400 hover:text-sky-500 transition-colors"
          title="Refresh Goal Status"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      )}

      <div className="mt-2 text-sm text-text-primary leading-relaxed prose dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {goal.description}
        </ReactMarkdown>
      </div>

      {showLearnerTools && (
        <div className="mt-4 space-y-4">

          {/* Frontier Recommendations (When Mastered) */}
          {masteryValue >= 1 && nextCandidates.length > 0 && onSetActive && (
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
              <h3 className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wide mb-3">
                Nächste Schritte
              </h3>
              <div className="flex flex-col gap-2">
                {nextCandidates.slice(0, 3).map(candidate => (
                  <button
                    key={candidate.id}
                    onClick={() => onSetActive(candidate.id)}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-500 transition-colors text-left group/item"
                  >
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover/item:text-amber-600 dark:group-hover/item:text-amber-400">
                      {candidate.title}
                    </span>
                    <Send size={14} className="text-amber-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}


          {/* Action Buttons Row (Only if NOT Mastered) */}
          {isAtomic && !isActive && onSetActive && masteryValue < 1 && isFrontier && (
            <div className="flex justify-end">
              <button
                onClick={() => onSetActive(goal.id)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20 rounded-lg text-sm font-medium transition-colors border border-amber-500/20"
              >
                <Send size={16} />
                <span>Als aktuelles Ziel auswählen</span>
              </button>
            </div>
          )}

          {!isAtomic && (
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span className="font-medium">Kompetenzstand für dieses Lernziel</span>
              <span className="tabular-nums">{Math.round(masteryValue * 100)}%</span>
            </div>
          )}

          {!isAtomic && <MasteryBar value={masteryValue} />}

          {onMasteryChange && (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={Math.round(masteryValue * 100)}
                onChange={(event) => handleChange(goal.id, Number(event.target.value) / 100)}
                className="w-full accent-sky-400"
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleChange(goal.id, 0)}
                  className="rounded-full border border-border-color px-2 py-1 text-[11px] hover:border-text-secondary text-text-secondary"
                >
                  0%
                </button>
                <button
                  type="button"
                  onClick={() => handleChange(goal.id, 0.5)}
                  className="rounded-full border border-border-color px-2 py-1 text-[11px] hover:border-text-secondary text-text-secondary"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handleChange(goal.id, 1)}
                  className="rounded-full border border-border-color px-2 py-1 text-[11px] hover:border-text-secondary text-text-secondary"
                >
                  100%
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
