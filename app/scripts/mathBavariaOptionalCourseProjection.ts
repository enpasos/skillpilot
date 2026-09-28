import assert from 'node:assert/strict'
import type { GoalBookPage } from './goalBookModel'

export const BAVARIA_OPTIONAL_MATH_DOCUMENT_KEY = 'JGST12_VERTIEFUNG'

export interface BavariaMathSourceExtraction {
  sourceDocuments: Array<{ key: string; role: string }>
  sourceGoals: Array<{ id: string; sourceDocumentKey: string }>
}

export interface BavariaMathSourceMapping {
  mappings: Array<{ legacyGoalId: string; canonicalGoalId: string }>
}

/** A canonical goal is optional-only only when every BY mapping points to the optional document. */
export const deriveBavariaOptionalOnlyGoalIds = (
  extraction: BavariaMathSourceExtraction,
  mapping: BavariaMathSourceMapping,
) => {
  const documents = new Map(extraction.sourceDocuments.map((document) => [document.key, document]))
  assert.equal(documents.size, extraction.sourceDocuments.length, 'duplicate BY source document key')
  assert.equal(documents.get(BAVARIA_OPTIONAL_MATH_DOCUMENT_KEY)?.role, 'optional-extension',
    'Bavaria optional course document role changed')
  const sourceById = new Map(extraction.sourceGoals.map((goal) => [goal.id, goal]))
  assert.equal(sourceById.size, extraction.sourceGoals.length, 'duplicate BY source goal ID')
  for (const goal of extraction.sourceGoals) {
    assert.ok(documents.has(goal.sourceDocumentKey), `unknown BY source document ${goal.sourceDocumentKey}`)
  }
  const optionalSourceIds = new Set(extraction.sourceGoals
    .filter((goal) => goal.sourceDocumentKey === BAVARIA_OPTIONAL_MATH_DOCUMENT_KEY)
    .map((goal) => goal.id))
  assert.ok(optionalSourceIds.size > 0, 'Bavaria optional course has no source goals')
  const mappedOptionalSourceIds = new Set<string>()
  const optionalCanonicalIds = new Set<string>()
  const regularCanonicalIds = new Set<string>()
  let optionalMappingRows = 0
  for (const row of mapping.mappings) {
    assert.ok(sourceById.has(row.legacyGoalId), `unresolved BY source mapping ${row.legacyGoalId}`)
    assert.ok(row.canonicalGoalId, 'empty canonical goal ID in BY source mapping')
    if (optionalSourceIds.has(row.legacyGoalId)) {
      optionalMappingRows += 1
      mappedOptionalSourceIds.add(row.legacyGoalId)
      optionalCanonicalIds.add(row.canonicalGoalId)
    } else {
      regularCanonicalIds.add(row.canonicalGoalId)
    }
  }
  assert.equal(mappedOptionalSourceIds.size, optionalSourceIds.size,
    'not every optional BY source goal is mapped')
  const sharedCanonicalIds = [...optionalCanonicalIds].filter((id) => regularCanonicalIds.has(id)).sort()
  const optionalOnlyCanonicalIds = [...optionalCanonicalIds]
    .filter((id) => !regularCanonicalIds.has(id)).sort()
  return {
    optionalSourceGoalCount: optionalSourceIds.size,
    optionalMappingRows,
    optionalCanonicalGoalCount: optionalCanonicalIds.size,
    sharedCanonicalIds,
    optionalOnlyCanonicalIds,
  }
}

export const bavariaSekIIScopes = (page: GoalBookPage) => (page.applicability ?? [])
  .filter((group) => group.jurisdiction === 'DE-BY')
  .flatMap((group) => group.scopes.filter((scope) => scope.stage === 'SekII'))

export const remainingApplicabilityScopeCount = (page: GoalBookPage): number => (
  (page.applicability ?? []).reduce((count, group) => count + group.scopes.filter((scope) => (
    group.jurisdiction !== 'DE-BY' || scope.stage !== 'SekII'
  )).length, 0)
)
