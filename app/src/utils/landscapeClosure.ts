import { prepareLandscapeEntries, type LandscapeEntry } from '../hooks/useLandscapes'
import type { SkillLandscape } from '../landscapeTypes'

const apiBase = (import.meta.env?.VITE_API_BASE ?? '').replace(/\/+$/u, '')
const toApi = (path: string) => (apiBase ? `${apiBase}${path}` : path)

export const landscapeEntriesBelongToRoot = (
  entries: readonly LandscapeEntry[] | undefined,
  rootLandscapeId: string,
): entries is LandscapeEntry[] => (
  !!entries?.some((entry) => entry.meta.landscapeId === rootLandscapeId)
)

export const fetchLandscapeClosureEntries = async (
  rootLandscapeId: string,
  language: string,
  signal?: AbortSignal,
): Promise<LandscapeEntry[]> => {
  const response = await fetch(
    toApi(`/api/ui/landscapes/${encodeURIComponent(rootLandscapeId)}/closure?lang=${language}`),
    { cache: 'no-store', signal },
  )
  if (!response.ok) {
    throw new Error(`Failed to load course curriculum (${response.status})`)
  }
  const entries = prepareLandscapeEntries(await response.json() as SkillLandscape[])
  if (!landscapeEntriesBelongToRoot(entries, rootLandscapeId)) {
    throw new Error('course-curriculum-root-mismatch')
  }
  return entries
}
