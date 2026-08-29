import React, { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useRuntimeCurriculumCatalog } from '../hooks/useRuntimeCurriculumCatalog'
import type { LandscapeEntry } from '../hooks/useLandscapes'
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
import { normalizeJurisdictionCode } from '../utils/jurisdictionMetadata'
import { getClassSetupCopy } from '../utils/curriculumSetupCopy'

interface ClassSetupProps {
  landscapes: LandscapeEntry[]
  rootLandscapeId?: string
  initialSession?: ClassSession
  onSave: (session: ClassSession) => void
  onCancel: () => void
}

const normalizeWildcardFilter = (filterId?: string) => filterId ?? 'ALL'

export const ClassSetup: React.FC<ClassSetupProps> = ({ landscapes, rootLandscapeId, initialSession, onSave, onCancel }) => {
  const { language } = useLanguage()
  const localizedLanguage = language === 'en' ? 'en' : 'de'
  const copy = getClassSetupCopy(localizedLanguage)
  const runtimeCatalogState = useRuntimeCurriculumCatalog()
  const offeringSource = useMemo(
    () => resolveCurriculumOfferingSource(runtimeCatalogState),
    [runtimeCatalogState],
  )
  const rootLandscape = useMemo(
    () => (rootLandscapeId ? landscapes.find((entry) => entry.meta.landscapeId === rootLandscapeId) ?? null : null),
    [landscapes, rootLandscapeId],
  )
  const subjectLandscapes = useMemo(
    () => landscapes.filter((entry) => entry.meta.landscapeId !== rootLandscapeId),
    [landscapes, rootLandscapeId],
  )

  const isEditing = Boolean(initialSession)
  const [className, setClassName] = useState(initialSession?.name ?? '')
  const [selectedLandscapeId, setSelectedLandscapeId] = useState(() => {
    if (
      initialSession?.landscapeId
      && subjectLandscapes.some((entry) => entry.meta.landscapeId === initialSession.landscapeId)
    ) {
      return initialSession.landscapeId
    }
    const saved = localStorage.getItem('skillpilot_last_landscape')
    return saved && subjectLandscapes.some((entry) => entry.meta.landscapeId === saved)
      ? saved
      : (subjectLandscapes[0]?.meta.landscapeId ?? landscapes[0]?.meta.landscapeId ?? '')
  })
  const effectiveRootFilters = useMemo(() => rootLandscape?.meta.filters ?? [], [rootLandscape])
  const [selectedRootFilter, setSelectedRootFilter] = useState(() => (
    (rootLandscapeId ? initialSession?.personalConfig?.[rootLandscapeId]?.filterId : undefined)
      ?? getDisplayFiltersForSelection(rootLandscape?.meta.filters ?? [], localizedLanguage)[0]?.id
      ?? 'ALL'
  ))
  const [curriculumConfig, setCurriculumConfig] = useState<TrainerClassCurriculumConfig>(() =>
    synchronizePersonalCurriculumStageScope(initialSession?.personalConfig ?? {}, {
      rootLandscapeId,
      landscapeId: initialSession?.landscapeId,
    }).config
  )
  const [selectedDurationModel, setSelectedDurationModel] = useState(() => (
    initialSession?.personalConfig?.[initialSession.landscapeId]?.durationModel
      ?? (rootLandscapeId ? initialSession?.personalConfig?.[rootLandscapeId]?.durationModel : undefined)
      ?? ''
  ))
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState(() => (
    initialSession?.personalConfig?.[initialSession.landscapeId]?.filterId
      ?? initialSession?.activeFilter
      ?? 'GK+LK'
  ))
  const [studentNames, setStudentNames] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedLandscape = useMemo(
    () => subjectLandscapes.find((entry) => entry.meta.landscapeId === selectedLandscapeId)
      ?? landscapes.find((entry) => entry.meta.landscapeId === selectedLandscapeId)
      ?? null,
    [landscapes, selectedLandscapeId, subjectLandscapes],
  )
  const selectedLandscapeFilters = useMemo(
    () => getDisplayCourseProfileFilters(selectedLandscape?.meta.filters, localizedLanguage),
    [localizedLanguage, selectedLandscape],
  )
  const displayRootFilters = useMemo(
    () => getDisplayFiltersForSelection(effectiveRootFilters, localizedLanguage),
    [effectiveRootFilters, localizedLanguage],
  )
  const stageSelection = getGlobalStageScopeSelection(curriculumConfig, {
    rootLandscapeId,
  })
  const shouldRestrictSubjectsToOfferedContent =
    Boolean(rootLandscape)
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
    () => (stageSelection.sek1Selected || stageSelection.sek2Selected)
      ? getOfferedGymnasiumDurationModels(selectedLandscapeId, selectedRootFilter, offeringSource)
      : [],
    [
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
    (!stageSelection.sek1Selected || stageSelection.sek2Selected)
    && selectedLandscapeFilters.length > 0
  const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
  const toApi = (path: string) => (apiBase ? `${apiBase}${path}` : path)

  useEffect(() => {
    if (!displayRootFilters.some((filter) => filter.id === selectedRootFilter)) {
      setSelectedRootFilter(displayRootFilters[0]?.id ?? 'ALL')
    }
  }, [displayRootFilters, selectedRootFilter])

  useEffect(() => {
    const defaultFilterId = selectedLandscapeFilters[0]?.id ?? 'ALL'
    if (!selectedLandscapeFilters.some((filter) => filter.id === selectedSubjectFilter)) {
      setSelectedSubjectFilter(defaultFilterId)
    }
  }, [selectedLandscapeFilters, selectedSubjectFilter])

  useEffect(() => {
    if (selectableSubjectLandscapes.length === 0) return
    if (!selectableSubjectLandscapes.some((entry) => entry.meta.landscapeId === selectedLandscapeId)) {
      const nextLandscapeId = selectableSubjectLandscapes[0]?.meta.landscapeId ?? ''
      setSelectedLandscapeId(nextLandscapeId)
      if (nextLandscapeId) {
        localStorage.setItem('skillpilot_last_landscape', nextLandscapeId)
      }
    }
  }, [selectableSubjectLandscapes, selectedLandscapeId])

  useEffect(() => {
    if (offeringSource.mode === 'unavailable') return
    const normalized = normalizeOfferedDurationModel(selectedDurationModel, offeredDurationModels)
    if (normalized !== selectedDurationModel) {
      setSelectedDurationModel(normalized ?? '')
    }
  }, [offeredDurationModels, offeringSource.mode, selectedDurationModel])

  const toggleGlobalStageScope = (stageScopeId: string) => {
    setCurriculumConfig((prev) => {
      const currentSelection = getGlobalStageScopeSelection(prev, {
        rootLandscapeId,
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
        { rootLandscapeId },
      )
    })
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (rootLandscape && !stageSelection.sek1Selected && !stageSelection.sek2Selected) {
      setError(copy.selectStageFirst)
      return
    }
    if (!selectedLandscapeId || !selectableSubjectLandscapes.some((entry) => entry.meta.landscapeId === selectedLandscapeId)) {
      setError(copy.selectSubjectFirst)
      return
    }

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
            const res = await fetch(toApi('/api/ui/learners'), { method: 'POST' })
            if (!res.ok) throw new Error(copy.createLearnerFailedStatus(res.status))
            const data = await res.json()
            const id = data.state?.skillpilotId || data.skillpilotId || data.id
            if (!id) throw new Error(copy.missingSkillpilotId)
            students.push({ name, id: String(id) })
          } catch (err) {
            console.error('Failed to create learner for', name, err)
            throw err instanceof Error ? err : new Error(copy.createLearnerFailedGeneric)
          }
        }
      }

      const nextCurriculumConfig: TrainerClassCurriculumConfig = { ...curriculumConfig }
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

      const personalConfig: TrainerClassCurriculumConfig = synchronizePersonalCurriculumStageScope({
        ...nextCurriculumConfig,
        ...(rootLandscape
          ? {
              [rootLandscape.meta.landscapeId]: {
                ...nextCurriculumConfig[rootLandscape.meta.landscapeId],
                selected: true,
                filterId: normalizeWildcardFilter(selectedRootFilter),
              },
            }
          : {}),
        [selectedLandscapeId]: nextSubjectConfig,
      }, { rootLandscapeId }).config

      const newClass: ClassSession = {
        ...initialSession,
        id: initialSession?.id ?? crypto.randomUUID(),
        name: className,
        landscapeId: selectedLandscapeId,
        activeFilter: rootLandscape
          ? normalizeWildcardFilter(selectedRootFilter).toLowerCase() === 'all'
            ? 'all'
            : normalizeWildcardFilter(selectedRootFilter)
          : showCourseProfileControls && normalizeWildcardFilter(selectedSubjectFilter).toLowerCase() !== 'all'
            ? normalizeWildcardFilter(selectedSubjectFilter)
            : 'all',
        personalConfig,
        rootLandscapeId: rootLandscape?.meta.landscapeId ?? initialSession?.rootLandscapeId,
        students,
        currentGoalId: initialSession?.landscapeId === selectedLandscapeId
          ? initialSession.currentGoalId
          : undefined,
      }
      onSave(newClass)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl w-full mx-auto bg-sidebar-bg p-8 rounded-xl border border-border-color shadow-xl transition-colors">
      <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-6">
        {isEditing ? copy.editTitle : copy.title}
      </h2>
      <form onSubmit={handleCreate} className="space-y-6">
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

        {rootLandscape && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {effectiveRootFilters.length > 0 && (
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

            <div>
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
            </div>

          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="trainer-class-landscape" className="block text-xs uppercase text-text-secondary font-bold mb-1">{copy.landscapeLabel}</label>
            <select
              id="trainer-class-landscape"
              value={selectedLandscapeId}
              onChange={(e) => {
                setSelectedLandscapeId(e.target.value)
                localStorage.setItem('skillpilot_last_landscape', e.target.value)
              }}
              className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary transition-colors"
            >
              {selectableSubjectLandscapes.map((entry) => (
                <option key={entry.meta.landscapeId} value={entry.meta.landscapeId}>
                  {entry.meta.subject?.trim() || entry.meta.title}
                </option>
              ))}
            </select>
          </div>

          <div>
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
            ) : (
              <div id="trainer-class-level-filter" className="w-full bg-input-bg border border-border-color rounded p-2 text-text-secondary">
                {stageSelection.sek2Selected ? copy.noAdditionalCourseFilter : copy.courseFilterOnlySek2}
              </div>
            )}
          </div>

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
        </div>

        {!isEditing && (
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
          <button type="button" onClick={onCancel} className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors">
            {copy.cancel}
          </button>
          <button
            type="submit"
            disabled={isGenerating}
            className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {isGenerating && <span className="animate-spin">⟳</span>}
            {isEditing ? copy.submitEdit : copy.submit}
          </button>
        </div>
      </form>
    </div>
  )
}
