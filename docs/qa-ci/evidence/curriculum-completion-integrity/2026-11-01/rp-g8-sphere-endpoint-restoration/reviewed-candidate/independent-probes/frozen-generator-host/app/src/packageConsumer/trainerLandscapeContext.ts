import type { ClassSession } from '../trainerTypes'

// Package mode has no repository-owned legacy-to-canonical mapping table. The
// runtime catalog validates/normalizes active landscape IDs after this neutral
// transport-level normalization.
export const mapLegacyGymnasiumLandscapeIdToCanonical = (landscapeId?: string | null) =>
  landscapeId?.trim() ?? ''

export const normalizeTrainerLandscapeId = (landscapeId?: string | null) =>
  mapLegacyGymnasiumLandscapeIdToCanonical(landscapeId)

export const migrateTrainerClassSession = (session: ClassSession): ClassSession => session
