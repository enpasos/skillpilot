import React from 'react'
import type { UiGoal as Goal, ExternalRequirement } from '../goalTypes'
import { Breadcrumb } from '../components/Breadcrumb'
import { NeighborSection } from '../components/NeighborSection'
import { GoalCard } from '../components/GoalCard'
import { ThemeToggle } from '../components/ThemeToggle'
import { LogoutButton } from '../components/LogoutButton'

import type { NeighborSets } from '../hooks/useCompetenceGraph'
import { useLanguage } from '../contexts/LanguageContext'
import { en } from '../locales/en'
import { de } from '../locales/de'

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
  onFilterChange: (value: string) => void
  onLogout?: () => void
  children?: React.ReactNode
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
}) => {
  console.log('[ExplorerView] Render. currentGoal:', currentGoal?.id)
  const hasFilters = availableFilters.length > 0
  const { language } = useLanguage()
  const t = language === 'en' ? en.explorer : de.explorer



  return (
    <div className="min-h-screen flex flex-col bg-chat-bg text-text-primary transition-colors">
      <header className="flex flex-col border-b border-border-color bg-sidebar-bg/90 backdrop-blur transition-colors">
        <div className="flex items-center justify-between px-6 py-2 border-b border-border-color">
          <div className="flex items-center gap-2">
            {hasFilters && (
              <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                <span>Filter</span>
                <div className="flex rounded-full border border-border-color bg-input-bg p-0.5">
                  <button
                    type="button"
                    aria-pressed={activeFilter === 'all'}
                    onClick={() => onFilterChange('all')}
                    className={`px-2 py-1 rounded-full text-[11px] transition-colors ${activeFilter === 'all'
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-text-secondary hover:text-text-primary'
                      }`}
                  >
                    Alle
                  </button>
                  {availableFilters.map((option) => {
                    const isActive = activeFilter === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => onFilterChange(option.id)}
                        className={`px-2 py-1 rounded-full text-[11px] transition-colors ${isActive
                          ? 'bg-sky-600 text-white shadow'
                          : 'text-text-secondary hover:text-text-primary'
                          }`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {onLogout && (
              <LogoutButton onLogout={onLogout} />
            )}

          </div>
        </div>

        <div className="px-6 py-2">
          <Breadcrumb crumbs={breadcrumbCrumbs} />
        </div>
      </header>

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
          />
          {children}
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
            title={t.nextSteps}
            emptyLabel={t.emptyNextSteps}
            goals={neighbors.forward}
            getMastery={getMastery}
            onClick={onNavigate}
            highlightForward
            showMastery={showLearnerTools}
          />
        </aside>
      </main>
    </div>
  )
}
