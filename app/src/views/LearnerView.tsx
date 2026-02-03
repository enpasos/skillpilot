import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useLearnerUpdates } from '../hooks/useLearnerUpdates'
import { useTranslation } from '../hooks/useTranslation'
import { CompetenceTree } from '../components/CompetenceTree'
import { PersonalCurriculumSetup } from '../components/PersonalCurriculumSetup'
import { Settings, Upload, Download, Menu, X, Target, Send, Check, MoveRight } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { InfoModal } from '../components/InfoModal'
import { LogoutButton } from '../components/LogoutButton'
import { GoalCard } from '../components/GoalCard'
import { FlashcardDrill } from '../components/srs/FlashcardDrill'
import { ProgressPopover } from '../components/ProgressPopover'
import { InlineMathText } from '../components/InlineMathText'
import { useLanguage } from '../contexts/LanguageContext'
import { isMastered } from '../goalUiUtils'
import { useSrsMastery } from '../hooks/useSrsMastery'
import { getSrsFilterTagsForGoal } from '../utils/srsTags'

import type { UiGoal } from '../goalTypes'
import type { Learner, FrontierGoal } from '../learnerTypes'

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
  const [frontierOptions, setFrontierOptions] = useState<FrontierGoal[]>([])
  const [stateActiveGoalId, setStateActiveGoalId] = useState<string | null>(null)
  const [stateRequiredAction, setStateRequiredAction] = useState<string | null>(null)
  const [backendStats, setBackendStats] = useState<{
    masteredAtomic: number
    totalAtomic: number
    personalizedMasteredAtomic?: number
    personalizedTotalAtomic?: number
  } | null>(null)
  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [personalConfig, setPersonalConfig] = useState<Record<string, { selected: boolean; filterId?: string }>>({})

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState<'info' | 'error' | 'success'>('info');

  // Refresh counter to force CompetenceTree re-render on SSE updates
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [srsMasteryTick, setSrsMasteryTick] = useState(0);


  const fileInputRef = useRef<HTMLInputElement>(null)
  const srsCompletionRef = useRef<Record<string, number>>({})
  const srsCompletionInFlightRef = useRef<Set<string>>(new Set())

  const { language } = useLanguage();
  const t = useTranslation();

  const selectedId = currentGoal?.id ?? rootGoals[0]?.id ?? ''
  const effectiveActiveGoalId = stateActiveGoalId ?? learnerData?.activeGoalId ?? null

  const srsGoals = useMemo(() => {
    return Array.from(goalIndexAll.values()).filter((goal) => {
      if (landscapeId && goal.landscapeId && goal.landscapeId !== landscapeId) return false
      if (!goal.tags || !goal.tags.some((tag) => tag.startsWith('srs-deck'))) return false
      return typeof goal.extendedData?.vocabularySource === 'string'
    })
  }, [goalIndexAll, landscapeId])

  const srsMasteryByGoal = useSrsMastery(srsGoals, skillpilotId, srsMasteryTick)

  const getEffectiveMastery = useCallback((goalId: string) => {
    const override = srsMasteryByGoal[goalId]
    return override !== undefined ? override : getMastery(goalId)
  }, [srsMasteryByGoal, getMastery])

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

  const getVisibleChildIds = useCallback((parentId: string) => {
    const parent = goalIndexAll.get(parentId)
    const childIds = parent?.contains ?? []
    if (childIds.length === 0) return []

    const hasConfig = Object.keys(personalConfig).length > 0
    const hasPositiveSibling = hasConfig && childIds.some(childId => {
      const c = goalIndexAll.get(childId)
      if (!c) return false
      const cfg = (c.landscapeId ? personalConfig[c.landscapeId] : undefined) ?? personalConfig[c.id]
      return cfg?.selected === true
    })

    return childIds.filter((childId) => {
      const child = goalIndexAll.get(childId)
      if (!child) return false

      // 1) Global active filter (e.g. "GK", "LK")
      if (effectiveActiveFilter && effectiveActiveFilter !== 'all') {
        if (child.tags && child.tags.length > 0 && !child.tags.includes(effectiveActiveFilter)) {
          return false
        }
      }

      // 2) Personal curriculum selection + per-landscape filterId
      if (hasConfig) {
        const cfg = (child.landscapeId ? personalConfig[child.landscapeId] : undefined) ?? personalConfig[child.id]
        if (cfg) {
          if (cfg.selected !== true) return false
          if (cfg.filterId && child.tags && child.tags.length > 0 && !child.tags.includes(cfg.filterId)) {
            return false
          }
        } else if (hasPositiveSibling) {
          return false
        }
      }

      return true
    })
  }, [goalIndexAll, personalConfig, effectiveActiveFilter])

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
      const childIds = getVisibleChildIds(g.id)
      childIds.forEach((childId) => {
        const child = goalIndexAll.get(childId)
        if (child) stack.push(child)
      })
    }
    return visible
  }, [visibleRootGoals, goalIndexAll, personalConfig, getVisibleChildIds])

  const getFilteredMastery = useCallback(
    (goalId: string) => {
      const masteryCache = new Map<string, { masterySum: number; weightSum: number }>()

      const compute = (
        gId: string,
        visited: Set<string> = new Set(),
      ): { masterySum: number; weightSum: number } => {
        if (masteryCache.has(gId)) return masteryCache.get(gId)!
        if (visited.has(gId)) return { masterySum: 0, weightSum: 0 }

        visited.add(gId)
        const goal = goalIndexAll.get(gId)
        if (!goal) return { masterySum: 0, weightSum: 0 }

        let masterySum = 0
        let weightSum = 0
        const children = getVisibleChildIds(gId)

        if (!goal.contains || goal.contains.length === 0 || children.length === 0) {
          const masteryValue = getEffectiveMastery(gId)
          const weight = goal.weight ?? 1
          masterySum = masteryValue * weight
          weightSum = weight
        } else {
          children.forEach((childId) => {
            const childTotals = compute(childId, new Set(visited))
            masterySum += childTotals.masterySum
            weightSum += childTotals.weightSum
          })
        }

        visited.delete(gId)
        masteryCache.set(gId, { masterySum, weightSum })
        return { masterySum, weightSum }
      }

      const totals = compute(goalId)
      return totals.weightSum > 0 ? totals.masterySum / totals.weightSum : 0
    },
    [goalIndexAll, getEffectiveMastery, getVisibleChildIds],
  )

  // Calculate statistics: Total Atomic and Mastered Atomic
  // Relative to Focus (Planned Subtree) if active, otherwise Global Visible.
  const stats = useMemo(() => {
    const hasPersonalConfig = Object.keys(personalConfig).length > 0
    const hasActiveFilter = !!effectiveActiveFilter && effectiveActiveFilter !== 'all'

    // In global mode (no planned goals), prefer backend stats only when no filters are active
    if (plannedGoals.size === 0 && backendStats && !hasPersonalConfig && !hasActiveFilter) {
      return backendStats
    }

    // Local calculation for scope mode or fallback
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
        if (isMastered(getEffectiveMastery(id))) {
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
      // Global Mode: Local fallback if backend stats not available
      visibleGoals.forEach(id => {
        const g = goalIndexAll.get(id)
        if (g && (!g.contains || g.contains.length === 0)) {
          totalAtomic++
          if (isMastered(getEffectiveMastery(id))) {
            masteredAtomic++
          }
        }
      })
    }

    return { totalAtomic, masteredAtomic }
  }, [plannedGoals, goalIndexAll, visibleGoals, getEffectiveMastery, backendStats, personalConfig, effectiveActiveFilter])


  // Reveal Active Goal Logic
  const revealActiveGoal = useCallback(() => {
    if (!effectiveActiveGoalId || !parentMap) return
    const targetId = effectiveActiveGoalId
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
  }, [effectiveActiveGoalId, parentMap, onSelectGoal, selectedId])

  // Reveal Scope (Planned Goals) Logic
  const revealScope = useCallback(() => {
    if (!parentMap || plannedGoals.size === 0) return
    // Get the first (and typically only) planned goal as target
    const targetId = Array.from(plannedGoals)[0]
    if (!targetId) return

    const ancestors = new Set<string>()

    // Find all ancestors to expand
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
  }, [parentMap, plannedGoals, onSelectGoal, selectedId])

  // Auto-reveal scope on start if no active goal exists but scope is set
  const hasAutoRevealedScope = useRef(false)
  useEffect(() => {
    // Only run once on initial load
    if (hasAutoRevealedScope.current) return
    // Wait until data is loaded
    if (!parentMap || parentMap.size === 0) return

    // If there's an active goal, reveal that instead
    if (effectiveActiveGoalId) {
      hasAutoRevealedScope.current = true
      return
    }

    // If there's a scope but no active goal, reveal the scope
    if (plannedGoals.size > 0) {
      hasAutoRevealedScope.current = true
      revealScope()
    }
  }, [effectiveActiveGoalId, plannedGoals, parentMap, revealScope])

  // Frontier Logic: Identify the "Next Actionable" goal in every branch.
  // Assumption: Content is sequential within containers.
  const frontierIds = useMemo(() => {
    const ids = new Set<string>()

    const check = (id: string): boolean => {
      // Respect Global Visibility Config (e.g. Personal Curriculum)
      if (!visibleGoals.has(id)) return false

      const g = goalIndexAll.get(id)
      if (!g) return false

      // Check Prerequisites (Requires)
      // If ANY required goal is not masterd, this goal is BLOCKED (not frontier).
      if (g.requires && g.requires.length > 0) {
        for (const reqId of g.requires) {
          // Check if requirement is visible? Usually yes.
          // Check mastery.
          if (!isMastered(getEffectiveMastery(reqId))) {
            return false // Blocked by prerequisite
          }
        }
      }

      // 1. If Atomic
      if (!g.contains || g.contains.length === 0) {

        // Final Filter Check for Atomic Goal
        if (activeFilter && activeFilter !== 'all') {
          // Only strictly enforce if the goal HAS tags. If it has no tags, we assume it's generic/OK.
          if (g.tags && g.tags.length > 0 && !g.tags.includes(activeFilter)) {
            return false; // Skip this goal, it's not for this profile
          }
        }

        const m = getEffectiveMastery(id)
        if (!isMastered(m)) {
          ids.add(id)
          return true // Found frontier, branch is active
        }
        return false // Mastered
      }

      // 2. If Container
      // If the container ITSELF is marked mastered (explicitly), we might skip children?
      // But typically mastery is on atomic leaves. Let's traverse children.
      let containerActive = false
      for (const childId of g.contains) {
        // If we found the frontier in this child, we STOP checking subsequent children (Sequential assumption).
        // This ensures typically only 1 frontier goal per container.
        const childActive = check(childId)
        if (childActive) {
          containerActive = true
          break
        }
      }
      return containerActive
    }

    // Check all visible roots in parallel (parallel tracks)
    visibleRootGoals.forEach(r => check(r.id))

    return ids
  }, [visibleRootGoals, goalIndexAll, getEffectiveMastery, visibleGoals, activeFilter])

  const atomicFrontierOptions = useMemo(() => {
    const atomic = frontierOptions.filter((candidate) => candidate.type === 'atomic')
    const strategy = learnerData?.learningStrategy || 'RANDOM'

    if (strategy === 'SEQUENTIAL') {
      return atomic
    } else {
      // RANDOM: Deterministic shuffle based on options length/content to avoid jitter
      // We will just shuffle once when list changes.
      const shuffled = [...atomic]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled
    }
  }, [frontierOptions, learnerData?.learningStrategy])

  const backendFrontierIds = useMemo(
    () => new Set(atomicFrontierOptions.map((goal) => goal.id)),
    [atomicFrontierOptions],
  )

  const shouldShowNextSteps =
    atomicFrontierOptions.length > 0 &&
    (stateRequiredAction ? stateRequiredAction === 'setActiveGoal' : !effectiveActiveGoalId)


  const refreshState = useCallback(
    async (cacheBust = false) => {
      if (!skillpilotId) return
      try {
        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const suffix = cacheBust ? `?_t=${Date.now()}` : ''
        const url = apiBase
          ? `${apiBase}/api/ui/learners/${skillpilotId}/state${suffix}`
          : `/api/ui/learners/${skillpilotId}/state${suffix}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (data.frontier && Array.isArray(data.frontier)) {
            setFrontierOptions(data.frontier)
          } else if (data.stateMachine && Array.isArray(data.stateMachine.goalOptions)) {
            setFrontierOptions(data.stateMachine.goalOptions)
          } else {
            setFrontierOptions([])
          }
          setStateActiveGoalId(data.activeGoal?.id ?? data.stateMachine?.activeGoal?.id ?? null)
          setStateRequiredAction(data.stateMachine?.requiredAction ?? null)
          // Store backend-computed stats for consistency with GPT
          if (data.goals) {
            setBackendStats({
              masteredAtomic: data.goals.mastered_count ?? 0,
              totalAtomic: data.goals.total_count ?? 0,
              personalizedMasteredAtomic: data.goals.personalized?.mastered_atomic,
              personalizedTotalAtomic: data.goals.personalized?.total_atomic,
            })
          }
        }
      } catch (e) {
        console.warn('Failed to load learner state', e)
      }
    },
    [skillpilotId],

  )

  const refreshPlanned = useCallback(async () => {
    if (!skillpilotId) return
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
  }, [skillpilotId])

  const [srsReloadCounter, setSrsReloadCounter] = useState(0)

  const handleSseUpdate = useCallback(async (payload?: { type?: string; nodeId?: string }) => {
    if (payload?.type === 'CLIENT_STATE_UPDATED' && payload?.nodeId) {
      setSrsMasteryTick(c => c + 1)
      if (currentGoal?.id === payload.nodeId) {
        setSrsReloadCounter(c => c + 1)
      }
      return
    }

    console.log('[SSE] 🔄 Triggering full refresh...')
    // Refresh mastery data, learner state, AND planned goals (scope) in parallel
    await Promise.all([
      refreshState(true),
      refreshPlanned(),
      onRefresh?.()
    ])
    // Increment counter to force CompetenceTree re-render
    setRefreshCounter(c => c + 1)
    console.log('[SSE] ✅ Refresh complete')
  }, [refreshState, refreshPlanned, onRefresh, currentGoal?.id])

  useLearnerUpdates(skillpilotId, handleSseUpdate)


  // Auto-reveal when active goal changes (including from SSE updates)
  const prevActiveGoalIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (effectiveActiveGoalId && effectiveActiveGoalId !== prevActiveGoalIdRef.current) {
      console.log('[SSE] 🎯 Active goal changed, revealing:', effectiveActiveGoalId)
      revealActiveGoal()
    }
    prevActiveGoalIdRef.current = effectiveActiveGoalId
  }, [effectiveActiveGoalId, revealActiveGoal])


  // Load planned goals from backend
  React.useEffect(() => {
    if (!skillpilotId) return

    // fetchPlanned now handled by refreshPlanned
    refreshPlanned()

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

    fetchLearnerData()
  }, [skillpilotId, refreshPlanned])

  const handleSetActiveGoal = useCallback(async (goalId: string) => {
    if (!skillpilotId) return;
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/active-goal` : `/api/ui/learners/${skillpilotId}/active-goal`

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId })
      });

      if (res.ok) {
        const data = await res.json()
        if (data.frontier && Array.isArray(data.frontier)) {
          setFrontierOptions(data.frontier)
        } else if (data.stateMachine && Array.isArray(data.stateMachine.goalOptions)) {
          setFrontierOptions(data.stateMachine.goalOptions)
        }

        const targetId = data.activeGoal?.id ?? goalId
        setLearnerData((prev) => (prev ? { ...prev, activeGoalId: targetId } : prev))
        setStateActiveGoalId(targetId)
        setStateRequiredAction(data.stateMachine?.requiredAction ?? null)
        if (parentMap) {
          const ancestors = new Set<string>()
          const queue = [targetId]
          while (queue.length > 0) {
            const current = queue.pop()!
            const parents = parentMap.get(current)
            if (parents) {
              parents.forEach((p) => {
                if (!ancestors.has(p)) {
                  ancestors.add(p)
                  queue.push(p)
                }
              })
            }
          }
          setForcedExpandedIds(ancestors)
        }
        if (targetId !== selectedId) {
          onSelectGoal(targetId)
        }
        onRefresh?.()
      } else {
        const message = await res.text()
        setModalTitle(language === 'de' ? 'Aktion nicht möglich' : 'Action not allowed')
        setModalMessage(message || (language === 'de'
          ? 'Dieses Ziel ist nicht im aktuellen Frontier.'
          : 'This goal is not in the current frontier.'))
        setModalType('error')
        setIsModalOpen(true)
      }
    } catch (e) {
      console.warn('Failed to set active goal', e)
    }
  }, [skillpilotId, onRefresh, parentMap, selectedId, onSelectGoal, language])

  // Autopilot Logic
  useEffect(() => {
    if (!learnerData?.autoPilot || !learnerData?.activeGoalId) return

    // Check if active goal is mastered
    const currentMastery = getEffectiveMastery(learnerData.activeGoalId)
    if (isMastered(currentMastery)) {
      if (atomicFrontierOptions.length > 0) {
        const next = atomicFrontierOptions[0]
        if (next.id !== learnerData.activeGoalId) {
          console.log("Autopilot: Switching to", next.title)
          handleSetActiveGoal(next.id)
        }
      }
    }
  }, [learnerData?.autoPilot, learnerData?.activeGoalId, getEffectiveMastery, atomicFrontierOptions, handleSetActiveGoal])

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
      await refreshState(true)
    } catch (e) {
      console.warn('Failed to save planned goals', e)
      // Revert on error? For now, just warn.
    }
  }, [plannedGoals, skillpilotId, refreshState])

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
    refreshState()
  }, [skillpilotId, refreshState])

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

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing.current) {
      setSidebarWidth(Math.max(240, Math.min(800, e.clientX)))
    }
  }, [])

  const stopResizing = useCallback(() => {
    isResizing.current = false
    document.removeEventListener('mousemove', resize)
    document.removeEventListener('mouseup', stopResizing)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [resize])

  const startResizing = useCallback(() => {
    isResizing.current = true
    document.addEventListener('mousemove', resize)
    document.addEventListener('mouseup', stopResizing)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [resize, stopResizing])

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
      await refreshState(true)
    } catch (e) {
      console.warn('Failed to save personal curriculum', e)
    }
  }, [skillpilotId, refreshState])

  // Save preferences to backend
  const handlePreferencesChange = useCallback(async (strategy: 'RANDOM' | 'SEQUENTIAL', autoPilot: boolean) => {
    setLearnerData(prev => prev ? { ...prev, learningStrategy: strategy, autoPilot } : null)

    if (!skillpilotId) return
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/preferences` : `/api/ui/learners/${skillpilotId}/preferences`
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learningStrategy: strategy, autoPilot })
      })
    } catch (e) {
      console.warn('Failed to save preferences', e)
    }
  }, [skillpilotId])

  // Save preferences to backend




  const handleExport = useCallback(async () => {
    if (!skillpilotId) return
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/export` : `/api/ui/learners/${skillpilotId}/export`
      const res = await fetch(url)
      if (res.ok) {
        const serverData = await res.json()

        // V2 Export: Collect Local SRS State
        const clientData: Record<string, unknown> = { srsState: {} }
        const prefix = `srs_state_${skillpilotId}_`

        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith(prefix)) {
              // Save full key-value pair. We will parse the key on import to handle ID changes.
              const val = localStorage.getItem(key)
              if (val) (clientData.srsState as Record<string, unknown>)[key] = JSON.parse(val)
            }
          }
        } catch (e) {
          console.warn("Error collecting local stats for export", e)
        }

        const parseTimestamp = (value: unknown) => {
          if (!value) return 0
          const numeric = Number(value)
          if (Number.isFinite(numeric)) return numeric
          const parsed = Date.parse(String(value))
          return Number.isFinite(parsed) ? parsed : 0
        }

        // Merge in server-stored SRS state (important for multi-device exports)
        try {
          const srsNodes = srsGoals.filter((goal) => goal.tags?.some((tag) => tag.startsWith('srs-deck')))
          await Promise.all(
            srsNodes.map(async (goal) => {
              const nodeId = goal.id
              const syncUrl = apiBase
                ? `${apiBase}/api/ui/learners/${skillpilotId}/client-state/${nodeId}`
                : `/api/ui/learners/${skillpilotId}/client-state/${nodeId}`
              try {
                const stateRes = await fetch(syncUrl)
                if (!stateRes.ok) return
                const payload = await stateRes.json()
                const serverState = payload?.srsState
                if (!serverState || Object.keys(serverState).length === 0) return

                const lastSyncKey = `srs_state_last_sync_${skillpilotId}_${nodeId}`
                const localLast = localStorage.getItem(lastSyncKey)
                const localLastAt = parseTimestamp(localLast)
                const serverUpdatedAt = parseTimestamp(payload?.updatedAt)

                const storageKey = `srs_state_${skillpilotId}_${nodeId}`
                const existing = (clientData.srsState as Record<string, unknown>)[storageKey]
                if (!existing || serverUpdatedAt > localLastAt) {
                  (clientData.srsState as Record<string, unknown>)[storageKey] = serverState
                }
              } catch (err) {
                console.warn('Error fetching server SRS state for export', err)
              }
            })
          )
        } catch (e) {
          console.warn('Error merging server SRS state for export', e)
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
        const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '');
        link.download = `learner_data_${skillpilotId}_${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Export failed", res.status, res.statusText)
      }
    } catch (e) {
      console.error("Export error", e)
    }
  }, [skillpilotId, srsGoals])

  const syncClientData = useCallback(async (nodeId: string): Promise<boolean> => {
    if (!skillpilotId || !nodeId) return false
    const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
    const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/client-state/${nodeId}` : `/api/ui/learners/${skillpilotId}/client-state/${nodeId}`
    const lastSyncKey = `srs_state_last_sync_${skillpilotId}_${nodeId}`
    const storageKey = `srs_state_${skillpilotId}_${nodeId}`

    let srsState: Record<string, unknown> = {}
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) srsState = JSON.parse(stored)
    } catch (e) {
      console.warn("Error collecting local SRS state for sync", e)
    }

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updatedAt: new Date().toISOString(),
          srsState
        })
      })

      if (res.ok) {
        try {
          const data = await res.json()
          if (data && data.savedAt) {
            localStorage.setItem(lastSyncKey, String(data.savedAt))
          } else {
            localStorage.setItem(lastSyncKey, new Date().toISOString())
          }
        } catch {
          localStorage.setItem(lastSyncKey, new Date().toISOString())
        }
        return true
      }
      if (res.status === 404) {
        console.warn('Client-state sync endpoint not available on backend.')
        return false
      }
      console.warn('Client-state sync failed', res.status, res.statusText)
      return false
    } catch (e) {
      console.warn('Client-state sync error', e)
      return false
    }
  }, [skillpilotId])

  useEffect(() => {
    const goalId = currentGoal?.id
    if (!goalId) return
    if (!currentGoal?.tags?.some((tag) => tag.startsWith('srs-deck'))) return

    const mastery = srsMasteryByGoal[goalId]
    if (mastery === undefined) return

    const previous = srsCompletionRef.current[goalId]
    if (previous === mastery) return
    srsCompletionRef.current[goalId] = mastery

    if (mastery < 1) return
    if (srsCompletionInFlightRef.current.has(goalId)) return

    srsCompletionInFlightRef.current.add(goalId)
    void (async () => {
      try {
        await syncClientData(goalId)
        await refreshState(true)
        onRefresh?.()
        setRefreshCounter((count) => count + 1)
      } finally {
        srsCompletionInFlightRef.current.delete(goalId)
      }
    })()
  }, [currentGoal?.id, currentGoal?.tags, srsMasteryByGoal, refreshState, onRefresh, syncClientData])

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
        let payloadToSend: unknown = json;
        let clientDataToRestore: unknown = null;

        if (json.serverExport && json.clientData) {
          console.log("Detected V2 Export Wrapper")
          payloadToSend = json.serverExport;
          clientDataToRestore = json.clientData as Record<string, unknown>;
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
          if (clientDataToRestore && (clientDataToRestore as Record<string, unknown>).srsState) {
            try {
              console.log("Restoring SRS State...")
              const srsState = (clientDataToRestore as Record<string, unknown>).srsState as Record<string, unknown>
              let restoreCount = 0;
              const goalStateMap = new Map<string, Record<string, unknown>>();

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
                  if (value && typeof value === 'object') {
                    goalStateMap.set(goalId, value as Record<string, unknown>)
                  }
                  restoreCount++;
                }
              })
              console.log(`Restored ${restoreCount} SRS state entries.`)

              // Persist restored SRS state to backend for memory nodes
              const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
              await Promise.all(
                Array.from(goalStateMap.entries()).map(async ([goalId, state]) => {
                  const syncUrl = apiBase
                    ? `${apiBase}/api/ui/learners/${skillpilotId}/client-state/${goalId}`
                    : `/api/ui/learners/${skillpilotId}/client-state/${goalId}`
                  try {
                    const res = await fetch(syncUrl, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        updatedAt: new Date().toISOString(),
                        srsState: state
                      })
                    })
                    if (res.ok) {
                      const lastSyncKey = `srs_state_last_sync_${skillpilotId}_${goalId}`
                      localStorage.setItem(lastSyncKey, new Date().toISOString())
                    }
                  } catch (err) {
                    console.warn('Failed to persist imported SRS state', err)
                  }
                })
              )
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
          } catch { /* ignore */ }

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
            <div className="text-xs flex items-center gap-2 mt-1">
              <button
                className="flex items-center gap-1 font-bold text-red-500 hover:text-red-400 transition-colors"
                onClick={revealScope}
                disabled={plannedGoals.size === 0}
                title={plannedGoals.size > 0
                  ? (language === 'de' ? 'Gehe zum markierten Scope' : 'Go to marked scope')
                  : t.learner.totalInContext
                }
              >
                {stats.totalAtomic} <Target size={16} />
              </button>
              <MoveRight size={12} className="text-slate-400" />
              <button
                className="text-slate-400 dark:text-slate-500 flex items-center gap-1 text-[10px] hover:text-sky-500 transition-colors"
                onClick={revealActiveGoal}
                title="Gehe zum aktiven Ziel / Go to active goal"
              >
                <Send size={16} className="text-amber-500" />
              </button>
              <MoveRight size={12} className="text-slate-400" />
              <ProgressPopover skillpilotId={skillpilotId} goalIndexAll={goalIndexAll}>
                <button
                  className="flex items-center gap-1 font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                  title={t.learner.completed}
                >
                  {stats.masteredAtomic} <Check size={16} strokeWidth={3} />
                </button>
              </ProgressPopover>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">

            {/* SSE auto-refresh now active - manual refresh button removed */}
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
            key={`competence-tree-${refreshCounter}`}
            rootGoals={visibleRootGoals}
            allGoals={goalIndexAll}
            getMastery={getEffectiveMastery}
            plannedGoals={plannedGoals}
            onTogglePlan={togglePlan}
            onSelect={onSelectGoal}
            selectedId={selectedId}
            activeFilter={effectiveActiveFilter}
            personalConfig={personalConfig}
            activeGoalId={effectiveActiveGoalId ?? undefined}
            forcedExpandedIds={forcedExpandedIds}
            frontierIds={frontierIds}
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
                  <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400 mb-2">
                    <InlineMathText text={currentGoal.title} />
                  </h1>
                  {currentGoal.description ? (
                    <p className="text-text-secondary">{currentGoal.description}</p>
                  ) : null}
                </div>
                <FlashcardDrill
                  key={`${currentGoal.id}:${srsReloadCounter}`}
                  goalId={currentGoal.id}
                  dataSourceUrl={currentGoal.extendedData?.vocabularySource as string | undefined}
                  skillPilotId={skillpilotId}
                  titleOverride={currentGoal.title}
                  onSync={syncClientData}
                  reloadSignal={srsReloadCounter}
                  filterTags={getSrsFilterTagsForGoal(currentGoal)}
                  onStateChange={() => setSrsMasteryTick(c => c + 1)}
                />
              </div>
            ) : (
              <GoalCard
                goal={currentGoal}
                masteryValue={
                  currentGoal.contains && currentGoal.contains.length > 0
                    ? getFilteredMastery(currentGoal.id)
                    : getEffectiveMastery(currentGoal.id)
                }
                showLearnerTools={true}
                isPlanned={plannedGoals.has(currentGoal.id)}
                isActive={effectiveActiveGoalId === currentGoal.id}
                onSetActive={handleSetActiveGoal}
                onRevealActive={revealActiveGoal}
                isFrontier={backendFrontierIds.has(currentGoal.id)}
              />
            )}

            {/* Extended Frontier Panel (Below GoalCard) */}
            {shouldShowNextSteps && (
              <div className="mt-8 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border-color p-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg text-sky-600 dark:text-sky-400">
                    <Send size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">
                      {t.learner?.nextSteps || "Als nächste Lernziele stehen dir offen:"}
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {t.learner?.chooseNext || "Welches möchtest du als Nächstes angehen?"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {atomicFrontierOptions
                    .slice(0, 6)
                    .map((candidate, idx) => (
                      <button
                        key={candidate.id}
                        onClick={() => handleSetActiveGoal(candidate.id)}
                        className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-border-color hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-md transition-all text-left group"
                      >
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-slate-700 text-xs font-bold text-text-secondary border border-border-color group-hover:border-sky-400 group-hover:text-sky-500 transition-colors shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <InlineMathText
                            text={candidate.title}
                            className="font-semibold text-text-primary group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2"
                          />
                        </div>
                      </button>
                    ))}
                </div>
              </div>
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
        initialStrategy={learnerData?.learningStrategy}
        initialAutoPilot={learnerData?.autoPilot}
        onPreferencesChange={handlePreferencesChange}
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
