import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CurriculumDropdown } from './CurriculumDropdown'
import { useLanguage } from '../contexts/LanguageContext'
import { useRuntimeCurriculumCatalog } from '../hooks/useRuntimeCurriculumCatalog'
import { useLandscapes, type LandscapeEntry } from '../hooks/useLandscapes'
import type { ClassSession, StudentMapping, TrainerClassCurriculumConfig } from '../trainerTypes'
import {
  getGlobalStageScopeSelection,
  GLOBAL_STAGE_SCOPE_CONFIG_IDS,
  getGlobalStageScopeOptions,
  setGlobalStageScopeSelection,
  synchronizePersonalCurriculumStageScope,
} from '../utils/personalCurriculumStageScope'
import {
  getDurationModelOptions,
  getOfferedGymnasiumDurationModels,
  isGymnasiumSubjectOfferedForStageSelection,
  normalizeOfferedDurationModel,
  resolveCurriculumOfferingSource,
} from '../utils/durationModel'
import { getDisplayCourseProfileFilters, getDisplayFiltersForSelection } from '../utils/filterLabels'
import { isWildcardFilter } from '../utils/goalFilters'
import { normalizeJurisdictionCode } from '../utils/jurisdictionMetadata'
import { getClassSetupCopy } from '../utils/curriculumSetupCopy'
import { isRepositoryGymnasiumFramework } from '../utils/curriculumDisplay'
import type { CurriculumQualityFilter } from '../utils/curriculumQualityTrafficLight'
import {
  buildExistingLearnerClassSession,
  EXISTING_LEARNER_LINKING_ENABLED,
  fetchExistingLearnerProfile,
  getExistingLearnerSubjectIds,
  isExistingLearnerClassSession,
  parseExistingLearnerPersonalConfig,
  resolveExistingLearnerRootLandscapeId,
} from '../utils/existingLearnerClass'
import { getExistingLearnerClassCopy } from '../utils/existingLearnerClassCopy'
import {
  fetchLandscapeClosureEntries,
  landscapeEntriesBelongToRoot,
} from '../utils/landscapeClosure'

interface ClassSetupProps {
  /** Legacy fixture fallback; normal course setup loads its own selected closure. */
  landscapes?: LandscapeEntry[]
  rootLandscapeId?: string
  initialSession?: ClassSession
  onSave: (session: ClassSession) => boolean
  onCancel: () => void
}

const normalizeWildcardFilter = (filterId?: string) => filterId ?? 'ALL'

const getLandscapeRootGoal = (entry: LandscapeEntry | null | undefined) => (
  entry?.goals.find((goal) => goal.tags?.includes('root')) ?? entry?.goals[0]
)

const getDirectChildLandscapeEntries = (
  rootLandscape: LandscapeEntry | null,
  closure: LandscapeEntry[],
): LandscapeEntry[] => {
  if (!rootLandscape) return []
  const landscapeByGoalId = new Map(
    closure.flatMap((entry) => entry.goals.map((goal) => [goal.id, entry] as const)),
  )
  const children: LandscapeEntry[] = []
  const seen = new Set<string>()
  for (const rawGoalId of getLandscapeRootGoal(rootLandscape)?.contains ?? []) {
    const separatorIndex = rawGoalId.indexOf(':')
    const goalId = separatorIndex >= 0 && separatorIndex < rawGoalId.length - 1
      ? rawGoalId.slice(separatorIndex + 1)
      : rawGoalId
    const childLandscape = landscapeByGoalId.get(goalId)
    const childLandscapeId = childLandscape?.meta.landscapeId
    if (
      !childLandscape
      || !childLandscapeId
      || childLandscapeId === rootLandscape.meta.landscapeId
      || seen.has(childLandscapeId)
    ) continue
    children.push(childLandscape)
    seen.add(childLandscapeId)
  }
  return children
}

export const ClassSetup: React.FC<ClassSetupProps> = ({ landscapes = [], rootLandscapeId, initialSession, onSave, onCancel }) => {
  const { language } = useLanguage()
  const localizedLanguage = language === 'en' ? 'en' : 'de'
  const copy = getClassSetupCopy(localizedLanguage)
  const existingCopy = getExistingLearnerClassCopy(localizedLanguage)
  const isEditing = Boolean(initialSession)
  const isEditingExisting = isExistingLearnerClassSession(initialSession)
  const [creationMode, setCreationMode] = useState<'generated' | 'existing'>(
    isEditingExisting ? 'existing' : 'generated',
  )
  const initialRootLandscapeId = initialSession?.rootLandscapeId
    ?? (initialSession ? initialSession.landscapeId : '')
  const [selectedRootLandscapeId, setSelectedRootLandscapeId] = useState(initialRootLandscapeId)
  const [curriculumQualityFilter, setCurriculumQualityFilter] = useState<CurriculumQualityFilter>('green')
  const {
    landscapeEntries: loadedCourseLandscapes,
    loadingLandscapes: loadingCourseLandscapes,
    landscapeError: courseLandscapeError,
  } = useLandscapes(
    selectedRootLandscapeId,
    language,
    { enabled: creationMode === 'generated' && !!selectedRootLandscapeId },
  )
  const {
    landscapeEntries: availableRootLandscapes,
    loadingLandscapes: loadingAvailableRootLandscapes,
  } = useLandscapes(
    undefined,
    language,
    { enabled: creationMode === 'existing' },
  )
  const runtimeCatalogState = useRuntimeCurriculumCatalog()
  const offeringSource = useMemo(
    () => resolveCurriculumOfferingSource(runtimeCatalogState),
    [runtimeCatalogState],
  )
  const courseLandscapes = useMemo(() => {
    if (loadedCourseLandscapes.length > 0) return loadedCourseLandscapes
    if (
      selectedRootLandscapeId
      && landscapes.some((entry) => entry.meta.landscapeId === selectedRootLandscapeId)
    ) return landscapes
    return []
  }, [landscapes, loadedCourseLandscapes, selectedRootLandscapeId])
  const rootLandscape = useMemo(
    () => selectedRootLandscapeId
      ? courseLandscapes.find((entry) => entry.meta.landscapeId === selectedRootLandscapeId) ?? null
      : null,
    [courseLandscapes, selectedRootLandscapeId],
  )
  const directSubjectLandscapes = useMemo(
    () => getDirectChildLandscapeEntries(rootLandscape, courseLandscapes),
    [courseLandscapes, rootLandscape],
  )
  const subjectLandscapes = useMemo(
    () => directSubjectLandscapes.length > 0
      ? directSubjectLandscapes
      : rootLandscape ? [rootLandscape] : [],
    [directSubjectLandscapes, rootLandscape],
  )
  const hasSeparateSubjectSelection = directSubjectLandscapes.length > 0
  const [className, setClassName] = useState(initialSession?.name ?? '')
  const [selectedLandscapeId, setSelectedLandscapeId] = useState(initialSession?.landscapeId ?? '')
  const effectiveRootFilters = useMemo(() => rootLandscape?.meta.filters ?? [], [rootLandscape])
  const [selectedRootFilter, setSelectedRootFilter] = useState(() => (
    (initialRootLandscapeId ? initialSession?.personalConfig?.[initialRootLandscapeId]?.filterId : undefined)
      ?? 'ALL'
  ))
  const [curriculumConfig, setCurriculumConfig] = useState<TrainerClassCurriculumConfig>(() =>
    synchronizePersonalCurriculumStageScope(initialSession?.personalConfig ?? {}, {
      rootLandscapeId: initialRootLandscapeId || undefined,
      landscapeId: initialSession?.landscapeId,
    }).config
  )
  const [selectedDurationModel, setSelectedDurationModel] = useState(() => (
    initialSession?.personalConfig?.[initialSession.landscapeId]?.durationModel
      ?? (initialRootLandscapeId ? initialSession?.personalConfig?.[initialRootLandscapeId]?.durationModel : undefined)
      ?? ''
  ))
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState(() => (
    initialSession?.personalConfig?.[initialSession.landscapeId]?.filterId
      ?? initialSession?.activeFilter
      ?? 'GK+LK'
  ))
  const [studentNames, setStudentNames] = useState('')
  const [learnerAlias, setLearnerAlias] = useState(
    initialSession?.students[0]?.name ?? '',
  )
  const [existingSkillpilotId, setExistingSkillpilotId] = useState(
    isEditingExisting ? initialSession?.students[0]?.id ?? '' : '',
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const operationAbortRef = useRef<AbortController | null>(null)

  const selectedLandscape = useMemo(
    () => subjectLandscapes.find((entry) => entry.meta.landscapeId === selectedLandscapeId)
      ?? courseLandscapes.find((entry) => entry.meta.landscapeId === selectedLandscapeId)
      ?? null,
    [courseLandscapes, selectedLandscapeId, subjectLandscapes],
  )
  const selectedLandscapeFilters = useMemo(
    () => getDisplayCourseProfileFilters(selectedLandscape?.meta.filters, localizedLanguage),
    [localizedLanguage, selectedLandscape],
  )
  const displayRootFilters = useMemo(
    () => getDisplayFiltersForSelection(effectiveRootFilters, localizedLanguage),
    [effectiveRootFilters, localizedLanguage],
  )
  const packageRootLandscape = runtimeCatalogState.mode === 'package'
    ? runtimeCatalogState.catalog.landscapes.find(
      (entry) => entry.landscapeId === selectedRootLandscapeId,
    )
    : undefined
  const isGymnasiumCurriculum = Boolean(
    isRepositoryGymnasiumFramework(rootLandscape?.meta.frameworkId)
    || packageRootLandscape?.schoolForm?.trim().toLocaleLowerCase('de-DE') === 'gymnasium',
  )
  const hasGymnasiumStageSupport = isGymnasiumCurriculum && (
    runtimeCatalogState.mode !== 'package'
    || runtimeCatalogState.catalog.offerings.some((offering) => (
      subjectLandscapes.some((entry) => entry.meta.landscapeId === offering.landscapeId)
      && typeof offering.scope.stage === 'string'
    ))
  )
  const stageSelection = getGlobalStageScopeSelection(curriculumConfig, {
    rootLandscapeId: selectedRootLandscapeId || undefined,
  })
  const shouldRestrictSubjectsToOfferedContent =
    hasGymnasiumStageSupport
    && (stageSelection.sek1Selected || stageSelection.sek2Selected)
    && (
      offeringSource.mode === 'catalog'
        ? offeringSource.catalog.offerings.some(
          (offering) => offering.scope.jurisdiction === selectedRootFilter.trim(),
        )
        : normalizeJurisdictionCode(selectedRootFilter) !== null
    )
  const selectableSubjectLandscapes = useMemo(
    () => shouldRestrictSubjectsToOfferedContent
      ? subjectLandscapes.filter((entry) =>
        isGymnasiumSubjectOfferedForStageSelection(
          entry.meta.landscapeId,
          selectedRootFilter,
          stageSelection,
          offeringSource,
        ),
      )
      : subjectLandscapes,
    [offeringSource, selectedRootFilter, shouldRestrictSubjectsToOfferedContent, stageSelection, subjectLandscapes],
  )
  const stageScopeOptions = useMemo(
    () => getGlobalStageScopeOptions(localizedLanguage),
    [localizedLanguage],
  )
  const offeredDurationModels = useMemo(
    () => hasGymnasiumStageSupport && (stageSelection.sek1Selected || stageSelection.sek2Selected)
      ? getOfferedGymnasiumDurationModels(selectedLandscapeId, selectedRootFilter, offeringSource)
      : [],
    [
      hasGymnasiumStageSupport,
      offeringSource,
      selectedLandscapeId,
      selectedRootFilter,
      stageSelection.sek1Selected,
      stageSelection.sek2Selected,
    ],
  )
  const durationModelOptions = useMemo(
    () => getDurationModelOptions(localizedLanguage, offeredDurationModels),
    [localizedLanguage, offeredDurationModels],
  )
  const normalizedSelectedDurationModel = normalizeOfferedDurationModel(selectedDurationModel, offeredDurationModels)
  const showCourseProfileControls =
    selectedLandscapeFilters.length > 0
    && (
      !hasGymnasiumStageSupport
      || !stageSelection.sek1Selected
      || stageSelection.sek2Selected
    )
  const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
  const toApi = (path: string) => (apiBase ? `${apiBase}${path}` : path)

  useEffect(() => () => {
    operationAbortRef.current?.abort()
    operationAbortRef.current = null
  }, [])

  useEffect(() => {
    if (!rootLandscape) return
    if (!displayRootFilters.some((filter) => filter.id === selectedRootFilter)) {
      setSelectedRootFilter(displayRootFilters[0]?.id ?? 'ALL')
    }
  }, [displayRootFilters, rootLandscape, selectedRootFilter])

  useEffect(() => {
    if (loadingCourseLandscapes || !rootLandscape) return
    const defaultFilterId = selectedLandscapeFilters[0]?.id ?? 'ALL'
    if (!selectedLandscapeFilters.some((filter) => filter.id === selectedSubjectFilter)) {
      setSelectedSubjectFilter(defaultFilterId)
    }
  }, [loadingCourseLandscapes, rootLandscape, selectedLandscapeFilters, selectedSubjectFilter])

  useEffect(() => {
    if (selectableSubjectLandscapes.length === 0) return
    if (!selectableSubjectLandscapes.some((entry) => entry.meta.landscapeId === selectedLandscapeId)) {
      const nextLandscapeId = selectableSubjectLandscapes[0]?.meta.landscapeId ?? ''
      setSelectedLandscapeId(nextLandscapeId)
    }
  }, [selectableSubjectLandscapes, selectedLandscapeId])

  useEffect(() => {
    if (!hasGymnasiumStageSupport || offeringSource.mode === 'unavailable') return
    const normalized = normalizeOfferedDurationModel(selectedDurationModel, offeredDurationModels)
    if (normalized !== selectedDurationModel) {
      setSelectedDurationModel(normalized ?? '')
    }
  }, [hasGymnasiumStageSupport, offeredDurationModels, offeringSource.mode, selectedDurationModel])

  const toggleGlobalStageScope = (stageScopeId: string) => {
    setCurriculumConfig((prev) => {
      const currentSelection = getGlobalStageScopeSelection(prev, {
        rootLandscapeId: selectedRootLandscapeId || undefined,
      })
      const isCurrentlySelected = stageScopeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1
        ? currentSelection.sek1Selected
        : currentSelection.sek2Selected
      const nextSelected = !isCurrentlySelected

      if (!nextSelected) {
        const wouldDisableLastStage =
          (stageScopeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1 && !currentSelection.sek2Selected)
          || (stageScopeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2 && !currentSelection.sek1Selected)
        if (wouldDisableLastStage) {
          return prev
        }
      }

      return setGlobalStageScopeSelection(
        prev,
        {
          sek1Selected: stageScopeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1
            ? nextSelected
            : currentSelection.sek1Selected,
          sek2Selected: stageScopeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2
            ? nextSelected
            : currentSelection.sek2Selected,
        },
        { rootLandscapeId: selectedRootLandscapeId || undefined },
      )
    })
  }

  const handleRootCurriculumSelect = (landscapeId: string) => {
    if (isEditing) return
    setSelectedRootLandscapeId(landscapeId)
    setSelectedLandscapeId('')
    setSelectedRootFilter('ALL')
    setSelectedSubjectFilter('GK+LK')
    setSelectedDurationModel('')
    setCurriculumConfig({})
    setError(null)
  }

  const handleCreateExisting = async (signal: AbortSignal) => {
    try {
      const profile = await fetchExistingLearnerProfile(existingSkillpilotId, signal)
      const personalConfig = parseExistingLearnerPersonalConfig(profile.personalCurriculum)
      const resolvedRootLandscapeId = resolveExistingLearnerRootLandscapeId({
        profile,
        personalConfig,
        existingRootLandscapeId: isEditingExisting ? initialSession?.rootLandscapeId : undefined,
        fallbackRootLandscapeId: rootLandscapeId,
        availableRootLandscapeIds: [
          ...availableRootLandscapes.map((entry) => (
            entry.meta.landscapeId
            || (entry.meta as typeof entry.meta & { curriculumId?: string }).curriculumId
            || ''
          )).filter(Boolean),
          ...landscapes
            .filter((entry) => entry.meta.landscapeId === rootLandscapeId)
            .map((entry) => entry.meta.landscapeId),
        ],
      })
      const configuredSubjectIds = getExistingLearnerSubjectIds(
        personalConfig,
        [],
        resolvedRootLandscapeId,
      )
      const providedLandscapeIds = new Set(
        landscapes.map((entry) => entry.meta.landscapeId),
      )
      const providedLandscapesAreComplete = landscapeEntriesBelongToRoot(
        landscapes,
        resolvedRootLandscapeId,
      ) && configuredSubjectIds.every((landscapeId) => providedLandscapeIds.has(landscapeId))
      const existingLearnerLandscapes = providedLandscapesAreComplete
        ? landscapes
        : await fetchLandscapeClosureEntries(resolvedRootLandscapeId, language, signal)
      if (signal.aborted) return
      const session = buildExistingLearnerClassSession({
        className,
        learnerAlias,
        profile,
        landscapes: existingLearnerLandscapes,
        rootLandscapeId: resolvedRootLandscapeId,
        existing: isEditingExisting ? initialSession : undefined,
      })
      if (signal.aborted) return
      if (!onSave(session)) throw new Error('local-save-failed')
    } catch (nextError) {
      if (signal.aborted || (nextError instanceof Error && nextError.name === 'AbortError')) return
      const message = nextError instanceof Error ? nextError.message : ''
      if (message === 'learner-not-found') setError(existingCopy.learnerNotFound)
      else if (message === 'missing-personalized-subjects') setError(existingCopy.noSubjects)
      else if (
        message === 'invalid-personal-curriculum'
        || message === 'missing-personal-curriculum'
        || message === 'invalid-learner-profile'
      ) setError(existingCopy.invalidProfile)
      else setError(existingCopy.profileUnavailable)
    }
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (creationMode === 'existing') {
      operationAbortRef.current?.abort()
      const controller = new AbortController()
      operationAbortRef.current = controller
      setIsGenerating(true)
      setError(null)
      try {
        await handleCreateExisting(controller.signal)
      } finally {
        if (operationAbortRef.current === controller) {
          operationAbortRef.current = null
          if (!controller.signal.aborted) setIsGenerating(false)
        }
      }
      return
    }
    if (!selectedRootLandscapeId || loadingCourseLandscapes || courseLandscapeError || !rootLandscape) {
      setError(copy.curriculumUnavailable)
      return
    }
    if (hasGymnasiumStageSupport && !stageSelection.sek1Selected && !stageSelection.sek2Selected) {
      setError(copy.selectStageFirst)
      return
    }
    if (!selectedLandscapeId || !selectableSubjectLandscapes.some((entry) => entry.meta.landscapeId === selectedLandscapeId)) {
      setError(copy.selectSubjectFirst)
      return
    }

    operationAbortRef.current?.abort()
    const controller = new AbortController()
    operationAbortRef.current = controller
    setIsGenerating(true)
    setError(null)
    try {
      const names = studentNames
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const students: StudentMapping[] = initialSession ? initialSession.students : []
      if (!initialSession) {
        for (const name of names) {
          try {
            const res = await fetch(toApi('/api/ui/learners'), {
              method: 'POST',
              signal: controller.signal,
            })
            if (!res.ok) throw new Error(copy.createLearnerFailedStatus(res.status))
            const data = await res.json()
            const id = data.state?.skillpilotId || data.skillpilotId || data.id
            if (!id) throw new Error(copy.missingSkillpilotId)
            students.push({ name, id: String(id) })
          } catch (err) {
            if (controller.signal.aborted) throw err
            console.error('Failed to create learner for', name, err)
            throw err instanceof Error ? err : new Error(copy.createLearnerFailedGeneric)
          }
        }
      }

      const allowedConfigIds = new Set([
        ...courseLandscapes.map((entry) => entry.meta.landscapeId),
        GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1,
        GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2,
      ])
      const nextCurriculumConfig: TrainerClassCurriculumConfig = Object.fromEntries(
        Object.entries(curriculumConfig).filter(([configId]) => allowedConfigIds.has(configId)),
      )
      subjectLandscapes.forEach((entry) => {
        if (
          entry.meta.landscapeId !== selectedLandscapeId
          && nextCurriculumConfig[entry.meta.landscapeId]?.selected
        ) {
          nextCurriculumConfig[entry.meta.landscapeId] = {
            ...nextCurriculumConfig[entry.meta.landscapeId],
            selected: false,
          }
        }
      })

      const nextSubjectConfig = {
        ...nextCurriculumConfig[selectedLandscapeId],
        selected: true,
      }
      if (showCourseProfileControls) {
        nextSubjectConfig.filterId = normalizeWildcardFilter(selectedSubjectFilter)
      } else {
        delete nextSubjectConfig.filterId
      }
      if (normalizedSelectedDurationModel) {
        nextSubjectConfig.durationModel = normalizedSelectedDurationModel
      } else {
        delete nextSubjectConfig.durationModel
      }

      const nextRootConfig = {
        ...nextCurriculumConfig[selectedRootLandscapeId],
        selected: true,
        ...(hasSeparateSubjectSelection && effectiveRootFilters.length > 0
          ? { filterId: normalizeWildcardFilter(selectedRootFilter) }
          : {}),
      }
      const personalConfigBase: TrainerClassCurriculumConfig = {
        ...nextCurriculumConfig,
        [selectedRootLandscapeId]: nextRootConfig,
        [selectedLandscapeId]: selectedLandscapeId === selectedRootLandscapeId
          ? { ...nextRootConfig, ...nextSubjectConfig, selected: true }
          : nextSubjectConfig,
      }
      const personalConfig: TrainerClassCurriculumConfig = hasGymnasiumStageSupport
        ? synchronizePersonalCurriculumStageScope(
          personalConfigBase,
          { rootLandscapeId: selectedRootLandscapeId },
        ).config
        : personalConfigBase
      const storedRootFilter = hasSeparateSubjectSelection && effectiveRootFilters.length > 0
        ? normalizeWildcardFilter(selectedRootFilter)
        : 'ALL'
      const storedSubjectFilter = showCourseProfileControls
        ? normalizeWildcardFilter(selectedSubjectFilter)
        : 'ALL'
      const activeFilter = !isWildcardFilter(storedRootFilter)
        ? storedRootFilter
        : !isWildcardFilter(storedSubjectFilter)
          ? storedSubjectFilter
          : 'all'

      const newClass: ClassSession = {
        ...initialSession,
        id: initialSession?.id ?? crypto.randomUUID(),
        name: className,
        landscapeId: selectedLandscapeId,
        activeFilter,
        personalConfig,
        rootLandscapeId: selectedRootLandscapeId,
        students,
        currentGoalId: initialSession?.landscapeId === selectedLandscapeId
          ? initialSession.currentGoalId
          : undefined,
      }
      if (controller.signal.aborted) return
      onSave(newClass)
    } catch (err) {
      if (controller.signal.aborted || (err instanceof Error && err.name === 'AbortError')) return
      setError((err as Error).message)
    } finally {
      if (operationAbortRef.current === controller) {
        operationAbortRef.current = null
        if (!controller.signal.aborted) setIsGenerating(false)
      }
    }
  }

  const handleCancel = () => {
    operationAbortRef.current?.abort()
    operationAbortRef.current = null
    onCancel()
  }

  return (
    <div className="max-w-4xl w-full mx-auto bg-sidebar-bg p-8 rounded-xl border border-border-color shadow-xl transition-colors">
      <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-6">
        {isEditing ? copy.editTitle : copy.title}
      </h2>
      <form onSubmit={handleCreate} className="space-y-6">
        {!isEditing && EXISTING_LEARNER_LINKING_ENABLED && (
          <fieldset>
            <legend className="block text-xs uppercase text-text-secondary font-bold mb-2">
              {existingCopy.createModeLabel}
            </legend>
            <div className="grid gap-3 md:grid-cols-2">
              {([
                ['generated', existingCopy.generatedMode, existingCopy.generatedModeHint],
                ['existing', existingCopy.existingMode, existingCopy.existingModeHint],
              ] as const).map(([mode, label, hint]) => (
                <label
                  key={mode}
                  className={`cursor-pointer rounded-xl border p-4 transition-colors ${creationMode === mode ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30' : 'border-border-color hover:border-sky-300'}`}
                >
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="trainer-class-creation-mode"
                      value={mode}
                      checked={creationMode === mode}
                      onChange={() => {
                        setCreationMode(mode)
                        setError(null)
                      }}
                      className="mt-1 h-4 w-4 text-sky-600"
                    />
                    <span>
                      <span className="block font-semibold text-text-primary">{label}</span>
                      <span className="mt-1 block text-xs leading-5 text-text-secondary">{hint}</span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {creationMode === 'generated' && (
          <section className="rounded-xl border border-sky-200 bg-sky-50/60 p-5 dark:border-sky-900/60 dark:bg-sky-950/20">
            <label
              htmlFor="trainer-class-root-curriculum"
              className="block font-semibold text-text-primary"
            >
              {copy.curriculumTitle}
            </label>
            <p className="mb-4 mt-1 text-xs leading-5 text-text-secondary">
              {isEditing ? copy.curriculumLockedHint : copy.curriculumHint}
            </p>
            <CurriculumDropdown
              selectId="trainer-class-root-curriculum"
              currentLandscapeId={selectedRootLandscapeId}
              onSelect={handleRootCurriculumSelect}
              qualityFilter={curriculumQualityFilter}
              onQualityFilterChange={setCurriculumQualityFilter}
              disabled={isEditing}
              showCompatibilityViews={false}
              showQualityFilter
            />
            {loadingCourseLandscapes && (
              <p className="mt-3 text-xs text-text-secondary" role="status">
                {copy.curriculumLoading}
              </p>
            )}
            {selectedRootLandscapeId && courseLandscapeError && (
              <p className="mt-3 text-xs font-semibold text-rose-600 dark:text-rose-300" role="alert">
                {copy.curriculumUnavailable}
              </p>
            )}
          </section>
        )}

        <div>
          <label htmlFor="trainer-class-name" className="block text-xs uppercase text-text-secondary font-bold mb-1">{copy.classNameLabel}</label>
          <input
            id="trainer-class-name"
            required
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder={copy.classNamePlaceholder}
            className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary focus:border-sky-500 outline-none transition-colors"
          />
        </div>

        {creationMode === 'existing' && (
          <div className="space-y-5 rounded-xl border border-sky-200 bg-sky-50/70 p-5 dark:border-sky-900/60 dark:bg-sky-950/20">
            {isEditingExisting && (
              <p className="text-sm leading-6 text-text-secondary">{existingCopy.editHint}</p>
            )}
            <div>
              <label htmlFor="trainer-existing-learner-alias" className="block text-xs uppercase text-text-secondary font-bold mb-1">
                {existingCopy.learnerAliasLabel}
              </label>
              <input
                id="trainer-existing-learner-alias"
                required
                value={learnerAlias}
                onChange={(event) => setLearnerAlias(event.target.value)}
                placeholder={existingCopy.learnerAliasPlaceholder}
                className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary focus:border-sky-500 outline-none"
              />
              <p className="mt-1 text-[11px] text-text-secondary">{existingCopy.learnerAliasHint}</p>
            </div>
            <div>
              <label htmlFor="trainer-existing-skillpilot-id" className="block text-xs uppercase text-text-secondary font-bold mb-1">
                {existingCopy.learnerIdLabel}
              </label>
              <input
                id="trainer-existing-skillpilot-id"
                required
                readOnly={isEditingExisting}
                autoComplete="off"
                maxLength={80}
                value={existingSkillpilotId}
                onChange={(event) => setExistingSkillpilotId(event.target.value)}
                placeholder={existingCopy.learnerIdPlaceholder}
                className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary font-mono focus:border-sky-500 outline-none read-only:opacity-70"
              />
              <p className="mt-1 text-[11px] text-text-secondary">{existingCopy.learnerIdHint}</p>
            </div>
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-100">
              <p className="font-semibold">{existingCopy.fullAccessWarningTitle}</p>
              <p className="mt-1">{existingCopy.fullAccessWarning}</p>
            </div>
          </div>
        )}

        {creationMode === 'generated' && rootLandscape && (
          (hasSeparateSubjectSelection && effectiveRootFilters.length > 0)
          || hasGymnasiumStageSupport
        ) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hasSeparateSubjectSelection && effectiveRootFilters.length > 0 && (
              <div>
                <label htmlFor="trainer-class-root-filter" className="block text-xs uppercase text-text-secondary font-bold mb-1">{copy.rootFilterLabel}</label>
                <select
                  id="trainer-class-root-filter"
                  value={selectedRootFilter}
                  onChange={(e) => setSelectedRootFilter(e.target.value)}
                  className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary transition-colors"
                >
                  {displayRootFilters.map((filter) => (
                    <option key={filter.id} value={filter.id}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {hasGymnasiumStageSupport && <div>
              <label className="block text-xs uppercase text-text-secondary font-bold mb-1">{copy.stageLabel}</label>
              <div className="flex flex-col gap-2 rounded border border-border-color bg-input-bg/40 p-3">
                {stageScopeOptions.map((option) => {
                  const checked = option.id === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1
                    ? stageSelection.sek1Selected
                    : stageSelection.sek2Selected
                  return (
                    <label key={option.id} className="flex items-center gap-2 text-text-primary">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleGlobalStageScope(option.id)}
                        className="w-4 h-4 rounded border-border-color bg-input-bg text-sky-500 focus:ring-sky-500"
                      />
                      <span>{option.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>}

          </div>
        )}

        {creationMode === 'generated' && rootLandscape && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hasSeparateSubjectSelection && <div>
            <label htmlFor="trainer-class-landscape" className="block text-xs uppercase text-text-secondary font-bold mb-1">{copy.landscapeLabel}</label>
            <select
              id="trainer-class-landscape"
              value={selectedLandscapeId}
              onChange={(e) => setSelectedLandscapeId(e.target.value)}
              className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary transition-colors"
            >
              {selectableSubjectLandscapes.map((entry) => (
                <option key={entry.meta.landscapeId} value={entry.meta.landscapeId}>
                  {entry.meta.subject?.trim() || entry.meta.title}
                </option>
              ))}
            </select>
          </div>}

          {(showCourseProfileControls || hasGymnasiumStageSupport) && <div>
            <label htmlFor="trainer-class-level-filter" className="block text-xs uppercase text-text-secondary font-bold mb-1">{copy.levelFilterLabel}</label>
            {showCourseProfileControls ? (
              <select
                id="trainer-class-level-filter"
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary transition-colors"
              >
                {selectedLandscapeFilters.map((filter) => (
                  <option key={filter.id} value={filter.id}>
                    {filter.label}
                  </option>
                ))}
              </select>
            ) : hasGymnasiumStageSupport ? (
              <div id="trainer-class-level-filter" className="w-full bg-input-bg border border-border-color rounded p-2 text-text-secondary">
                {stageSelection.sek2Selected ? copy.noAdditionalCourseFilter : copy.courseFilterOnlySek2}
              </div>
            ) : null}
          </div>}

          {durationModelOptions.length > 0 && (
            <div>
              <label className="block text-xs uppercase text-text-secondary font-bold mb-1">{copy.durationModelLabel}</label>
              <div className="flex flex-col gap-2 rounded border border-border-color bg-input-bg/40 p-3">
                <p className="text-xs text-text-secondary">{copy.durationModelHint}</p>
                {durationModelOptions.map((option) => {
                  const checked = normalizedSelectedDurationModel === option.id
                  return (
                    <label key={option.id} className="flex items-start gap-2 text-text-primary">
                      <input
                        type="radio"
                        name="class-duration-model"
                        checked={checked}
                        onChange={() => setSelectedDurationModel(option.id)}
                        className="mt-0.5 w-4 h-4 border-border-color bg-input-bg text-sky-500 focus:ring-sky-500"
                      />
                      <span className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-text-secondary">{option.description}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>}

        {!isEditing && creationMode === 'generated' && (
          <div>
            <label htmlFor="trainer-class-students" className="block text-xs uppercase text-text-secondary font-bold mb-1">{copy.studentsLabel}</label>
            <p className="text-[11px] text-text-secondary mb-2">
              {copy.studentsHint}
            </p>
            <textarea
              id="trainer-class-students"
              value={studentNames}
              onChange={(e) => setStudentNames(e.target.value)}
              placeholder={copy.studentsPlaceholder}
              rows={6}
              className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary font-mono text-sm transition-colors"
            />
          </div>
        )}

        {error && <div className="text-sm text-amber-300">{copy.errorPrefix}: {error}</div>}

        <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
          <button type="button" onClick={handleCancel} className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors">
            {copy.cancel}
          </button>
          <button
            type="submit"
            disabled={
              isGenerating
              || (creationMode === 'generated' && (
                !selectedRootLandscapeId
                || loadingCourseLandscapes
                || !!courseLandscapeError
                || !rootLandscape
              ))
              || (creationMode === 'existing'
                && loadingAvailableRootLandscapes
                && !initialSession?.rootLandscapeId
                && !rootLandscapeId)
            }
            className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {isGenerating && <span className="animate-spin">⟳</span>}
            {isEditing
              ? isEditingExisting ? existingCopy.update : copy.submitEdit
              : creationMode === 'existing'
                ? existingCopy.create
                : copy.submit}
          </button>
        </div>
      </form>
    </div>
  )
}
