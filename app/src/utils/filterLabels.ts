export type LabelLanguage = 'de' | 'en'

import { JURISDICTION_LABELS, normalizeJurisdictionCode } from './jurisdictionMetadata'

const APPLICABILITY_DIMENSION_LABELS: Record<string, { de: string; en: string }> = {
  jurisdiction: { de: 'Bundesland', en: 'Jurisdiction' },
  courseLevel: { de: 'Kursniveau', en: 'Course level' },
  gradeBand: { de: 'Jahrgangsband', en: 'Grade band' },
  track: { de: 'Zweig', en: 'Track' },
  language: { de: 'Sprache', en: 'Language' },
}

const FILTER_VALUE_LABELS: Record<string, { de: string; en: string }> = {
  ...JURISDICTION_LABELS,
  GK: { de: 'GK', en: 'GK' },
  LK: { de: 'LK', en: 'LK' },
}

const humanizeKey = (value: string): string => {
  const spaced = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
  if (!spaced) return value
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export const formatApplicabilityDimensionLabel = (dimension: string, language: LabelLanguage): string => {
  const mapped = APPLICABILITY_DIMENSION_LABELS[dimension]
  if (mapped) return mapped[language]
  return humanizeKey(dimension)
}

export const formatFilterValueLabel = (value: string, language: LabelLanguage): string => {
  const mapped = FILTER_VALUE_LABELS[value]
  if (mapped) return mapped[language]
  return value
}

export const formatFilterDisplayLabel = (value: string, language: LabelLanguage): string => {
  const jurisdiction = normalizeJurisdictionCode(value)
  if (jurisdiction) {
    return `${formatFilterValueLabel(jurisdiction, language)} (${jurisdiction})`
  }
  return formatFilterValueLabel(value, language)
}

export const formatRootFilterLabel = (
  filter: { id: string; label?: string },
  language: LabelLanguage,
): string => {
  if (filter.id.toUpperCase() === 'ALL') {
    return language === 'de' ? 'Kanonische DE-Sicht' : 'Canonical DE View'
  }
  const jurisdiction = normalizeJurisdictionCode(filter.id)
  if (jurisdiction) {
    return formatFilterValueLabel(jurisdiction, language)
  }
  return filter.label?.trim() || formatFilterValueLabel(filter.id, language)
}

export const formatJurisdictionScopedTitle = (
  title: string,
  filterId: string | undefined,
  language: LabelLanguage,
): string => {
  const jurisdiction = filterId ? normalizeJurisdictionCode(filterId) : null
  if (!jurisdiction) return title
  const suffix = `${formatFilterValueLabel(jurisdiction, language)}, ${jurisdiction}`
  if (/\(DE\)$/u.test(title)) {
    return title.replace(/\(DE\)$/u, `(${suffix})`)
  }
  return `${title} (${suffix})`
}

export const sortJurisdictionFiltersForDisplay = <T extends { id: string; label: string }>(
  filters: T[],
  language: LabelLanguage,
): T[] => {
  const jurisdictionFilters = filters.filter((filter) => normalizeJurisdictionCode(filter.id))
  if (jurisdictionFilters.length === 0) {
    return filters
  }

  const canonicalFilter = filters.find((filter) => filter.id === 'ALL') ?? null
  const otherFilters = filters.filter((filter) => filter.id !== 'ALL' && !normalizeJurisdictionCode(filter.id))
  const sortedJurisdictions = [...jurisdictionFilters].sort((left, right) => {
    const leftLabel = formatRootFilterLabel(left, language)
    const rightLabel = formatRootFilterLabel(right, language)
    return leftLabel.localeCompare(rightLabel, language, { sensitivity: 'base' })
  })

  return canonicalFilter
    ? [canonicalFilter, ...sortedJurisdictions, ...otherFilters]
    : [...sortedJurisdictions, ...otherFilters]
}

export const getDisplayFiltersForSelection = <T extends { id: string; label?: string }>(
  filters: T[],
  language: LabelLanguage,
): Array<T & { label: string }> => {
  const hasJurisdictionFilters = filters.some((filter) => normalizeJurisdictionCode(filter.id))
  const normalizedFilters = filters.map((filter) => ({
    ...filter,
    label: filter.label?.trim() || formatFilterValueLabel(filter.id, language),
  }))
  const sortedFilters = hasJurisdictionFilters
    ? sortJurisdictionFiltersForDisplay(normalizedFilters, language)
    : normalizedFilters

  return sortedFilters.map((filter) => ({
    ...filter,
    label: hasJurisdictionFilters
      ? formatRootFilterLabel(filter, language)
      : filter.label,
  }))
}

export const getDisplayCourseProfileFilters = <T extends { id: string; label?: string }>(
  filters: T[] | undefined,
  language: LabelLanguage,
): Array<T & { label: string }> => {
  const effectiveFilters = getDisplayFiltersForSelection(filters ?? [], language)
  const hasGk = effectiveFilters.some((filter) => filter.id === 'GK')
  const hasLk = effectiveFilters.some((filter) => filter.id === 'LK')
  const hasAll = effectiveFilters.some((filter) => filter.id === 'ALL')

  if (hasGk && hasLk && !hasAll) {
    return [
      ...effectiveFilters,
      {
        id: 'ALL',
        label: language === 'de' ? 'Grund- und Leistungskurs' : 'Basic and advanced course',
      } as T & { label: string },
    ]
  }

  return effectiveFilters
}
