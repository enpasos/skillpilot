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
