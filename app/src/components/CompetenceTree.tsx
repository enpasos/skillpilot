import React, { useState } from 'react'
import type { UiGoal } from '../goalTypes'


interface TreeNodeProps {
  goalId: string
  allGoals: Map<string, UiGoal>
  getMastery: (goalId: string) => number
  plannedGoals: Set<string>
  onTogglePlan: (id: string) => void
  onSelect: (id: string) => void
  selectedId: string
  depth?: number
  activeFilter?: string

  aggregatedPlannedGoals?: Map<string, number>
  totalStudents?: number
  personalConfig?: Record<string, { selected: boolean; filterId?: string }>
}

const TreeNode: React.FC<TreeNodeProps> = ({
  goalId,
  allGoals,
  getMastery,
  plannedGoals,
  onTogglePlan,
  onSelect,
  selectedId,
  depth = 0,
  activeFilter,
  aggregatedPlannedGoals,
  totalStudents,
  personalConfig,
}) => {
  const goal = allGoals.get(goalId)
  const [isExpanded, setIsExpanded] = useState(depth < 1)

  if (!goal) return null

  const children = goal.contains || []

  // Check if this level has any "Positive Selection" (at least one sibling explicitly selected).
  // If so, we treat this as an "Opt-in" level where unconfigured items are hidden.
  // If NOT (i.e. only negative selections or no config), we treat it as "Opt-out" or "Show All" level.
  const hasPositiveSibling = personalConfig && Object.keys(personalConfig).length > 0 && children.some(childId => {
    const c = allGoals.get(childId)
    if (!c) return false
    const config = (c.landscapeId ? personalConfig[c.landscapeId] : undefined) ?? personalConfig[c.id]
    return config?.selected === true
  })

  const visibleChildren = children.filter((childId) => {
    // 1. Filter by active tag filter (e.g. "GK", "LK")
    if (activeFilter && activeFilter !== 'all') {
      const child = allGoals.get(childId)
      if (!child) return false
      // If child has no tags, keep it (might be structural). If it has tags, check inclusion.
      if (child.tags && child.tags.length > 0 && !child.tags.includes(activeFilter)) {
        return false
      }
    }

    // 2. Filter by Personal Curriculum (Level 2)
    // If the child belongs to a specific landscape (subject), check if that landscape is enabled in personalConfig.
    // ALSO check if the child ID itself is enabled (some subjects might be goals within the same landscape)
    const child = allGoals.get(childId)
    if (child && personalConfig && Object.keys(personalConfig).length > 0) {
      // Check config for landscapeId OR goalId
      const config = (child.landscapeId ? personalConfig[child.landscapeId] : undefined) ?? personalConfig[child.id]

      // If we found a config entry (either for landscape or goal), respect it strictly.
      if (config) {
        if (config.selected !== true) return false
      } else {
        // If NO config entry found:
        // If there is a Positive Sibling (someone else explicitly selected), then I am implicitly Unselected (Hide).
        // Otherwise (nobody explicitly selected, or only negatives), I am implicitly Selected (Show).
        if (hasPositiveSibling) return false

        // Otherwise show default
      }
    }

    return true
  })

  const hasChildren = visibleChildren.length > 0
  const mastery = getMastery(goal.id)
  const isPlanned = plannedGoals.has(goal.id)
  const isSelected = selectedId === goal.id

  const plannedCount = aggregatedPlannedGoals?.get(goal.id) ?? 0

  return (
    <div className="">
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors border border-transparent ${isSelected ? 'bg-sky-100 dark:bg-sky-900/40 border-sky-300 dark:border-sky-500/50' : 'hover:bg-slate-200 dark:hover:bg-slate-800/50'
          }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(goal.id)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          className={`p-0.5 rounded hover:bg-slate-700 text-slate-400 w-4 h-4 flex items-center justify-center ${!hasChildren ? 'invisible' : ''
            }`}
        >
          <span className="text-[10px]">{isExpanded ? '▼' : '▶'}</span>
        </button>

        <div
          className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex-shrink-0"
          title={`Fortschritt: ${(mastery * 100).toFixed(0)}%`}
        >
          <div
            className={`h-full ${mastery >= 1 ? 'bg-emerald-500' : 'bg-sky-500'}`}
            style={{ width: `${mastery * 100}%` }}
          />
        </div>

        <span className={`text-sm truncate flex-1 ${mastery >= 1 ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
          {goal.title}
        </span>

        {aggregatedPlannedGoals ? (
          <div className="flex items-center gap-1 text-slate-500">
            {plannedCount > 0 && (
              <>
                <span className="text-amber-400">★</span>
                <span className="text-xs">{plannedCount}</span>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTogglePlan(goal.id)
            }}
            className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${isPlanned ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-400 dark:hover:text-amber-200'
              }`}
            title={isPlanned ? 'Von Lernliste entfernen' : 'Als Lernziel setzen'}
          >
            ★
          </button>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div>
          {visibleChildren.map((childId) => (
            <TreeNode
              key={childId}
              goalId={childId}
              allGoals={allGoals}
              getMastery={getMastery}
              plannedGoals={plannedGoals}
              onTogglePlan={onTogglePlan}
              onSelect={onSelect}
              selectedId={selectedId}
              depth={depth + 1}
              activeFilter={activeFilter}
              aggregatedPlannedGoals={aggregatedPlannedGoals}
              totalStudents={totalStudents}
              personalConfig={personalConfig}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CompetenceTreeProps {
  rootGoals: UiGoal[]
  allGoals: Map<string, UiGoal>
  getMastery: (goalId: string) => number
  plannedGoals: Set<string>
  onTogglePlan: (id: string) => void
  onSelect: (id: string) => void
  selectedId: string
  activeFilter?: string

  aggregatedPlannedGoals?: Map<string, number>
  totalStudents?: number
  personalConfig?: Record<string, { selected: boolean; filterId?: string }>
}

export const CompetenceTree: React.FC<CompetenceTreeProps> = ({ rootGoals, activeFilter, personalConfig, ...props }) => {
  // Check if root level has any config (Strict Opt-in)
  const hasConfiguredRoots = personalConfig && Object.keys(personalConfig).length > 0 && rootGoals.some(g =>
    (g.landscapeId && personalConfig[g.landscapeId] !== undefined) || personalConfig[g.id] !== undefined
  )

  const visibleRoots = rootGoals.filter((g) => {
    // 1. Filter by active tag filter
    if (activeFilter && activeFilter !== 'all') {
      if (g.tags && g.tags.length > 0 && !g.tags.includes(activeFilter)) {
        return false
      }
    }

    // 2. Filter by Personal Curriculum (Level 2) - for root nodes
    if (personalConfig && Object.keys(personalConfig).length > 0) {
      const config = (g.landscapeId ? personalConfig[g.landscapeId] : undefined) ?? personalConfig[g.id]
      if (config) {
        if (config.selected !== true) return false
      } else {
        if (hasConfiguredRoots) return false
      }
    }

    return true
  })

  return (
    <div className="flex flex-col gap-1 overflow-y-auto max-h-full pr-2">
      {visibleRoots.map((g) => (
        <TreeNode
          key={g.id}
          goalId={g.id}
          activeFilter={activeFilter}
          personalConfig={personalConfig}
          {...props}
        />
      ))}
    </div>
  )
}
