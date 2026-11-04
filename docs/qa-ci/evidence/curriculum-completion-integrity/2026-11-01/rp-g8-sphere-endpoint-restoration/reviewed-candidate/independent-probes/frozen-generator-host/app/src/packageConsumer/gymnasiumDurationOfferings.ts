import type { KnownDurationModel } from '../utils/durationModel'

export type GymnasiumStageOffering = 'SekI' | 'SekII' | 'CrossStage'
export type GymnasiumDurationOfferings = Record<string, Record<string, readonly KnownDurationModel[]>>
export type GymnasiumContentOfferings = Record<string, Record<string, {
  readonly stages: readonly GymnasiumStageOffering[]
  readonly durationModels: readonly KnownDurationModel[]
}>>

// Package-consumer builds must never carry the repository's authored policy.
// Catalog-backed callers receive their offerings at runtime; an accidental
// repository lookup therefore fails closed with an empty result.
export const GYMNASIUM_DURATION_OFFERINGS: GymnasiumDurationOfferings = Object.freeze({})
export const GYMNASIUM_CONTENT_OFFERINGS: GymnasiumContentOfferings = Object.freeze({})
