import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CompetenceTree } from '../components/CompetenceTree'
import { GoalCard } from '../components/GoalCard'
import { NeighborSection } from '../components/NeighborSection'
import { ClassSetup } from '../components/ClassSetup'
import { ConfirmModal } from '../components/ConfirmModal'
import { InlineMathText } from '../components/InlineMathText'
import { LogoutButton } from '../components/LogoutButton'
import { useCompetenceGraph } from '../hooks/useCompetenceGraph'
import type { LandscapeEntry } from '../hooks/useLandscapes'
import type { UiGoal } from '../goalTypes'
import type { ClassSession } from '../trainerTypes'
import type { MasteryMap } from '../learnerTypes'

import { Save, Trash2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { en } from '../locales/en'
import { de } from '../locales/de'
import type { ToastKind } from '../hooks/useToast'
import { interpolateTemplate } from '../utils/interpolateTemplate'
import { hasReachableCompetencyDimensionRoot } from '../utils/goalCompetencyProjection'
import { migrateTrainerClassSession } from '../utils/trainerLandscapeContext'

const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
const toApi = (path: string) => (apiBase ? `${apiBase}${path}` : path)

interface TrainerViewProps {
  landscapeEntries: LandscapeEntry[]
  classSetupLandscapes?: LandscapeEntry[]
  onContextChange: (landscapeId: string, filter: string, goalId?: string) => void
  rootGoals: UiGoal[]
  goalIndexAll: Map<string, UiGoal>
  getMastery: (goalId: string) => number
  currentLearnerId: string
  onSelectLearner: (id: string) => void
  goalShortKeyMap: Map<string, string>
  onLogout?: () => void
  onNotify?: (kind: ToastKind, message: string) => void
}

const loadStoredTrainerClasses = (): ClassSession[] => {
  try {
    const raw = localStorage.getItem('skillpilot_classes')
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    const migrated = parsed.map((session) => migrateTrainerClassSession(session))
    if (JSON.stringify(migrated) !== JSON.stringify(parsed)) {
      localStorage.setItem('skillpilot_classes', JSON.stringify(migrated))
    }
    return migrated
  } catch (err) {
    console.warn('Could not load classes', err)
    return []
  }
}

const loadStoredActiveClassId = (): string | null => {
  try {
    return localStorage.getItem('skillpilot_active_class')
  } catch (err) {
    console.warn('Could not load active class', err)
    return null
  }
}

export const TrainerView: React.FC<TrainerViewProps> = ({
  landscapeEntries,
  classSetupLandscapes,
  onContextChange,
  rootGoals,
  goalIndexAll,
  currentLearnerId,
  onSelectLearner,
  goalShortKeyMap,
  onLogout,
  onNotify,
}) => {
  const { language } = useLanguage()
  const t = language === 'en' ? en.trainer : de.trainer
  const tExp = language === 'en' ? en.explorer : de.explorer
  const notifications = language === 'en' ? en.notifications : de.notifications
  const [classes, setClasses] = useState<ClassSession[]>(loadStoredTrainerClasses)
  const [activeClassId, setActiveClassId] = useState<string | null>(loadStoredActiveClassId)
  const [isCreating, setIsCreating] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string>(rootGoals[0]?.id ?? '')
  const [plannedGoals, setPlannedGoals] = useState<Set<string>>(new Set())
  const [masteryByStudent, setMasteryByStudent] = useState<Map<string, MasteryMap>>(new Map())
  const [plannedGoalsByStudent, setPlannedGoalsByStudent] = useState<Map<string, Set<string>>>(new Map())
  const [trainerStructureMode, setTrainerStructureMode] = useState<'content' | 'competency'>('content')
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean
    title: string
    message: React.ReactNode
    onConfirm: () => void
    confirmText?: string
    confirmClassName?: string
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  })
  const reportedLoadErrorsRef = useRef<Set<string>>(new Set())

  const notifyLoadErrorOnce = useCallback((key: string, message: string) => {
    if (!onNotify) return
    if (reportedLoadErrorsRef.current.has(key)) return
    reportedLoadErrorsRef.current.add(key)
    onNotify('error', message)
  }, [onNotify])

  const clearReportedLoadError = useCallback((key: string) => {
    reportedLoadErrorsRef.current.delete(key)
  }, [])

  // --- DERIVED STATE & MEMOS ---
  const aggregatedPlannedGoals = useMemo(() => {
    if (currentLearnerId !== '__ALL__' || plannedGoalsByStudent.size === 0) return undefined
    const result = new Map<string, number>()
    plannedGoalsByStudent.forEach((plannedSet) => {
      plannedSet.forEach((goalId) => {
        result.set(goalId, (result.get(goalId) ?? 0) + 1)
      })
    })
    return result
  }, [currentLearnerId, plannedGoalsByStudent])

  const activeClass = useMemo(() => classes.find((c) => c.id === activeClassId) ?? null, [activeClassId, classes])
  const activeLandscapeEntry = useMemo(
    () => landscapeEntries.find((entry) => entry.meta.landscapeId === activeClass?.landscapeId) ?? null,
    [activeClass, landscapeEntries],
  )
  const classRootGoals = useMemo(() => {
    if (!activeClass) {
      return rootGoals
    }

    const entryRoots = (activeLandscapeEntry?.goals ?? []).filter((goal) => (goal.tags ?? []).includes('root'))
    if (entryRoots.length > 0) {
      return entryRoots
    }

    const directLandscapeRoots = Array.from(goalIndexAll.values()).filter(
      (goal) =>
        goal.landscapeId === activeClass.landscapeId &&
        (goal.tags ?? []).includes('root'),
    )

    if (directLandscapeRoots.length > 0) {
      return directLandscapeRoots
    }

    return rootGoals.filter((g) => g.landscapeId === activeClass.landscapeId)
  }, [activeClass, activeLandscapeEntry, goalIndexAll, rootGoals])
  const hasCompetencyStructure = useMemo(
    () => hasReachableCompetencyDimensionRoot(classRootGoals, goalIndexAll),
    [classRootGoals, goalIndexAll],
  )
  useEffect(() => {
    if (trainerStructureMode !== 'competency' || hasCompetencyStructure) {
      return
    }
    setTrainerStructureMode('content')
  }, [hasCompetencyStructure, trainerStructureMode])
  const landscapeGoals = useMemo(
    () => Array.from(goalIndexAll.values()).filter((g) => !activeClass || g.landscapeId === activeClass.landscapeId),
    [activeClass, goalIndexAll],
  )
  const currentGoal = useMemo(() => {
    const g = selectedGoalId ? goalIndexAll.get(selectedGoalId) : undefined
    if (g && (!activeClass || g.landscapeId === activeClass.landscapeId)) return g
    return goalIndexAll.get(classRootGoals[0]?.id ?? '') ?? null
  }, [activeClass, classRootGoals, goalIndexAll, selectedGoalId])

  const { neighbors } = useCompetenceGraph(currentGoal, landscapeGoals)

  // --- MASTERY CALCULATION ---
  const masteryCache = useMemo(() => new Map<string, { masterySum: number; weightSum: number }>(), [])
  const getStudentMastery = useCallback(
    (goalId: string): number => {
      // For __ALL__ students view, studentMasteryMap will not be directly used at this top level
      // The aggregated logic will be handled inside getMasteryRecursive
      const studentMasteryMap = masteryByStudent.get(currentLearnerId)
      if (currentLearnerId !== '__ALL__' && !studentMasteryMap) return 0

      const getMasteryRecursive = (gId: string, visited: Set<string> = new Set()): { masterySum: number; weightSum: number } => {
        if (masteryCache.has(gId)) return masteryCache.get(gId)!
        if (visited.has(gId)) return { masterySum: 0, weightSum: 0 } // Circular dependency

        visited.add(gId)
        const goal = goalIndexAll.get(gId)
        if (!goal) return { masterySum: 0, weightSum: 0 }

        let masterySum = 0
        let weightSum = 0

        if (!goal.contains || goal.contains.length === 0) {
          let masteryValue = 0
          if (currentLearnerId === '__ALL__') {
            const key = goalShortKeyMap.get(gId)
            if (!key) return { masterySum: 0, weightSum: 0 }
            let totalMasteryForGoal = 0
            let studentsCounted = 0
            masteryByStudent.forEach((studentMap) => {
              const studentMastery = studentMap[key] ?? 0
              totalMasteryForGoal += studentMastery
              studentsCounted++
            })
            masteryValue = studentsCounted > 0 ? totalMasteryForGoal / studentsCounted : 0
          } else {
            // Existing logic for single student view
            const key = goalShortKeyMap.get(gId)
            masteryValue = key ? studentMasteryMap?.[key] ?? 0 : 0
          }
          const weight = goal.weight ?? 1
          masterySum = masteryValue * weight
          weightSum = weight
        } else {
          goal.contains.forEach((childId) => {
            const childGoal = goalIndexAll.get(childId)
            if (childGoal) {
              const childTotals = getMasteryRecursive(childId, new Set(visited))
              masterySum += childTotals.masterySum
              weightSum += childTotals.weightSum
            }
          })
        }
        masteryCache.set(gId, { masterySum, weightSum })
        return { masterySum, weightSum }
      }
      const totals = getMasteryRecursive(goalId)
      return totals.weightSum > 0 ? totals.masterySum / totals.weightSum : 0
    },
    [currentLearnerId, masteryByStudent, goalIndexAll, goalShortKeyMap, masteryCache],
  )



  // --- EFFECTS ---
  useEffect(() => {
    const isValid =
      selectedGoalId &&
      goalIndexAll.has(selectedGoalId) &&
      (!activeClass || goalIndexAll.get(selectedGoalId)?.landscapeId === activeClass.landscapeId)
    if (!isValid) {
      setSelectedGoalId(classRootGoals[0]?.id ?? '')
    }
  }, [activeClass, classRootGoals, goalIndexAll, selectedGoalId])

  useEffect(() => {
    if (classes.length === 0) {
      return
    }
    clearReportedLoadError('trainer-class-list-load')
  }, [classes.length, clearReportedLoadError])

  useEffect(() => {
    if (!activeClassId) {
      return
    }
    if (classes.some((session) => session.id === activeClassId)) {
      return
    }
    setActiveClassId(classes[0]?.id ?? null)
  }, [activeClassId, classes])

  useEffect(() => {
    try {
      if (activeClassId) {
        localStorage.setItem('skillpilot_active_class', activeClassId)
      } else {
        localStorage.removeItem('skillpilot_active_class')
      }
    } catch (err) {
      console.warn('Could not save active class', err)
      onNotify?.('error', notifications.trainerClassSaveFailed)
    }
  }, [activeClassId, notifications.trainerClassSaveFailed, onNotify])

  useEffect(() => {
    clearReportedLoadError('trainer-class-data-load')
  }, [activeClassId, clearReportedLoadError])

  const lastContextRef = useRef<{ lid: string; filter: string; goalId?: string }>({ lid: '', filter: '', goalId: undefined })
  useEffect(() => {
    if (!activeClass) return
    const isSameLandscape = lastContextRef.current.lid === activeClass.landscapeId
    const targetGoalId = activeClass.currentGoalId || (isSameLandscape ? selectedGoalId : undefined) || classRootGoals[0]?.id

    const next = { lid: activeClass.landscapeId, filter: activeClass.activeFilter, goalId: targetGoalId }
    const prev = lastContextRef.current
    if (
      prev.lid !== next.lid ||
      prev.filter !== next.filter ||
      prev.goalId !== next.goalId
    ) {
      lastContextRef.current = next
      onContextChange(next.lid, next.filter, next.goalId)
      if (next.goalId) setSelectedGoalId(next.goalId)
    }
    if (!activeClass.students.find((s) => s.id === currentLearnerId) && currentLearnerId !== '__ALL__') {
      onSelectLearner('__ALL__')
    }
  }, [activeClass, classRootGoals, currentLearnerId, onSelectLearner, selectedGoalId, onContextChange])

  useEffect(() => {
    if (!activeClass) return
    const fetchAllData = async () => {
      let hadDataLoadFailure = false
      const masteryPromises = activeClass.students.map(async (student) => {
        try {
          const res = await fetch(toApi(`/api/ui/learners/${encodeURIComponent(student.id)}/mastery`))
          if (res.ok) {
            const data = await res.json()
            if (data && data.mastery) return [student.id, data.mastery] as const
          } else {
            hadDataLoadFailure = true
          }
        } catch (err) {
          console.warn(`Could not load mastery for ${student.name}`, err)
          hadDataLoadFailure = true
        }
        return [student.id, {}] as const
      })
      const plannedGoalsPromises = activeClass.students.map(async (student) => {
        try {
          const res = await fetch(toApi(`/api/ui/learners/${encodeURIComponent(student.id)}/planned`))
          if (res.ok) {
            const data = await res.json()
            if (data && Array.isArray(data.goals)) return [student.id, new Set<string>(data.goals as string[])] as const
          } else {
            hadDataLoadFailure = true
          }
        } catch (err) {
          console.warn(`Could not load planned goals for ${student.name}`, err)
          hadDataLoadFailure = true
        }
        return [student.id, new Set()] as const
      })
      const [masteryResults, plannedGoalsResults] = await Promise.all([
        Promise.all(masteryPromises),
        Promise.all(plannedGoalsPromises),
      ])
      setMasteryByStudent(new Map(masteryResults))
      setPlannedGoalsByStudent(new Map<string, Set<string>>(plannedGoalsResults as [string, Set<string>][]))
      if (hadDataLoadFailure) {
        notifyLoadErrorOnce('trainer-class-data-load', notifications.trainerClassDataLoadFailed)
      } else {
        clearReportedLoadError('trainer-class-data-load')
      }
    }
    void fetchAllData()
  }, [activeClass, clearReportedLoadError, notifications.trainerClassDataLoadFailed, notifyLoadErrorOnce])

  useEffect(() => {
    if (currentLearnerId && currentLearnerId !== '__ALL__') {
      setPlannedGoals(plannedGoalsByStudent.get(currentLearnerId) ?? new Set())
    } else {
      setPlannedGoals(new Set())
    }
  }, [currentLearnerId, plannedGoalsByStudent])

  // --- HANDLERS ---
  const persistClasses = (items: ClassSession[]) => {
    setClasses(items)
    try {
      localStorage.setItem('skillpilot_classes', JSON.stringify(items))
      return true
    } catch (err) {
      console.warn('Could not save classes', err)
      onNotify?.('error', notifications.trainerClassSaveFailed)
      return false
    }
  }

  const handleSelectGoal = (id: string) => {
    setSelectedGoalId(id)
    if (activeClass) {
      const updated = classes.map((c) => (c.id === activeClass.id ? { ...c, currentGoalId: id } : c))
      persistClasses(updated)
    }
    onContextChange(activeClass?.landscapeId ?? '', activeClass?.activeFilter ?? 'all', id)
  }

  const handleTogglePlan = async (goalId: string) => {
    if (!currentLearnerId || currentLearnerId === '__ALL__') return
    const previousPlannedGoals = plannedGoals
    const previousPlannedGoalsByStudent = plannedGoalsByStudent
    const next = new Set(plannedGoals)
    if (next.has(goalId)) next.delete(goalId)
    else next.add(goalId)
    setPlannedGoals(next)
    setPlannedGoalsByStudent(new Map(plannedGoalsByStudent).set(currentLearnerId, next))
    try {
      const res = await fetch(toApi(`/api/ui/learners/${encodeURIComponent(currentLearnerId)}/planned`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals: Array.from(next) }),
      })
      if (!res.ok) {
        throw new Error(`Unexpected status ${res.status}`)
      }
    } catch (err) {
      console.warn('Could not save learning plan', err)
      setPlannedGoals(previousPlannedGoals)
      setPlannedGoalsByStudent(previousPlannedGoalsByStudent)
      onNotify?.('error', notifications.trainerPlannedGoalSaveFailed)
    }
  }

  const handleTogglePlanForAll = async (goalId: string) => {
    if (!activeClass) return
    const goal = goalIndexAll.get(goalId)
    if (!goal) return

    const plannedCount = aggregatedPlannedGoals?.get(goalId) ?? 0
    const isRemoving = plannedCount > 0

    const doToggle = async () => {
      setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => { } })
      setIsAssigning(true)
      try {
        await Promise.all(
          activeClass.students.map(async (student) => {
            const studentGoals = plannedGoalsByStudent.get(student.id) ?? new Set()
            const hasGoal = studentGoals.has(goalId)
            let newGoals: Set<string> | null = null
            if (isRemoving) {
              if (hasGoal) {
                newGoals = new Set(studentGoals)
                newGoals.delete(goalId)
              }
            } else if (!hasGoal) {
              newGoals = new Set(studentGoals)
              newGoals.add(goalId)
            }
            if (newGoals) {
              const res = await fetch(toApi(`/api/ui/learners/${encodeURIComponent(student.id)}/planned`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goals: Array.from(newGoals) }),
              })
              if (!res.ok) {
                throw new Error(`Unexpected status ${res.status} while saving planned goals for ${student.id}`)
              }
            }
          }),
        )
        const plannedGoalsPromises = activeClass.students.map(async (student) => {
          try {
            const res = await fetch(toApi(`/api/ui/learners/${encodeURIComponent(student.id)}/planned`))
            if (res.ok) {
              const data = await res.json()
              if (data && Array.isArray(data.goals)) return [student.id, new Set(data.goals)] as const
            }
            throw new Error(`Unexpected status ${res.status} while loading planned goals for ${student.id}`)
          } catch (err) {
            console.warn(`Could not load planned goals for ${student.name}`, err)
            throw err
          }
        })
        const plannedGoalsResults = await Promise.all(plannedGoalsPromises)
        setPlannedGoalsByStudent(new Map<string, Set<string>>(plannedGoalsResults as [string, Set<string>][]))
      } catch (err) {
        console.error(err)
        onNotify?.('error', notifications.trainerBulkPlannedGoalSaveFailed)
      } finally {
        setIsAssigning(false)
      }
    }
    setConfirmation({
      isOpen: true,
      title: isRemoving ? t.bulkRemoveDialogTitle : t.bulkAddDialogTitle,
      message: isRemoving
        ? interpolateTemplate(t.bulkRemoveDialogMessage, { goal: goal.title, count: plannedCount })
        : interpolateTemplate(t.bulkAddDialogMessage, { goal: goal.title, count: activeClass.students.length }),
      confirmText: isRemoving ? t.bulkRemoveDialogConfirm : t.bulkAddDialogConfirm,
      confirmClassName: isRemoving ? 'bg-rose-600 hover:bg-rose-500' : 'bg-sky-600 hover:bg-sky-500',
      onConfirm: doToggle,
    })
  }

  const handleAssignToClass = async () => {
    if (!currentGoal) return
    await handleTogglePlanForAll(currentGoal.id)
  }

  const handleExportClass = (e: React.MouseEvent, session: ClassSession) => {
    e.stopPropagation()
    const data = JSON.stringify(session, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `skillpilot-class-${session.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onNotify?.('success', notifications.classExported)
  }

  const handleDeleteClass = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmation({
      isOpen: true,
      title: t.deleteClassDialogTitle,
      message: interpolateTemplate(t.deleteClassDialogMessage, { name }),
      confirmText: t.deleteClassDialogConfirm,
      confirmClassName: 'bg-rose-600 hover:bg-rose-500',
      onConfirm: () => {
        persistClasses(classes.filter((c) => c.id !== id))
        setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => { } })
      },
    })
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleImportClass = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result as string
        const session = JSON.parse(content)
        if (!session.id || !session.name || !Array.isArray(session.students)) {
          throw new Error(t.invalidImportFormat)
        }
        const doImport = (overwrite = false) => {
          const idx = classes.findIndex((c) => c.id === session.id)
          let next = classes
          if (idx >= 0) {
            if (!overwrite) return
            next = [...classes]
            next[idx] = session
          } else {
            next = [...classes, session]
          }
          if (!persistClasses(next)) {
            return
          }
          onNotify?.('success', notifications.classImported)
          setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => { } })
        }
        const idx = classes.findIndex((c) => c.id === session.id)
        if (idx >= 0) {
          setConfirmation({
            isOpen: true,
            title: t.importClassDialogTitle,
            message: interpolateTemplate(t.importClassDialogMessage, { name: session.name }),
            confirmText: t.importClassDialogConfirm,
            onConfirm: () => doImport(true),
          })
        } else {
          doImport()
        }
      } catch (err) {
        console.error(err)
        onNotify?.(
          'error',
          `${notifications.classImportFailed}: ${(err as Error).message}`,
        )
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsText(file)
  }

  // ----- RENDER -----
  if (isCreating) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8 flex items-center justify-center">
        <ClassSetup landscapes={classSetupLandscapes ?? landscapeEntries} onCancel={() => setIsCreating(false)} onSave={(session) => {
          const next = [...classes, session]
          persistClasses(next)
          setActiveClassId(session.id)
          setIsCreating(false)
        }} />
      </div>
    )
  }
  if (!activeClass) {
    return (
      <div className="min-h-screen bg-chat-bg p-12 text-text-primary">
        <ConfirmModal isOpen={confirmation.isOpen} onClose={() => setConfirmation({ ...confirmation, isOpen: false })} onConfirm={confirmation.onConfirm} title={confirmation.title} confirmText={confirmation.confirmText} confirmClassName={confirmation.confirmClassName}>
          {confirmation.message}
        </ConfirmModal>
        <header className="max-w-4xl mx-auto mb-12 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-sky-600 dark:text-sky-400">{t.dashboard}</h1>
          <div className="flex gap-3">
            <button onClick={() => fileInputRef.current?.click()} className="border border-border-color hover:bg-gray-200 dark:hover:bg-slate-800 px-4 py-2 rounded-lg text-text-secondary transition-colors">{t.import}</button>
            <input type="file" ref={fileInputRef} onChange={handleImportClass} hidden accept=".json" />
            <button onClick={() => setIsCreating(true)} className="bg-sky-600 hover:bg-sky-500 px-6 py-2 rounded-lg font-medium transition-colors text-white">+ {t.newClass}</button>
            {onLogout && (
              <LogoutButton
                onLogout={onLogout}
                size="pill"
                className="border border-border-color hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400 text-text-secondary"
              />
            )}
          </div>
        </header>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => (
            <div key={c.id} onClick={() => setActiveClassId(c.id)} className="relative flex flex-col text-left bg-sidebar-bg border border-border-color hover:border-sky-500 p-6 rounded-xl transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <div className="font-bold text-lg text-text-primary group-hover:text-sky-600 dark:group-hover:text-sky-400 pr-2">{c.name}</div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleExportClass(e, c)}
                    className="p-2 rounded-lg border border-border-color text-text-secondary hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                    title={t.classExportTooltip}
                  >
                    <Save size={16} className="pointer-events-none" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClass(e, c.id, c.name)}
                    className="p-2 rounded-lg border border-border-color text-text-secondary hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title={t.classDeleteTooltip}
                  >
                    <Trash2 size={16} className="pointer-events-none" />
                  </button>
                </div>
              </div>

              <div className="text-sm text-text-secondary mb-4">{c.students.length} {t.students}</div>
              <div className="mt-auto flex gap-2 text-[10px] uppercase tracking-wider text-text-secondary">
                <span className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded border border-border-color">{c.landscapeId}</span>
                <span className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded border border-border-color">{c.activeFilter || 'all'}</span>
              </div>
            </div>
          ))}
          {classes.length === 0 && <div className="col-span-full text-center py-20 border-2 border-dashed border-border-color rounded-2xl text-text-secondary">{t.emptyClasses}</div>}
        </div>

      </div>
    )
  }
  return (
    <div className="flex h-screen bg-chat-bg text-text-primary overflow-hidden">
      <ConfirmModal isOpen={confirmation.isOpen} onClose={() => setConfirmation({ ...confirmation, isOpen: false })} onConfirm={confirmation.onConfirm} title={confirmation.title} confirmText={confirmation.confirmText} confirmClassName={confirmation.confirmClassName}>
        {confirmation.message}
      </ConfirmModal>
      <aside className="w-72 border-r border-border-color bg-sidebar-bg flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border-color flex justify-between items-start">
          <div>
            <button onClick={() => setActiveClassId(null)} className="text-xs text-text-secondary hover:text-text-primary mb-2">← {t.allClasses}</button>
            <h2 className="font-bold text-sky-600 dark:text-sky-400 truncate" title={activeClass.name}>{activeClass.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            {onLogout && (
              <LogoutButton onLogout={onLogout} className="text-text-secondary hover:text-rose-600 dark:hover:text-rose-400" />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="text-[10px] uppercase text-text-secondary font-bold px-2 mb-1 mt-2">{t.studentList} ({activeClass.students.length})</div>
          <button onClick={() => onSelectLearner('__ALL__')} className={`w-full text-left px-3 py-2 rounded text-sm flex justify-between items-center group ${currentLearnerId === '__ALL__' ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-200 border border-sky-300 dark:border-sky-500/30' : 'text-text-secondary hover:bg-gray-200 dark:hover:bg-slate-900'}`}>
            <span className="truncate">{t.allStudents}</span>
            {currentLearnerId === '__ALL__' && <span className="w-2 h-2 rounded-full bg-sky-400" />}
          </button>
          {activeClass.students.map((s) => (
            <button key={s.id} onClick={() => onSelectLearner(s.id)} className={`w-full text-left px-3 py-2 rounded text-sm flex justify-between items-center group ${currentLearnerId === s.id ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-200 border border-sky-300 dark:border-sky-500/30' : 'text-text-secondary hover:bg-gray-200 dark:hover:bg-slate-900'}`}>
              <span className="truncate">{s.name}</span>
              {currentLearnerId === s.id && <span className="w-2 h-2 rounded-full bg-sky-400" />}
            </button>
          ))}
        </div>
      </aside>
      <aside className="w-1/3 min-w-[320px] border-r border-border-color flex flex-col bg-sidebar-bg">
        <div className="p-4 border-b border-border-color bg-sidebar-bg">
          <div className="text-xs uppercase text-text-secondary font-bold mb-1">{t.currentContext}</div>
          {currentGoal && (
            <InlineMathText
              text={currentGoal.title}
              title={currentGoal.title}
              className="font-medium text-text-primary truncate mb-2"
            />
          )}
          {hasCompetencyStructure && (
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-wide text-text-secondary font-bold mb-2">
                {t.structureMode}
              </div>
              <div className="inline-flex rounded-lg border border-border-color overflow-hidden bg-chat-bg/40">
                {([
                  ['content', t.structureContent],
                  ['competency', t.structureCompetencies],
                ] as const).map(([mode, label]) => {
                  const isActive = trainerStructureMode === mode
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTrainerStructureMode(mode)}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-sky-600 text-white'
                          : 'text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 p-2 overflow-y-auto">
          <CompetenceTree
            key={`trainer-competence-tree-${activeClass?.id ?? 'none'}-${trainerStructureMode}`}
            rootGoals={classRootGoals}
            allGoals={goalIndexAll}
            getMastery={getStudentMastery}
            plannedGoals={plannedGoals}
            onTogglePlan={currentLearnerId === '__ALL__' ? handleTogglePlanForAll : handleTogglePlan}
            onSelect={handleSelectGoal}
            selectedId={selectedGoalId}
            activeFilter={currentLearnerId === '__ALL__' ? 'all' : activeClass.activeFilter}
            structureMode={trainerStructureMode}
            aggregatedPlannedGoals={aggregatedPlannedGoals}
            totalStudents={activeClass.students.length}
          />
        </div>
      </aside>
      <main className="flex-1 p-8 bg-chat-bg overflow-y-auto flex flex-col">
        {currentGoal ? (
          currentLearnerId === '__ALL__' ? (
            (() => {
              const plannedCount = aggregatedPlannedGoals?.get(currentGoal.id) ?? 0
              const isRemoving = plannedCount > 0
              return (
                <div className="max-w-2xl mx-auto w-full space-y-6">
                  <NeighborSection
                    title={tExp.requires}
                    emptyLabel={tExp.emptyRequires}
                    goals={neighbors.requires}
                    getMastery={getStudentMastery}
                    onClick={handleSelectGoal}
                    showMastery
                  />
                  <NeighborSection
                    title={tExp.inheritedRequires}
                    emptyLabel={tExp.emptyInherited}
                    goals={neighbors.inheritedRequires}
                    getMastery={getStudentMastery}
                    onClick={handleSelectGoal}
                    showMastery
                  />

                  <GoalCard goal={currentGoal} masteryValue={0} onMasteryChange={() => { }} showLearnerTools={false} />

                  <NeighborSection
                    title={tExp.contains}
                    emptyLabel={tExp.emptyContains}
                    goals={neighbors.children}
                    getMastery={getStudentMastery}
                    onClick={handleSelectGoal}
                    showMastery
                  />

                  <NeighborSection
                    title={tExp.nextStepsDirect ?? tExp.nextSteps}
                    emptyLabel={tExp.emptyNextSteps}
                    goals={neighbors.directForward}
                    getMastery={getStudentMastery}
                    onClick={handleSelectGoal}
                    highlightForward
                    showMastery
                  />
                  <NeighborSection
                    title={tExp.nextStepsInherited ?? tExp.nextSteps}
                    emptyLabel={tExp.emptyNextStepsInherited ?? tExp.emptyNextSteps}
                    goals={neighbors.inheritedForward}
                    getMastery={getStudentMastery}
                    onClick={handleSelectGoal}
                    highlightForward
                    showMastery
                  />
                  <button onClick={handleAssignToClass} disabled={isAssigning} className={`w-full px-6 py-3 rounded-lg font-medium transition-colors text-white disabled:bg-gray-400 dark:disabled:bg-slate-700 disabled:text-gray-200 dark:disabled:text-slate-500 ${isRemoving ? 'bg-rose-600 hover:bg-rose-500' : 'bg-sky-600 hover:bg-sky-500'}`}>
                    {isAssigning
                        ? (isRemoving ? t.removing : t.assigning)
                      : isRemoving
                        ? interpolateTemplate(t.removeFromPlan, { count: plannedCount })
                        : interpolateTemplate(t.assignToAll, { count: activeClass.students.length })}
                  </button>
                </div>
              )
            })()
          ) : (
            <div className="max-w-2xl mx-auto w-full space-y-6">
              <NeighborSection
                title={tExp.requires}
                emptyLabel={tExp.emptyRequires}
                goals={neighbors.requires}
                getMastery={getStudentMastery}
                onClick={handleSelectGoal}
                showMastery
              />
              <NeighborSection
                title={tExp.inheritedRequires}
                emptyLabel={tExp.emptyInherited}
                goals={neighbors.inheritedRequires}
                getMastery={getStudentMastery}
                onClick={handleSelectGoal}
                showMastery
              />

              <GoalCard goal={currentGoal} masteryValue={getStudentMastery(currentGoal.id)} showLearnerTools />

              <NeighborSection
                title={tExp.contains}
                emptyLabel={tExp.emptyContains}
                goals={neighbors.children}
                getMastery={getStudentMastery}
                onClick={handleSelectGoal}
                showMastery
              />

              <NeighborSection
                title={tExp.nextStepsDirect ?? tExp.nextSteps}
                emptyLabel={tExp.emptyNextSteps}
                goals={neighbors.directForward}
                getMastery={getStudentMastery}
                onClick={handleSelectGoal}
                highlightForward
                showMastery
              />
              <NeighborSection
                title={tExp.nextStepsInherited ?? tExp.nextSteps}
                emptyLabel={tExp.emptyNextStepsInherited ?? tExp.emptyNextSteps}
                goals={neighbors.inheritedForward}
                getMastery={getStudentMastery}
                onClick={handleSelectGoal}
                highlightForward
                showMastery
              />
              {plannedGoals.has(currentGoal.id) && (
                <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-500/30 p-3 rounded-lg flex gap-3 items-center">
                  <div className="text-amber-500 dark:text-amber-400 text-xl">★</div>
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>{t.selectedGoal}:</strong>{' '}
                    {interpolateTemplate(t.goalOnPlan, {
                      name: activeClass.students.find((s) => s.id === currentLearnerId)?.name ?? '',
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-secondary space-y-4">
            <div className="text-6xl opacity-20">🎓</div>
            <p className="text-lg text-center">{t.emptyState.title}<br />{t.emptyState.text.split('\n')[0]}<br />{t.emptyState.text.split('\n')[1]}</p>
          </div>
        )}
      </main>
    </div>
  )
}
