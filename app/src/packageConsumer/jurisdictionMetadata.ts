export const KNOWN_JURISDICTIONS: readonly string[] = Object.freeze([])
export type KnownJurisdiction = string
export const JURISDICTION_LABELS: Record<string, { de: string; en: string }> = Object.freeze({})

// Package scope codes are package data. This normalizer only checks the safe
// transport shape and never supplies a repository-owned allowlist or label.
export const normalizeJurisdictionCode = (raw: string | null | undefined): KnownJurisdiction | null => {
  const normalized = raw?.trim().toUpperCase() ?? ''
  return /^[A-Z][A-Z0-9]{1,7}(?:-[A-Z0-9]{1,12})+$/u.test(normalized) ? normalized : null
}

export const isKnownJurisdictionCode = (value: string): value is KnownJurisdiction =>
  normalizeJurisdictionCode(value) === value
