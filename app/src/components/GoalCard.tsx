import React from 'react'
import type { UiGoal as Goal } from '../goalTypes'
import { levelLabel } from '../goalUiUtils'
import { MasteryBar } from './MasteryBar'

interface GoalCardProps {
  goal: Goal
  masteryValue: number
  onMasteryChange?: (id: string, value: number) => void
  showLearnerTools: boolean
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, masteryValue, onMasteryChange, showLearnerTools }) => {
  const handleChange = onMasteryChange ?? (() => { })
  return (
    <div className="bg-sidebar-bg border border-border-color rounded-3xl p-5 shadow-none dark:shadow-card-2xl transition-colors">
      <div className="flex flex-col gap-1 mb-2">

        <h2 className="text-2xl font-semibold text-text-primary leading-tight">{goal.title}</h2>
      </div>

      <p className="mt-2 text-sm text-text-primary leading-relaxed">{goal.description}</p>

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

      {showLearnerTools && onMasteryChange && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span className="font-medium">Kompetenzstand für dieses Lernziel</span>
            <span className="tabular-nums">{Math.round(masteryValue * 100)}%</span>
          </div>
          <MasteryBar value={masteryValue} />
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
        </div>
      )}
    </div>
  )
}
