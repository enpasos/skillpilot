import React, { Suspense, lazy, useState } from 'react'
import type { UiGoal as Goal, ExternalRequirement } from '../goalTypes'
import { Breadcrumb } from '../components/Breadcrumb'
import { NeighborSection } from '../components/NeighborSection'
import { GoalCard } from '../components/GoalCard'
import { ThemeToggle } from '../components/ThemeToggle'
import { LogoutButton } from '../components/LogoutButton'

import type { NeighborSets } from '../hooks/useCompetenceGraph'
import { useLanguage } from '../contexts/LanguageContext'
import { splitFilterIds } from '../utils/goalFilters'
import { normalizeJurisdictionCode } from '../utils/jurisdictionMetadata'
import { en } from '../locales/en'
import { de } from '../locales/de'

const RequiresFlowMap = lazy(() =>
  import('../components/RequiresFlowMap').then((module) => ({ default: module.RequiresFlowMap })),
)

type ExplorerFilterOption = { id: string; label: string }
type ExplorerFilterDimension = 'jurisdiction' | 'courseProfile' | 'durationModel' | 'generic'

interface ExplorerViewProps {
  breadcrumbCrumbs: {
    id: string
    label: string
    options: { id: string; label: string }[]
    onSelect: (id: string) => void
    onNavigate: () => void
  }[]
  neighbors: NeighborSets
  externalRequires: ExternalRequirement[]
  currentGoal: Goal
  getMastery: (goalId: string) => number
  onNavigate: (id: string) => void
  onNavigateExternal: (landscapeId: string, goalId: string) => void
  onMasteryChange?: (id: string, value: number) => void
  showLearnerTools: boolean
  activeFilter: string
  availableFilters?: { id: string; label: string }[]
  onFilterChange: (value: string, dimension?: ExplorerFilterDimension) => void
  onLogout?: () => void
  children?: React.ReactNode
  goalIndexAll: Map<string, Goal>
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  breadcrumbCrumbs,
  neighbors,
  externalRequires,
  currentGoal,
  getMastery,
  onNavigate,
  onNavigateExternal,
  onMasteryChange,
  showLearnerTools,
  activeFilter,
  availableFilters = [],
  onFilterChange,
  onLogout,
  children,
  goalIndexAll,
}) => {
  const hasFilters = availableFilters.length > 0
  const isWildcardFilter = (value?: string) => {
    if (!value) return false
    return value.toLowerCase() === 'all'
  }
  const isCourseProfileFilter = (value?: string) => {
    const normalized = (value ?? '').trim().toUpperCase()
    return normalized === 'GK' || normalized === 'LK' || normalized === 'GK+LK'
  }
  const { language } = useLanguage()
  const wildcardFilterOption = availableFilters.find((option) => isWildcardFilter(option.id))
  const selectableFilters = availableFilters.filter((option) => !isWildcardFilter(option.id))
  const jurisdictionFilters = selectableFilters.filter((option) => normalizeJurisdictionCode(option.id))
  const courseProfileFilters = selectableFilters.filter((option) => isCourseProfileFilter(option.id))
  const otherFilters = selectableFilters.filter(
    (option) => !normalizeJurisdictionCode(option.id) && !isCourseProfileFilter(option.id),
  )
  const activeFilterIds = splitFilterIds(activeFilter).filter((filterId) => !isWildcardFilter(filterId))
  const activeJurisdiction = activeFilterIds
    .map((filterId) => normalizeJurisdictionCode(filterId))
    .find((jurisdiction) => !!jurisdiction)
  const activeCourseProfile = activeFilterIds
    .map((filterId) => filterId.trim().toUpperCase())
    .find((filterId) => isCourseProfileFilter(filterId))
  const t = language === 'en' ? en.explorer : de.explorer
  const [showRequiresFlow, setShowRequiresFlow] = useState(false)
  const containsOptions = [...neighbors.children].sort((a, b) => a.title.localeCompare(b.title))
  const requiresFlowLoader = (
    <main className="flex-1 p-4">
      <div className="glass-panel border-border-color bg-sidebar-bg/70 p-4 text-sm text-text-secondary">
        Requires-Flow laden ...
      </div>
    </main>
  )
  const filterOptionIsActive = (
    option: ExplorerFilterOption,
    dimension?: ExplorerFilterDimension,
  ) => {
    if (dimension === 'jurisdiction' && isWildcardFilter(option.id)) {
      return !activeJurisdiction
    }
    if (dimension === 'courseProfile' && isWildcardFilter(option.id)) {
      return !activeCourseProfile
    }

    const jurisdiction = normalizeJurisdictionCode(option.id)
    if (jurisdiction) {
      return activeJurisdiction === jurisdiction
    }

    const normalizedOptionId = option.id.trim().toUpperCase()
    return activeFilterIds.some((filterId) => filterId.trim().toUpperCase() === normalizedOptionId)
  }
  const renderFilterButton = (option: ExplorerFilterOption, dimension?: ExplorerFilterDimension) => {
    const isActive = filterOptionIsActive(option, dimension)
    return (
      <button
        key={option.id}
        type="button"
        aria-pressed={isActive}
        onClick={() => onFilterChange(option.id, dimension)}
        className={`whitespace-nowrap rounded-full px-2 py-1 text-[11px] transition-colors ${isActive
          ? 'bg-sky-600 text-white shadow'
          : 'text-text-secondary hover:text-text-primary'
          }`}
      >
        {option.label}
      </button>
    )
  }
  const renderFilterGroup = (
    label: string,
    options: ExplorerFilterOption[],
    dimension?: ExplorerFilterDimension,
  ) => {
    if (options.length === 0) return null
    return (
      <div className="flex min-w-0 items-center gap-2 text-[11px] text-text-secondary">
        <span className="shrink-0">{label}</span>
        <div className="flex min-w-0 flex-wrap items-center gap-1 rounded-2xl border border-border-color bg-input-bg p-0.5">
          {options.map((option) => renderFilterButton(option, dimension))}
        </div>
      </div>
    )
  }
  const jurisdictionFilterOptions = [
    {
      id: wildcardFilterOption?.id ?? 'all',
      label: wildcardFilterOption?.label ?? (language === 'en' ? 'Canonical DE View' : 'Kanonische DE-Sicht'),
    },
    ...jurisdictionFilters,
  ]
  const courseProfileFilterOptions = courseProfileFilters.length > 0
    ? [
      {
        id: 'all',
        label: language === 'en' ? 'All courses' : 'Alle Kurse',
      },
      ...courseProfileFilters,
    ]
    : []

  return (
    <div className="min-h-screen flex flex-col bg-chat-bg text-text-primary transition-colors">
      <header className="flex flex-col border-b border-border-color bg-sidebar-bg/90 backdrop-blur transition-colors">
        <div className="flex items-center justify-end gap-4 px-6 py-2">
          <ThemeToggle />
          {onLogout && (
            <LogoutButton onLogout={onLogout} />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2 border-t border-border-color">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            {hasFilters && (
              <>
                {renderFilterGroup(language === 'en' ? 'Jurisdiction' : 'Bundesland', jurisdictionFilterOptions, 'jurisdiction')}
                {renderFilterGroup(language === 'en' ? 'Course' : 'Kurs', courseProfileFilterOptions, 'courseProfile')}
                {renderFilterGroup(language === 'en' ? 'Other filters' : 'Weitere Filter', otherFilters, 'generic')}
              </>
            )}
            <div className="flex items-center gap-2 text-[11px] text-text-secondary">
              <span>{t.requiresFlowToggleLabel}</span>
              <button
                type="button"
                role="switch"
                aria-checked={showRequiresFlow}
                aria-label={t.requiresFlowToggleLabel}
                onClick={() => setShowRequiresFlow((value) => !value)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full border transition-colors ${showRequiresFlow
                    ? 'border-sky-500 bg-sky-500/80'
                    : 'border-border-color bg-input-bg'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showRequiresFlow ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                />
              </button>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                {showRequiresFlow ? t.requiresFlowStateOn : t.requiresFlowStateOff}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-2 flex flex-wrap items-center gap-2">
          <Breadcrumb crumbs={breadcrumbCrumbs} />
          {showRequiresFlow && containsOptions.length > 0 && (
            <>
              <span className="text-text-secondary">/</span>
              <div className="flex items-center rounded-full border border-border-color bg-input-bg transition-colors focus-within:border-sky-400 hover:border-text-secondary pr-0">
                <span
                  className="px-3 py-1.5 truncate max-w-[260px] text-left text-text-primary text-[12px]"
                  title={t.containsChildPickerLabel}
                >
                  {t.containsChildPickerLabel}
                </span>
                <div className="relative h-full border-l border-border-color rounded-r-full">
                  <select
                    key={`contains-picker-${currentGoal.id}`}
                    defaultValue=""
                    onChange={(event) => {
                      const nextId = event.target.value
                      if (!nextId) return
                      onNavigate(nextId)
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title={t.containsChildPickerTitle}
                  >
                    <option value="" disabled>
                      {t.containsChildPickerPlaceholder}
                    </option>
                    {containsOptions.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.title}
                      </option>
                    ))}
                  </select>
                  <div className="px-2 py-1 flex items-center justify-center h-full text-text-secondary pointer-events-none">
                    <span className="text-[10px] leading-none">▼</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {showRequiresFlow ? (
        <Suspense fallback={requiresFlowLoader}>
          <main className="flex-1 p-4">
            <RequiresFlowMap
              language={language === 'en' ? 'en' : 'de'}
              currentGoal={currentGoal}
              requires={neighbors.requires}
              inheritedRequires={neighbors.inheritedRequires}
              forwardDirect={neighbors.directForward}
              forwardInherited={neighbors.inheritedForward}
              getMastery={getMastery}
              onNavigate={onNavigate}
              goalIndexAll={goalIndexAll}
              showMastery={showLearnerTools}
            />
          </main>
        </Suspense>
      ) : (
        <main className="flex-1 grid grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(220px,280px)_minmax(0,1.8fr)_minmax(260px,320px)]">
          <aside className="space-y-3 lg:max-h-[calc(100vh-96px)] overflow-y-auto">
            <NeighborSection
              title={t.requires}
              emptyLabel={t.emptyRequires}
              goals={neighbors.requires}
              getMastery={getMastery}
              onClick={onNavigate}
              showMastery={showLearnerTools}
            />
            <NeighborSection
              title={t.inheritedRequires}
              emptyLabel={t.emptyInherited}
              goals={neighbors.inheritedRequires}
              getMastery={getMastery}
              onClick={onNavigate}
              showMastery={showLearnerTools}
            />
            {externalRequires.length > 0 && (
              <section className="glass-panel border-sky-500/80 bg-sidebar-bg/80 p-3">
                <h3 className="text-xs font-semibold mb-1 text-sky-600 dark:text-sky-200">{t.externalRequires}</h3>
                <div className="space-y-2 text-[11px] text-text-secondary">
                  {externalRequires.map((ref) => (
                    <button
                      key={`${ref.landscapeId}:${ref.goalId}`}
                      onClick={() => onNavigateExternal(ref.landscapeId, ref.goalId)}
                      className="flex w-full flex-col rounded-xl border border-border-color bg-input-bg px-2.5 py-2 text-left hover:border-sky-400/80"
                    >
                      <span className="font-semibold text-text-primary">
                        {ref.landscapeTitle} · {ref.goalTitle}
                      </span>

                    </button>
                  ))}
                </div>
              </section>
            )}
          </aside>

          <section className="space-y-3 lg:max-h-[calc(100vh-96px)] overflow-y-auto">
            <GoalCard
              goal={currentGoal}
              masteryValue={getMastery(currentGoal.id)}
              onMasteryChange={currentGoal.contains?.length > 0 ? undefined : onMasteryChange}
              showLearnerTools={showLearnerTools}
              showDetails={true}
              activeFilter={activeFilter}
            />
            {children}
            <div className="text-[11px] text-text-secondary">
              {t.navigationHelp}
            </div>
          </section>

          <aside className="space-y-3 lg:max-h-[calc(100vh-96px)] overflow-y-auto">
            <NeighborSection
              title={t.contains}
              emptyLabel={t.emptyContains}
              goals={neighbors.children}
              getMastery={getMastery}
              onClick={onNavigate}
              showMastery={showLearnerTools}
            />
            <NeighborSection
              title={t.nextStepsDirect ?? t.nextSteps}
              emptyLabel={t.emptyNextSteps}
              goals={neighbors.directForward}
              getMastery={getMastery}
              onClick={onNavigate}
              highlightForward
              showMastery={showLearnerTools}
            />
            <NeighborSection
              title={t.nextStepsInherited ?? t.nextSteps}
              emptyLabel={t.emptyNextStepsInherited ?? t.emptyNextSteps}
              goals={neighbors.inheritedForward}
              getMastery={getMastery}
              onClick={onNavigate}
              highlightForward
              showMastery={showLearnerTools}
            />
          </aside>
        </main>
      )}
    </div>
  )
}
