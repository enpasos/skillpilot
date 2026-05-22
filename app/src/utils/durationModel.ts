export const KNOWN_DURATION_MODELS = ['G8', 'G9'] as const

export type KnownDurationModel = (typeof KNOWN_DURATION_MODELS)[number]

export const DEFAULT_DURATION_MODEL: KnownDurationModel = 'G9'

const DURATION_MODEL_ALIASES: Record<string, KnownDurationModel> = {
  G8: 'G8',
  G9: 'G9',
  'DURATIONMODEL:G8': 'G8',
  'DURATIONMODEL:G9': 'G9',
  'DURATION-MODEL:G8': 'G8',
  'DURATION-MODEL:G9': 'G9',
}

export const normalizeDurationModel = (raw: string | null | undefined): KnownDurationModel | null => {
  if (!raw) return null
  return DURATION_MODEL_ALIASES[raw.trim().toUpperCase()] ?? null
}

export const isDurationModelFilterId = (filterId?: string) =>
  normalizeDurationModel(filterId) !== null

export const getDurationModelOptions = (language: 'de' | 'en') =>
  KNOWN_DURATION_MODELS.map((id) => ({
    id,
    label: id,
    description: language === 'de'
      ? id === 'G8'
        ? 'Achtjähriger gymnasialer Bildungsgang'
        : 'Neunjähriger gymnasialer Bildungsgang'
      : id === 'G8'
        ? 'Eight-year Gymnasium path'
        : 'Nine-year Gymnasium path',
  }))
