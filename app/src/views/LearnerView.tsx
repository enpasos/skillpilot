import React, { useState, useMemo, useCallback, useRef } from 'react'
import { CompetenceTree } from '../components/CompetenceTree'
import { GoalCard } from '../components/GoalCard'
import { PersonalCurriculumSetup } from '../components/PersonalCurriculumSetup'
import { Settings, Upload, Download } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { InfoModal } from '../components/InfoModal'
import { LogoutButton } from '../components/LogoutButton'

import type { UiGoal } from '../goalTypes'

interface LearnerViewProps {
  rootGoals: UiGoal[]
  goalIndexAll: Map<string, UiGoal>
  getMastery: (goalId: string) => number
  currentGoal: UiGoal | null
  onSelectGoal: (id: string) => void
  skillpilotId: string
  landscapeId: string
  activeFilter?: string
  onLogout?: () => void
  availableLandscapes?: { landscapeId: string; title: string; filters?: { id: string; label: string }[] }[]
  rootLandscapeId?: string
}

export const LearnerView: React.FC<LearnerViewProps> = ({
  rootGoals,
  goalIndexAll,
  getMastery,
  currentGoal,
  onSelectGoal,
  skillpilotId,
  landscapeId,
  activeFilter = 'all',
  onLogout,
  availableLandscapes = [],
  rootLandscapeId,
}) => {
  const [plannedGoals, setPlannedGoals] = useState<Set<string>>(new Set())
  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [personalConfig, setPersonalConfig] = useState<Record<string, { selected: boolean; filterId?: string }>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedId = currentGoal?.id ?? rootGoals[0]?.id ?? ''

  const plannedCount = plannedGoals.size
  const masteredCount = useMemo(() => {
    let count = 0
    goalIndexAll.forEach((g) => {
      if (getMastery(g.id) >= 1) count += 1
    })
    return count
  }, [goalIndexAll, getMastery])

  // Load planned goals from backend
  React.useEffect(() => {
    if (!skillpilotId) return
    const fetchPlanned = async () => {
      try {
        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/planned` : `/api/ui/learners/${skillpilotId}/planned`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (data.goals && Array.isArray(data.goals)) {
            setPlannedGoals(new Set(data.goals))
          }
        }
      } catch (e) {
        console.warn('Failed to load planned goals', e)
      }
    }
    fetchPlanned()
  }, [skillpilotId])

  const togglePlan = useCallback(async (id: string) => {
    const next = new Set(plannedGoals)
    if (next.has(id)) next.delete(id)
    else next.add(id)

    setPlannedGoals(next)

    if (!skillpilotId) return
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/planned` : `/api/ui/learners/${skillpilotId}/planned`
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals: Array.from(next) })
      })
    } catch (e) {
      console.warn('Failed to save planned goals', e)
      // Revert on error? For now, just warn.
    }
  }, [plannedGoals, skillpilotId])

  // Load personal config from backend
  React.useEffect(() => {
    if (!skillpilotId) return
    const fetchConfig = async () => {
      try {
        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}` : `/api/ui/learners/${skillpilotId}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (data.personalCurriculum) {
            const parsed = JSON.parse(data.personalCurriculum)
            setPersonalConfig(parsed || {})
          }
        }
      } catch (e) {
        console.warn('Failed to load personal curriculum', e)
      }
    }
    fetchConfig()
  }, [skillpilotId])

  // Save personal config to backend
  const handleConfigChange = useCallback(async (newConfig: Record<string, { selected: boolean; filterId?: string }>) => {
    setPersonalConfig(newConfig)
    if (!skillpilotId) return
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/personal-curriculum` : `/api/ui/learners/${skillpilotId}/personal-curriculum`
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      })
    } catch (e) {
      console.warn('Failed to save personal curriculum', e)
    }
  }, [skillpilotId])

  // Filter root goals based on Personal Curriculum (Level 2)
  const visibleRootGoals = useMemo(() => {
    // If no config exists yet, show all by default
    if (Object.keys(personalConfig).length === 0) return rootGoals

    return rootGoals.filter((goal) => {
      const config = personalConfig[goal.id]
      // Always show root goals
      if (rootGoals.some(r => r.id === goal.id)) return true

      // Show only if explicitly selected (strict opt-in when config exists)
      return config?.selected === true
    })
  }, [rootGoals, personalConfig])

  // Determine effective active filter based on personal config for current landscape
  const effectiveActiveFilter = useMemo(() => {
    const config = personalConfig[landscapeId]
    if (config?.filterId) return config.filterId
    return activeFilter
  }, [landscapeId, personalConfig, activeFilter])

  const handleExport = useCallback(async () => {
    if (!skillpilotId) return
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/export` : `/api/ui/learners/${skillpilotId}/export`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `learner_data_${skillpilotId}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Export failed", res.status, res.statusText)
      }
    } catch (e) {
      console.error("Export error", e)
    }
  }, [skillpilotId])

  const handleImportClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !skillpilotId) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/import` : `/api/ui/learners/${skillpilotId}/import`

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json)
        });

        if (res.ok) {
          // Reload page to reflect imported state (simplest way to ensure consistency)
          window.location.reload();
        } else {
          console.error("Import failed", res.status);
          let msg = "Import failed.";
          try {
            const errData = await res.json();
            if (errData && errData.message) msg = errData.message;
          } catch (e) { /* ignore json parse error */ }
          alert(msg);
        }
      } catch (err) {
        console.error("Import error", err);
        alert("An error occurred during import.");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [skillpilotId]);

  return (
    <div className="flex h-screen bg-chat-bg text-text-primary overflow-hidden transition-colors">
      <aside className="w-1/3 min-w-[300px] border-r border-border-color flex flex-col bg-sidebar-bg">
        <div className="p-4 border-b border-border-color flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sky-600 dark:text-sky-400">Meine Lernziele</h2>
            <div className="text-xs text-text-secondary mt-1">
              {plannedCount} markiert • {masteredCount} abgeschlossen
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="text-text-secondary hover:text-sky-400 transition-colors"
              title="Daten exportieren"
            >
              <Download size={18} />
            </button>
            <button
              onClick={handleImportClick}
              className="text-text-secondary hover:text-sky-400 transition-colors"
              title="Daten importieren"
            >
              <Upload size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".json"
            />
            <button
              onClick={() => setIsSetupOpen(true)}
              className="text-text-secondary hover:text-sky-400 transition-colors"
              title="Lehrplan anpassen"
            >
              <Settings size={18} />
            </button>
            <ThemeToggle />
            {onLogout && (
              <LogoutButton onLogout={onLogout} />
            )}

          </div>
        </div>

        <div className="flex-1 p-2 overflow-y-auto">
          <CompetenceTree
            rootGoals={visibleRootGoals}
            allGoals={goalIndexAll}
            getMastery={getMastery}
            plannedGoals={plannedGoals}
            onTogglePlan={togglePlan}
            onSelect={onSelectGoal}
            selectedId={selectedId}
            activeFilter={effectiveActiveFilter}
            personalConfig={personalConfig}
          />
        </div>
      </aside>

      <main className="flex-1 p-6 bg-chat-bg overflow-y-auto transition-colors">
        {currentGoal ? (
          <div className="max-w-3xl mx-auto space-y-4">
            <GoalCard
              goal={currentGoal}
              masteryValue={getMastery(currentGoal.id)}
              onMasteryChange={() => { }}
              showLearnerTools={false}
            />
            <div className="bg-input-bg border border-border-color rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-text-primary">Auf Lernliste setzen</div>
                <div className="text-[11px] text-text-secondary">Merke dir dieses Ziel für deinen Fokus.</div>
              </div>
              <button
                type="button"
                onClick={() => togglePlan(currentGoal.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${plannedGoals.has(currentGoal.id)
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-400/60'
                  : 'bg-sidebar-bg text-text-primary border-border-color hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
              >
                {plannedGoals.has(currentGoal.id) ? 'Gemerkte Ziele' : 'Ziel merken'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-text-secondary mt-20">Wähle ein Lernziel aus.</div>
        )}
      </main>

      <PersonalCurriculumSetup
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        availableLandscapes={availableLandscapes}
        onConfigChange={handleConfigChange}
        initialConfig={personalConfig}
        rootLandscapeId={rootLandscapeId}
      />

      <InfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        type={modalType}
      >
        {modalMessage}
      </InfoModal>
    </div>
  )
}
