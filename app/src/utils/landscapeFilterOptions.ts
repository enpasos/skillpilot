import type { UiGoal } from '../goalTypes'
import type { GoalPlacement, LandscapeFilter } from '../landscapeTypes'
import { formatFilterValueLabel, getDisplayFiltersForSelection, type LabelLanguage } from './filterLabels'
import { normalizeJurisdictionCode } from './jurisdictionMetadata'

const CANONICAL_DE_FILTER_ID = 'ALL'

const addFilter = (
  filtersById: Map<string, { id: string; label?: string }>,
  filter: { id?: string; label?: string } | undefined,
) => {
  const rawId = filter?.id?.trim()
  if (!rawId) return
  const id = rawId.toUpperCase() === CANONICAL_DE_FILTER_ID ? CANONICAL_DE_FILTER_ID : rawId
  if (filtersById.has(id)) return
  filtersById.set(id, { id, label: filter?.label })
}

const collectJurisdictionFilters = (
  goals: Pick<UiGoal, 'applicability' | 'tags'>[],
  goalPlacements?: GoalPlacement[],
) => {
  const jurisdictions = new Set<string>()

  goals.forEach((goal) => {
    ;(goal.applicability?.jurisdiction ?? []).forEach((value) => {
      const jurisdiction = normalizeJurisdictionCode(value)
      if (jurisdiction) jurisdictions.add(jurisdiction)
    })
    ;(goal.tags ?? []).forEach((value) => {
      const jurisdiction = normalizeJurisdictionCode(value)
      if (jurisdiction) jurisdictions.add(jurisdiction)
    })
  })

  ;(goalPlacements ?? []).forEach((placement) => {
    const jurisdiction = normalizeJurisdictionCode(placement.context?.jurisdiction)
    if (jurisdiction) jurisdictions.add(jurisdiction)
  })

  return jurisdictions
}

export const getDisplayFiltersForLandscapeSelection = ({
  filters,
  goals,
  goalPlacements,
  language,
}: {
  filters?: LandscapeFilter[]
  goals: Pick<UiGoal, 'applicability' | 'tags'>[]
  goalPlacements?: GoalPlacement[]
  language: LabelLanguage
}) => {
  const filtersById = new Map<string, { id: string; label?: string }>()
  ;(filters ?? []).forEach((filter) => addFilter(filtersById, filter))

  const jurisdictionFilters = collectJurisdictionFilters(goals, goalPlacements)
  if (jurisdictionFilters.size > 0) {
    addFilter(filtersById, {
      id: CANONICAL_DE_FILTER_ID,
      label: language === 'de' ? 'Kanonische DE-Sicht' : 'Canonical DE View',
    })
    jurisdictionFilters.forEach((jurisdiction) => {
      addFilter(filtersById, {
        id: jurisdiction,
        label: formatFilterValueLabel(jurisdiction, language),
      })
    })
  }

  return getDisplayFiltersForSelection(Array.from(filtersById.values()), language)
}
