import React from 'react'
import { Check, Target, Send } from 'lucide-react'
import type { UiGoal as Goal } from '../goalTypes'
import { levelLabel } from '../goalUiUtils'
import { MasteryBar } from './MasteryBar'

interface GoalCardProps {
  goal: Goal
  masteryValue: number
  onMasteryChange?: (id: string, value: number) => void
  showLearnerTools: boolean
  isPlanned?: boolean
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, masteryValue, onMasteryChange, showLearnerTools, isPlanned = false }) => {
  const handleChange = onMasteryChange ?? (() => { })

  // Detect if Atomic Goal (no children)
  const isAtomic = !goal.contains || goal.contains.length === 0

  // Determine Status Icon
  let StatusIcon = Target
  let iconColor = "text-red-500"
  let strokeWidth = 2

  if (masteryValue >= 1) {
    StatusIcon = Check
    iconColor = "text-emerald-500"
    strokeWidth = 3
  } else if (isPlanned) {
    StatusIcon = Send
    iconColor = "text-amber-500"
  }

  return (
    <div className="bg-sidebar-bg border border-border-color rounded-3xl p-5 shadow-none dark:shadow-card-2xl transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h2 className="text-2xl font-semibold text-text-primary leading-tight">{goal.title}</h2>
        {isAtomic && (
          <div className={`shrink-0 ${iconColor}`}>
            <StatusIcon size={28} strokeWidth={strokeWidth} />
          </div>
        )}
      </div>

      <p className="mt-2 text-sm text-text-primary leading-relaxed">{goal.description}</p>

      {/* Technical Details removed for Simplified Learner View */}

      {goal.sourceRef && <div className="mt-2 text-[11px] text-text-secondary">Quelle: {goal.sourceRef}</div>}

      {showLearnerTools && (
        <div className="mt-4 space-y-2">
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
