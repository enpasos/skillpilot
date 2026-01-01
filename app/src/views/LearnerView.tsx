import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { CompetenceTree } from '../components/CompetenceTree'
import { PersonalCurriculumSetup } from '../components/PersonalCurriculumSetup'
import { Settings, Upload, Download, RefreshCw, Menu, X, Target, Send, Check } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { InfoModal } from '../components/InfoModal'
import { LogoutButton } from '../components/LogoutButton'
import { GoalCard } from '../components/GoalCard'
import { FlashcardDrill } from '../components/srs/FlashcardDrill'
import { useLanguage } from '../contexts/LanguageContext'

import type { UiGoal } from '../goalTypes'
import type { Learner } from '../learnerTypes'

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
  onRefresh?: () => void
  parentMap?: Map<string, string[]>
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
  onRefresh,
  parentMap,
}) => {
  const [plannedGoals, setPlannedGoals] = useState<Set<string>>(new Set())
  const [forcedExpandedIds, setForcedExpandedIds] = useState<Set<string>>(new Set())
  const [learnerData, setLearnerData] = useState<Learner | null>(null)
  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [personalConfig, setPersonalConfig] = useState<Record<string, { selected: boolean; filterId?: string }>>({})

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState<'info' | 'error' | 'success'>('info');

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedId = currentGoal?.id ?? rootGoals[0]?.id ?? ''

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

  const visibleGoals = useMemo(() => {
    const visible = new Set<string>()
    const stack = [...visibleRootGoals]
    const hasConfig = Object.keys(personalConfig).length > 0

    while (stack.length > 0) {
      const g = stack.pop()
      if (!g) continue

      // If config exists, respect visibility settings for children
      if (hasConfig) {
        const cfg = personalConfig[g.id]
        // If explicitly unselected, skip branch
        if (cfg && cfg.selected === false) continue
      }

      if (visible.has(g.id)) continue
      visible.add(g.id)
      if (g.contains && g.contains.length > 0) {
        g.contains.forEach((childId) => {
          const child = goalIndexAll.get(childId)
          if (child) stack.push(child)
        })
      }
    }
    return visible
  }, [visibleRootGoals, goalIndexAll, personalConfig])

  // Calculate statistics: Total Atomic and Mastered Atomic
  // Relative to Focus (Planned Subtree) if active, otherwise Global Visible.
  const stats = useMemo(() => {
    let totalAtomic = 0
    let masteredAtomic = 0
    const visited = new Set<string>()

    const countRecursive = (id: string) => {
      if (visited.has(id)) return
      visited.add(id)

      if (!visibleGoals.has(id)) return

      const g = goalIndexAll.get(id)
      if (!g) return

      // Atomic Goal
      if (!g.contains || g.contains.length === 0) {
        totalAtomic++
        if (getMastery(id) >= 1) {
          masteredAtomic++
        }
      } else {
        g.contains.forEach(childId => countRecursive(childId))
      }
    }

    if (plannedGoals.size > 0) {
      // Focus Mode: Count only within planned subtrees
      plannedGoals.forEach(id => countRecursive(id))
    } else {
      // Global Mode: Count all visible root goals and their descendants
      visibleGoals.forEach(id => {
        // We iterate visibleGoals set which contains flattened IDs. 
        // We just need to check if it is atomic.
        // BUT visibleGoals contains EVERYTHING visible.
        // So we can just iterate visibleGoals directly.

        // Wait, visibleGoals is a Set of ALL visible IDs (flattened). 
        // So we don't need recursion if we just iterate the Set.

        // Let's stick to recursion from Roots to be safe? 
        // Actually, visibleGoals set is computed recursively in previous hook.
        // So iterating visibleGoals and checking if atomic is O(N) and correct.

        // HOWEVER, for consistency with the "Planned Subtree" logic (which needs recursion 
        // because plannedGoals only contains the top node, not the whole subtree in a flat set 
        // unless we built it), we should use the same approach or rely on the previous hook.

        // Simplest: 
        // If plannedGoals > 0: Recursion on planned IDs.
        // Else: Iteration on visibleGoals Set (check if atomic).

        const g = goalIndexAll.get(id)
        if (g && (!g.contains || g.contains.length === 0)) {
          totalAtomic++
          if (getMastery(id) >= 1) {
            masteredAtomic++
          }
        }
      })
    }

    return { totalAtomic, masteredAtomic }
  }, [plannedGoals, goalIndexAll, visibleGoals, getMastery])


  // Reveal Active Goal Logic
  const revealActiveGoal = useCallback(() => {
    if (!learnerData?.activeGoalId || !parentMap) return
    const targetId = learnerData.activeGoalId
    const ancestors = new Set<string>()

    // Recursive / Iterative lookup
    const queue = [targetId]
    while (queue.length > 0) {
      const current = queue.pop()!
      const parents = parentMap.get(current)
      if (parents) {
        parents.forEach(p => {
          if (!ancestors.has(p)) {
            ancestors.add(p)
            queue.push(p)
          }
        })
      }
    }
    setForcedExpandedIds(ancestors)
    if (targetId !== selectedId) {
      onSelectGoal(targetId)
    }
  }, [learnerData?.activeGoalId, parentMap, onSelectGoal, selectedId])

  // Auto-reveal on initial load if active goal exists
  const initialRevealRef = useRef(false)
  useEffect(() => {
    if (learnerData?.activeGoalId && !initialRevealRef.current) {
      revealActiveGoal()
      initialRevealRef.current = true
    }
  }, [learnerData?.activeGoalId, revealActiveGoal])


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
    const fetchLearnerData = async () => {
      try {
        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}` : `/api/ui/learners/${skillpilotId}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setLearnerData(data)
        }
      } catch (e) {
        console.warn('Failed to load learner data', e)
      }
    }
    fetchPlanned()
    fetchLearnerData()
  }, [skillpilotId])

  const togglePlan = useCallback(async (id: string) => {
    // Single Goal Mode:
    // If clicking the ALREADY selected goal -> Deselect it (Set empty)
    // If clicking a NEW goal -> Select only that one (Set with 1 item)
    let next: Set<string>;

    if (plannedGoals.has(id)) {
      next = new Set();
    } else {
      next = new Set([id]);
    }

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

  // Check mobile state
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isResizing = useRef(false)

  const startResizing = useCallback(() => {
    isResizing.current = true
    document.addEventListener('mousemove', resize)
    document.addEventListener('mouseup', stopResizing)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const stopResizing = useCallback(() => {
    isResizing.current = false
    document.removeEventListener('mousemove', resize)
    document.removeEventListener('mouseup', stopResizing)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing.current) {
      setSidebarWidth(Math.max(240, Math.min(800, e.clientX)))
    }
  }, [])

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
        const serverData = await res.json()

        // V2 Export: Collect Local SRS State
        const clientData: Record<string, any> = { srsState: {} }
        const prefix = `srs_state_${skillpilotId}_`

        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith(prefix)) {
              // Save full key-value pair. We will parse the key on import to handle ID changes.
              const val = localStorage.getItem(key)
              if (val) clientData.srsState[key] = JSON.parse(val)
            }
          }
        } catch (e) {
          console.warn("Error collecting local stats for export", e)
        }

        const exportPayload = {
          version: "2.0",
          exportedAt: new Date().toISOString(),
          serverExport: serverData,
          clientData: clientData
        }

        const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
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

  const { language } = useLanguage();
  const t = useTranslation();

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

        // V2 Import: Unwrap if Wrapper exists
        let payloadToSend = json;
        let clientDataToRestore: any = null;

        if (json.serverExport && json.clientData) {
          console.log("Detected V2 Export Wrapper")
          payloadToSend = json.serverExport;
          clientDataToRestore = json.clientData;
        }

        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/import` : `/api/ui/learners/${skillpilotId}/import`

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadToSend)
        });

        if (res.ok) {
          // Restore Local Data (SRS State) if present
          if (clientDataToRestore && clientDataToRestore.srsState) {
            try {
              console.log("Restoring SRS State...")
              const srsState = clientDataToRestore.srsState as Record<string, any>
              let restoreCount = 0;

              // Regex to parse old keys: srs_state_{OLD_ID}_{GOAL_ID}
              // We assume ID does not contain underscores (UUIDs are hyphens).
              // But just in case, we split by first 3 parts: srs, state, id.
              // safer: match /^srs_state_([^_]+)_(.+)$/
              const keyPattern = /^srs_state_([^_]+)_(.+)$/

              Object.entries(srsState).forEach(([oldKey, value]) => {
                const match = oldKey.match(keyPattern)
                if (match) {
                  // match[1] is old ID (ignored, we use current `skillpilotId`)
                  const goalId = match[2]

                  // Construct new key for CURRENT user
                  const newKey = `srs_state_${skillpilotId}_${goalId}`

                  localStorage.setItem(newKey, JSON.stringify(value))
                  restoreCount++;
                }
              })
              console.log(`Restored ${restoreCount} SRS state entries.`)
            } catch (err) {
              console.error("Error restoring local state", err)
            }
          }

          // Reload page to reflect imported state (simplest way to ensure consistency)
          window.location.reload();
        } else {
          console.error("Import failed", res.status);

          let serverMsg = "";
          try {
            const errData = await res.json();
            if (errData && errData.message) serverMsg = errData.message;
          } catch (e) { /* ignore */ }

          // Use helpful message if signature error suspected (400 Bad Request) or generic otherwise
          if (res.status === 400) {
            if (language === 'de') {
              setModalMessage("Diese Datei kann nicht importiert werden. Die digitale Signatur konnte nicht verifiziert werden. Dies bedeutet in der Regel, dass der Dateiinhalt manuell verändert wurde. Bitte stellen Sie sicher, dass Sie eine originale, unveränderte Exportdatei importieren.");
              setModalTitle("Import-Validierung fehlgeschlagen");
            } else {
              setModalMessage("Cannot import this file. The digital signature could not be verified. This usually means the file content has been modified manually. Please ensure you are importing an original, unmodified export file.");
              setModalTitle("Import Validation Failed");
            }
            setModalType('error');
          } else {
            if (language === 'de') {
              setModalMessage(serverMsg || "Ein unbekannter Fehler ist aufgetreten.");
              setModalTitle("Import fehlgeschlagen");
            } else {
              setModalMessage(serverMsg || "An unknown error occurred.");
              setModalTitle("Import Failed");
            }
            setModalType('error');
          }
          setIsModalOpen(true);
        }
      } catch (err) {
        console.error("Import error", err);
        if (language === 'de') {
          setModalMessage("Ein Netzwerk- oder Systemfehler ist während des Imports aufgetreten.");
          setModalTitle("Import-Fehler");
        } else {
          setModalMessage("A network or system error occurred during import.");
          setModalTitle("Import Error");
        }
        setModalType('error');
        setIsModalOpen(true);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [skillpilotId, language]);

  return (
    <div className="flex h-screen bg-chat-bg text-text-primary overflow-hidden transition-colors">

      {/* Mobile Backdrop */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`flex flex-col bg-sidebar-bg border-r border-border-color shrink-0
          fixed inset-y-0 left-0 z-50 shadow-2xl transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:shadow-none md:transition-none md:flex
        `}
        style={{
          width: isMobile ? '85%' : sidebarWidth,
          maxWidth: isMobile ? '320px' : 'none'
        }}
      >
        <div className="p-4 border-b border-border-color flex items-center justify-between shrink-0">
          <div className="flex-1 min-w-0 mr-2">
            <h2 className="font-bold text-sky-600 dark:text-sky-400 truncate">{t.learner.myGoals}</h2>
            <div className="text-xs flex items-center gap-2 mt-1 truncate">
              <button
                className="flex items-center gap-1 font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                title={t.learner.completed}
              >
                {stats.masteredAtomic} <Check size={16} strokeWidth={3} />
              </button>
              <button
                className="text-slate-400 dark:text-slate-500 flex items-center gap-1 text-[10px] hover:text-sky-500 transition-colors"
                onClick={revealActiveGoal}
                title="Gehe zum aktiven Ziel / Go to active goal"
              >
                ... <Send size={16} className="text-amber-500" /> ...
              </button>
              <span className="flex items-center gap-1 font-bold text-red-500" title="Total">
                {stats.totalAtomic} <Target size={16} />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">

            <button onClick={async () => {
              if (isRefreshing) return;
              setIsRefreshing(true);
              try {
                // Parallelize all refreshes
                const promises = [];
                if (onRefresh) promises.push(onRefresh());

                // Re-fetch local learner data
                const fetchLearnerData = async () => {
                  try {
                    const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
                    const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}?_t=${Date.now()}` : `/api/ui/learners/${skillpilotId}?_t=${Date.now()}`
                    const res = await fetch(url)
                    if (res.ok) {
                      const data = await res.json()
                      setLearnerData(data)
                    }
                  } catch (e) {
                    console.warn('Failed to reload learner data', e)
                  }
                };
                promises.push(fetchLearnerData());

                const fetchPlanned = async () => {
                  try {
                    const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
                    const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/planned?_t=${Date.now()}` : `/api/ui/learners/${skillpilotId}/planned?_t=${Date.now()}`
                    const res = await fetch(url)
                    if (res.ok) {
                      const data = await res.json()
                      if (data.goals && Array.isArray(data.goals)) {
                        setPlannedGoals(new Set(data.goals))
                      }
                    }
                  } catch (e) {
                    console.warn('Failed to reload planned goals', e)
                  }
                }
                promises.push(fetchPlanned());

                await Promise.all(promises);
              } finally {
                setIsRefreshing(false);
              }
            }} className="p-1 text-text-secondary hover:text-sky-400">
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setIsSetupOpen(true)} className="p-1 text-text-secondary hover:text-sky-400"><Settings size={16} /></button>
            <ThemeToggle />
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 ml-1 text-text-secondary hover:text-red-400"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
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
            activeGoalId={learnerData?.activeGoalId}
            forcedExpandedIds={forcedExpandedIds}
          />
        </div>
        {learnerData && learnerData.copySources && learnerData.copySources.length > 0 && (
          <div className="p-3 border-t border-border-color bg-gray-50 dark:bg-slate-900 text-xs text-text-secondary shrink-0">
            <h3 className="font-semibold mb-1">
              {t.learner.includesDataFrom}
            </h3>
            <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto">
              {learnerData.copySources.map((src, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate" title={src.sourceId}>
                    {src.sourceId.substring(0, 8)}...
                  </span>
                  <span className="whitespace-nowrap ml-2">
                    {new Date(src.copiedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Footer Imports/Exports */}
        <div className="p-2 border-t border-border-color flex justify-between">
          <div className="flex gap-2">
            <button onClick={handleExport} className="text-text-secondary hover:text-sky-400"><Download size={16} /></button>
            <button onClick={handleImportClick} className="text-text-secondary hover:text-sky-400"><Upload size={16} /></button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
          </div>
          {onLogout && <LogoutButton onLogout={onLogout} />}
        </div>

        {/* Resize Handle (Desktop) */}
        {!isMobile && (
          <div
            className="absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 cursor-col-resize z-10 transition-colors group"
            style={{ right: -2 }}
            onMouseDown={startResizing}
          >
            {/* Visual indicator on hover */}
            <div className="absolute inset-y-0 right-0 w-full bg-transparent group-hover:bg-sky-400/50 transition-colors" />
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto bg-chat-bg p-6 flex flex-col items-center relative">
        {/* Mobile Toggle Button */}
        {isMobile && !isSidebarOpen && (
          <button
            className="absolute top-4 left-4 p-2 text-text-secondary hover:text-sky-400 z-10 bg-white/50 dark:bg-slate-900/50 rounded-md backdrop-blur-sm border border-border-color shadow-sm"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
        )}
        {currentGoal ? (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Check for SRS Tag */}
            {currentGoal.tags && currentGoal.tags.some(t => t.startsWith('srs-deck')) ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border-color p-6">
                <div className="mb-6 border-b border-border-color pb-4">
                  <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400 mb-2">{currentGoal.title}</h1>
                  <p className="text-text-secondary">{currentGoal.description}</p>
                </div>
                <FlashcardDrill
                  key={currentGoal.id}
                  goalId={currentGoal.id}
                  dataSourceUrl={currentGoal.extendedData?.vocabularySource}
                  onComplete={() => {
                    // Refresh mastery if needed or just show confetti
                    onRefresh?.()
                  }}
                  skillPilotId={skillpilotId}
                  titleOverride={currentGoal.title}
                  filterTags={(() => {
                    const tags = currentGoal.tags || []
                    const selectTags = tags.filter(t => t.startsWith('select:'))
                    if (selectTags.length > 0) return selectTags
                    return tags.filter(t => !t.startsWith('srs-deck') && !['structure', 'root', 'module', 'lesson', 'vocabulary', 'grammar', 'practice', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(t))
                  })()}
                />
              </div>
            ) : (
              <GoalCard
                goal={currentGoal}
                masteryValue={getMastery(currentGoal.id)}
                showLearnerTools={true}
                isPlanned={plannedGoals.has(currentGoal.id)}
                isActive={learnerData?.activeGoalId === currentGoal.id}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <p>Select a goal to start learning</p>
          </div>
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
