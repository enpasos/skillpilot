// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from 'node:fs'

/** The existing Composer ledger-loading boundary; no scope or graph inference. */
export function loadCompositionSemanticKinds(paths: readonly string[]): Map<string, Map<string, string>> {
  const result = new Map<string, Map<string, string>>()
  for (const path of paths) {
    const ledger = JSON.parse(readFileSync(path, 'utf8')) as {
      sourceLandscapeId?: string
      decisions?: Array<{ goalId?: string; semanticKind?: string; decisionStatus?: string }>
    }
    const owner = ledger.sourceLandscapeId?.trim() ?? ''
    if (!owner) throw new Error('sourceLandscapeId fehlt')
    if (result.has(owner)) throw new Error(`Mehr als ein Semantic-Kind-Ledger für Landscape ${owner}`)
    const kinds = new Map<string, string>()
    for (const decision of ledger.decisions ?? []) {
      const id = decision.goalId?.trim() ?? '', kind = decision.semanticKind?.trim() ?? ''
      if (!id || !kind || decision.decisionStatus !== 'authoritative') {
        throw new Error('Semantic-Kind-Entscheidungen müssen vollständig und authoritative sein')
      }
      if (kinds.has(id)) throw new Error(`Doppelte Semantic-Kind-Entscheidung für ${id}`)
      kinds.set(id, kind)
    }
    result.set(owner, kinds)
  }
  return result
}

export function assertCompositionKindCoverage(kinds: ReadonlyMap<string, string>, goalIds: readonly string[]): void {
  const goals = new Set(goalIds)
  const missing = goalIds.filter((id) => !kinds.has(id))
  const unknown = [...kinds.keys()].filter((id) => !goals.has(id))
  if (missing.length || unknown.length) {
    throw new Error(`Semantic-Kind-Ledger ist nicht deckungsgleich (fehlend: ${missing.slice(0, 5).join(', ') || '-'}; unbekannt: ${unknown.slice(0, 5).join(', ') || '-'})`)
  }
}
