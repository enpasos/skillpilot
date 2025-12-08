import React from 'react'
import type { UiGoal as Goal } from '../goalTypes'
import { masteryColorClass } from '../goalUiUtils'

interface NeighborSectionProps {
  title: string
  emptyLabel: string
  goals: Goal[]
  getMastery: (goalId: string) => number
  onClick: (id: string) => void
  highlightForward?: boolean
  showMastery?: boolean
}

export const NeighborSection: React.FC<NeighborSectionProps> = ({
  title,
  emptyLabel,
  goals,
  getMastery,
  onClick,
  highlightForward,
  showMastery = true,
}) => {
  const boxClass = `glass-panel p-3 ${highlightForward ? 'border-emerald-400/80' : 'border-border-color'
    }`

  return (
    <section className={boxClass}>
      <h3 className="text-xs font-semibold mb-1 text-text-primary">{title}</h3>
      {goals.length === 0 ? (
        <p className="text-[11px] text-text-secondary">{emptyLabel}</p>
      ) : (
        <div className="space-y-1">
          {goals.map((goal) => {
            const value = showMastery ? getMastery(goal.id) : 0
            return (
              <button
                type="button"
                key={goal.id}
                onClick={(e) => {
                  console.log('[NeighborSection] Clicked goal:', goal.id)
                  e.stopPropagation()
                  onClick(goal.id)
                }}
                className={`w-full text-left text-xs rounded-xl border border-border-color bg-input-bg px-2.5 py-2 hover:border-sky-400/80 flex gap-2 ${showMastery ? 'items-center justify-between' : 'items-start'
                  }`}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-text-primary">{goal.title}</div>
                </div>
                {showMastery && <MasteryDot value={value} />}
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

const MasteryDot = ({ value }: { value: number }) => {
  const dotClass = `w-2.5 h-2.5 rounded-full ${masteryColorClass(value)}`
  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className={dotClass} />
      <span className="text-[10px] text-text-secondary tabular-nums">{Math.round(value * 100)}%</span>
    </div>
  )
}
