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

      {/* Technical Details - Only shown for Non-Atomic Goals (Clusters) OR if you want to keep them for atomic goals but user asked to simplify. 
          User said "die atomaren Ziele könnte man wie folgt vereinfachen" implying hiding details for them. 
      */}
      {!isAtomic && (
        <>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-secondary">
            <span className="rounded-full border border-border-color px-3 py-1">
              Phase {goal.phase} · {goal.area}
            </span>
            <span className="rounded-full border border-border-color px-3 py-1">{levelLabel(goal.level)}</span>
            <span className="rounded-full border border-border-color px-3 py-1">{goal.core ? 'Kernziel' : 'Erweiterung'}</span>
            <span className="rounded-full border border-border-color px-3 py-1">Gewicht {goal.weight}</span>
          </div>

          <div className="mt-3 grid gap-3 text-[11px] sm:grid-cols-2">
            {goal.leitideen.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold mb-1 text-text-primary">Leitideen</h3>
                <div className="flex flex-wrap gap-1">
                  {goal.leitideen.map((idea) => (
                    <span key={idea} className="rounded-full border border-border-color px-2 py-0.5 text-text-secondary">
                      {idea}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {goal.kompetenzen.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold mb-1 text-text-primary">Prozesskompetenzen</h3>
                <div className="flex flex-wrap gap-1">
                  {goal.kompetenzen.map((kompetenz) => (
                    <span
                      key={kompetenz}
                      className="rounded-full border border-border-color px-2 py-0.5 text-text-secondary"
                    >
                      {kompetenz}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {goal.examples.length > 0 && (
            <div className="mt-3 text-[11px] text-text-secondary">
              <h3 className="text-xs font-semibold mb-1 text-text-primary">Beispiele</h3>
              <div className="flex flex-wrap gap-1">
                {goal.examples.map((exampleId) => (
                  <span
                    key={exampleId}
                    className="rounded-full border border-dashed border-border-color px-2 py-0.5 text-[11px] text-text-secondary"
                  >
                    {exampleId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {goal.sourceRef && <div className="mt-2 text-[11px] text-text-secondary">Quelle: {goal.sourceRef}</div>}
        </>
      )}

      {showLearnerTools && (
        <div className="mt-4 space-y-2">
          {!isAtomic && (
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span className="font-medium">Kompetenzstand für dieses Lernziel</span>
              <span className="tabular-nums">{Math.round(masteryValue * 100)}%</span>
            </div>
          )}

          <MasteryBar value={masteryValue} />

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
