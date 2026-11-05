import type { LearningMapFixture } from './types'

/** Follow the authored presentation hierarchy, never reverse prerequisite links. */
export function mapEntryPath(fixture: LearningMapFixture, entryId: string): string[] | null {
  if (fixture.entryPaths) return fixture.entryPaths[entryId] ?? null
  const queue: string[][] = [[fixture.rootId]]
  const visited = new Set<string>()
  for (let index = 0; index < queue.length; index++) {
    const path = queue[index]
    const id = path[path.length - 1]
    if (!fixture.entries[id]) continue
    if (id === entryId) return path
    if (visited.has(id)) continue
    visited.add(id)
    for (const child of fixture.entries[id]?.children ?? []) queue.push([...path, child])
  }
  return null
}

/** Project a saved camera path onto the hierarchy available in this render. */
export function validMapScopePath(fixture: LearningMapFixture, requested: readonly string[]): string[] {
  const path = [fixture.rootId]
  if (requested[0] !== fixture.rootId) return path
  for (const id of requested.slice(1)) {
    const entry = fixture.entries[id]
    const parent = fixture.entries[path[path.length - 1]]
    if (!entry?.children?.length || !parent?.children?.includes(id)) break
    path.push(id)
  }
  return path
}
