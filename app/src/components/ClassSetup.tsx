import React, { useEffect, useMemo, useState } from 'react'
import type { LandscapeEntry } from '../hooks/useLandscapes'
import type { ClassSession, StudentMapping, TrainerClassCurriculumConfig } from '../trainerTypes'
import {
  applyDefaultGlobalStageScope,
  getGlobalStageScopeSelection,
  GLOBAL_STAGE_SCOPE_CONFIG_IDS,
  GLOBAL_STAGE_SCOPE_OPTIONS,
} from '../utils/personalCurriculumStageScope'

interface ClassSetupProps {
  landscapes: LandscapeEntry[]
  rootLandscapeId?: string
  onSave: (session: ClassSession) => void
  onCancel: () => void
}

const DEFAULT_GYMNASIUM_DE_ROOT_FILTERS = [
  { id: 'ALL', label: 'Alle Bundeslaender' },
  { id: 'DE-BW', label: 'Baden-Wuerttemberg' },
  { id: 'DE-HE', label: 'Hessen' },
  { id: 'DE-BY', label: 'Bayern' },
  { id: 'DE-NI', label: 'Niedersachsen' },
  { id: 'DE-NW', label: 'Nordrhein-Westfalen' },
]

const COMBINED_COURSE_FILTER = { id: 'ALL', label: 'Grund- und Leistungskurs' }

const withCombinedCourseFilter = (filters?: { id: string; label: string }[]) => {
  const effectiveFilters = filters ?? []
  const hasGk = effectiveFilters.some((filter) => filter.id === 'GK')
  const hasLk = effectiveFilters.some((filter) => filter.id === 'LK')
  const hasAll = effectiveFilters.some((filter) => filter.id === 'ALL')

  if (hasGk && hasLk && !hasAll) {
    return [...effectiveFilters, COMBINED_COURSE_FILTER]
  }

  return effectiveFilters
}

const normalizeWildcardFilter = (filterId?: string) => filterId ?? 'ALL'

export const ClassSetup: React.FC<ClassSetupProps> = ({ landscapes, rootLandscapeId, onSave, onCancel }) => {
  const rootLandscape = useMemo(
    () => (rootLandscapeId ? landscapes.find((entry) => entry.meta.landscapeId === rootLandscapeId) ?? null : null),
    [landscapes, rootLandscapeId],
  )
  const subjectLandscapes = useMemo(
    () => landscapes.filter((entry) => entry.meta.landscapeId !== rootLandscapeId),
    [landscapes, rootLandscapeId],
  )

  const [className, setClassName] = useState('')
  const [selectedLandscapeId, setSelectedLandscapeId] = useState(() => {
    const saved = localStorage.getItem('skillpilot_last_landscape')
    return saved && subjectLandscapes.some((entry) => entry.meta.landscapeId === saved)
      ? saved
      : (subjectLandscapes[0]?.meta.landscapeId ?? landscapes[0]?.meta.landscapeId ?? '')
  })
  const effectiveRootFilters = useMemo(() => {
    if (!rootLandscape) return []
    if (rootLandscape.meta.title === 'Gymnasium (DE)' && (!rootLandscape.meta.filters || rootLandscape.meta.filters.length === 0)) {
      return DEFAULT_GYMNASIUM_DE_ROOT_FILTERS
    }
    return rootLandscape.meta.filters ?? []
  }, [rootLandscape])
  const [selectedRootFilter, setSelectedRootFilter] = useState(() => effectiveRootFilters[0]?.id ?? 'ALL')
  const [curriculumConfig, setCurriculumConfig] = useState<TrainerClassCurriculumConfig>(() => applyDefaultGlobalStageScope({}).config)
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL')
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
    () => withCombinedCourseFilter(selectedLandscape?.meta.filters),
    [selectedLandscape],
  )
  const stageSelection = getGlobalStageScopeSelection(curriculumConfig)
  const showCourseProfileControls = stageSelection.sek2Selected && selectedLandscapeFilters.length > 0
  const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
  const toApi = (path: string) => (apiBase ? `${apiBase}${path}` : path)

  useEffect(() => {
    if (!effectiveRootFilters.some((filter) => filter.id === selectedRootFilter)) {
      setSelectedRootFilter(effectiveRootFilters[0]?.id ?? 'ALL')
    }
  }, [effectiveRootFilters, selectedRootFilter])

  useEffect(() => {
    const defaultFilterId = selectedLandscapeFilters[0]?.id ?? 'ALL'
    if (!selectedLandscapeFilters.some((filter) => filter.id === selectedSubjectFilter)) {
      setSelectedSubjectFilter(defaultFilterId)
    }
  }, [selectedLandscapeFilters, selectedSubjectFilter])

  const toggleGlobalStageScope = (stageScopeId: string) => {
    setCurriculumConfig((prev) => {
      const currentSelection = getGlobalStageScopeSelection(prev)
      const isCurrentlySelected = prev[stageScopeId]?.selected ?? true
      const nextSelected = !isCurrentlySelected

      if (!nextSelected) {
        const wouldDisableLastStage =
          (stageScopeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1 && !currentSelection.sek2Selected)
          || (stageScopeId === GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2 && !currentSelection.sek1Selected)
        if (wouldDisableLastStage) {
          return prev
        }
      }

      return {
        ...prev,
        [stageScopeId]: {
          selected: nextSelected,
        },
      }
    })
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedLandscapeId) {
      setError('Bitte waehle zuerst ein Fach aus.')
      return
    }

    setIsGenerating(true)
    setError(null)
    try {
      const names = studentNames
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const students: StudentMapping[] = []
      for (const name of names) {
        try {
          const res = await fetch(toApi('/api/ui/learners'), { method: 'POST' })
          if (!res.ok) throw new Error(`Status ${res.status}`)
          const data = await res.json()
          const id = data.state?.skillpilotId || data.skillpilotId || data.id
          if (!id) throw new Error('Keine SkillPilot-ID erhalten')
          students.push({ name, id: String(id) })
        } catch (err) {
          console.error('Fehler beim Anlegen fuer', name, err)
        }
      }

      const personalConfig: TrainerClassCurriculumConfig = applyDefaultGlobalStageScope({
        ...curriculumConfig,
        ...(rootLandscape
          ? {
              [rootLandscape.meta.landscapeId]: {
                selected: true,
                filterId: normalizeWildcardFilter(selectedRootFilter),
              },
            }
          : {}),
        [selectedLandscapeId]: {
          selected: true,
          filterId: showCourseProfileControls ? normalizeWildcardFilter(selectedSubjectFilter) : undefined,
        },
      }).config

      const newClass: ClassSession = {
        id: crypto.randomUUID(),
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
        rootLandscapeId: rootLandscape?.meta.landscapeId,
        students,
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
      <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-6">Neue Klasse / Kurs anlegen</h2>
      <form onSubmit={handleCreate} className="space-y-6">
        <div>
          <label className="block text-xs uppercase text-text-secondary font-bold mb-1">Bezeichnung</label>
          <input
            required
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="z.B. Physik LK"
            className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary focus:border-sky-500 outline-none transition-colors"
          />
        </div>

        {rootLandscape && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {effectiveRootFilters.length > 0 && (
              <div>
                <label className="block text-xs uppercase text-text-secondary font-bold mb-1">Bundesland</label>
                <select
                  value={selectedRootFilter}
                  onChange={(e) => setSelectedRootFilter(e.target.value)}
                  className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary transition-colors"
                >
                  {effectiveRootFilters.map((filter) => (
                    <option key={filter.id} value={filter.id}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase text-text-secondary font-bold mb-1">Sekundarstufe</label>
              <div className="flex flex-col gap-2 rounded border border-border-color bg-input-bg/40 p-3">
                {GLOBAL_STAGE_SCOPE_OPTIONS.map((option) => {
                  const checked = curriculumConfig[option.id]?.selected ?? true
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
            <label className="block text-xs uppercase text-text-secondary font-bold mb-1">Fach / Landscape</label>
            <select
              value={selectedLandscapeId}
              onChange={(e) => {
                setSelectedLandscapeId(e.target.value)
                localStorage.setItem('skillpilot_last_landscape', e.target.value)
              }}
              className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary transition-colors"
            >
              {subjectLandscapes.map((entry) => (
                <option key={entry.meta.landscapeId} value={entry.meta.landscapeId}>
                  {entry.meta.subject?.trim() || entry.meta.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase text-text-secondary font-bold mb-1">Filter / Niveau</label>
            {showCourseProfileControls ? (
              <select
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
              <div className="w-full bg-input-bg border border-border-color rounded p-2 text-text-secondary">
                {stageSelection.sek2Selected ? 'Kein zusaetzlicher Kursfilter verfuegbar' : 'Kursniveau nur fuer Sekundarstufe II relevant'}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase text-text-secondary font-bold mb-1">Schülerliste (Namen)</label>
          <p className="text-[11px] text-text-secondary mb-2">
            Ein Name pro Zeile oder durch Komma getrennt. Die Zuordnung Name ↔ SkillPilot-ID wird nur lokal gespeichert.
          </p>
          <textarea
            value={studentNames}
            onChange={(e) => setStudentNames(e.target.value)}
            placeholder="Peter&#10;Franz&#10;Simone"
            rows={6}
            className="w-full bg-input-bg border border-border-color rounded p-2 text-text-primary font-mono text-sm transition-colors"
          />
        </div>

        {error && <div className="text-sm text-amber-300">Fehler: {error}</div>}

        <div className="flex justify-end gap-3 pt-4 border-t border-border-color">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors">
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isGenerating}
            className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {isGenerating && <span className="animate-spin">⟳</span>}
            Klasse anlegen &amp; IDs generieren
          </button>
        </div>
      </form>
    </div>
  )
}
