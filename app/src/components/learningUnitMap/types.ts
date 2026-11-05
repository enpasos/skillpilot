export type MapEntryKind = 'unit' | 'motivation' | 'goal' | 'assessment' | 'memory'

export interface LearningMapEntry {
  id: string
  title: string
  description: string
  kind: MapEntryKind
  children?: string[]
  requires: string[]
  position: { x: number; y: number }
  eyebrow?: string
}

export interface LearningMapFixture {
  rootId: string
  title: string
  entries: Record<string, LearningMapEntry>
}

/** Read-only projection supplied by the caller; never a persisted unit result. */
export interface LearningEntryProgress {
  total: number
  explicit: number
  implicit: number
}

export interface LearningMapCommand {
  entryId: string
  nonce: number
}
