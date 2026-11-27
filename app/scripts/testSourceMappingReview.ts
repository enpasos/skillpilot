// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import { exportSourceMappingEdges } from './exportSourceMappingEdges'
import { deviationApprovalSha256, type DeclinedDecision } from './sourceMappingDeviation'
import { sourceMappingDigest } from './sourceMappingDigest'
import {
  loadSourceMappingReviews,
  sourceRowSha256,
  type Contribution,
  type EffectiveDecision,
  type OfficialRow,
  type ReviewFile,
  type SourceEdition,
  type SourceMappingInputs,
} from './sourceMappingReview'

const authorId = '11111111-1111-4111-8111-111111111111'
const reviewerId = '22222222-2222-4222-8222-222222222222'
const reviewedAt = '2026-11-27'
const documentPath = 'curricula/reviews/selected.json'
const subject: Contribution = {
  canonicalGoalId: 'force-model', kind: 'subject', matchType: 'partial',
  performance: 'Explain a force model.', scopeIds: ['GK'],
}
const crossCutting: Contribution = {
  canonicalGoalId: 'evaluate-models', kind: 'crossCutting', matchType: 'partial',
  performance: 'Evaluate the model assumptions.', scopeIds: ['LK'],
}

function sourceRecord({ sourceGoalId, wording }: Pick<OfficialRow, 'sourceGoalId' | 'wording'>) {
  return { id: sourceGoalId, sourceText: wording }
}

function extraction(
  { sourceLandscapeId, rows, edition }: Pick<SourceEdition, 'sourceLandscapeId' | 'rows' | 'edition'>,
  sourceGoals: Record<string, unknown>[] = rows.map(sourceRecord),
) {
  return Buffer.from(JSON.stringify({ sourceLandscapeId, extractionId: `physics-${edition}`,
    sourceDocument: { path: `official/${sourceLandscapeId}-${edition}.pdf`, official: true }, sourceGoals }))
}

function sha256(bytes: Buffer) {
  return createHash('sha256').update(bytes).digest('hex')
}

function officialRow(
  sourceGoalId = 'row-1', regularTargetsByScope: OfficialRow['regularTargetsByScope'] = { GK: [subject.canonicalGoalId] },
): OfficialRow {
  const wording = 'Die Lernenden erläutern ein Modell.'
  return {
    sourceGoalId, wording, sourceRecordSha256: sourceMappingDigest(sourceRecord({ sourceGoalId, wording })),
    parentContext: [],
    applicableScopeIds: Object.keys(regularTargetsByScope),
    regularTargetsByScope,
  }
}

function sourceEdition(rows: OfficialRow[], edition = '2026', sourceLandscapeId = 'regional-physics'): SourceEdition {
  return {
    targetLandscapeId: 'canonical-physics', sourceLandscapeId,
    sourceId: 'physics-plan', edition, rows,
    sourceExtractionPath: `curricula/source/${sourceLandscapeId}-${edition}.json`,
    sourceExtractionSha256: sha256(extraction({ sourceLandscapeId, rows, edition })),
    legacyReviewPaths: [], selectedReviews: [],
  }
}

function rowRef(edition: SourceEdition, row: OfficialRow) {
  return { sourceGoalId: row.sourceGoalId, rowSha256: sourceRowSha256(edition, row) }
}

function open(edition: SourceEdition, row: OfficialRow) {
  return { ...rowRef(edition, row), authorId, decision: 'open', rationale: 'Coverage still under review.' }
}

function carried(
  edition: SourceEdition, row: OfficialRow, contributions = [subject], mainKind: Contribution['kind'] = 'subject',
) {
  return {
    ...rowRef(edition, row), authorId, reviewerId, reviewedAt, decision: 'carried', mainKind,
    performance: 'Use a model and explain its assumptions.', contributions,
  }
}

function review(
  { targetLandscapeId, sourceLandscapeId, sourceId, edition }: SourceEdition,
  decisions: Record<string, unknown>[], path = documentPath, reviewId = 'review-1',
): ReviewFile {
  return { path, document: { version: 2, reviewId, targetLandscapeId, sourceLandscapeId, sourceId, edition, decisions } }
}

function load(
  edition: SourceEdition, decisions: Record<string, unknown>[],
  {
    editions = [edition], readEvidence, sourceBytes, ...options
  }: Partial<SourceMappingInputs> & { sourceBytes?: Buffer } = {},
) {
  const sourceFiles = new Map<string, Buffer>(editions.map(registered => [registered.sourceExtractionPath, extraction(registered)]))
  if (sourceBytes) sourceFiles.set(edition.sourceExtractionPath, sourceBytes)
  return loadSourceMappingReviews({
    legacyReviews: [], editions, reviews: [review(edition, decisions)],
    readEvidence: path => {
      const source = sourceFiles.get(path)
      if (source) return source
      if (readEvidence) return readEvidence(path)
      throw new Error(`Unexpected evidence read: ${path}`)
    },
    ...options,
  })
}

function reportedKind(decision: EffectiveDecision): string {
  return decision.decision === 'carried' ? decision.mainKind : decision.decision
}

test('conflicting candidates require an explicit review path and stay independent of input order', () => {
  const row = officialRow()
  const edition = sourceEdition([row])
  const alternativePath = 'curricula/reviews/alternative.json'
  const reviews = [
    review(edition, [open(edition, row)], alternativePath, documentPath),
    review(edition, [carried(edition, row)], documentPath, 'selected-review'),
  ]

  assert.throws(() => load(edition, [], { reviews }), /Missing or ambiguous effective decision/)
  edition.selectedReviews = [{ sourceGoalId: row.sourceGoalId, reviewPath: 'curricula/reviews/missing.json' }]
  assert.throws(() => load(edition, [], { reviews }), /Missing or ambiguous effective decision/)

  edition.selectedReviews = [{ sourceGoalId: row.sourceGoalId, reviewPath: documentPath }]
  for (const order of [reviews, [...reviews].reverse()]) {
    const { effectiveDecisions } = load(edition, [], { reviews: order })
    assert.deepEqual(effectiveDecisions.map(({ decision, reviewId, reviewPath }) => [decision, reviewId, reviewPath]), [
      ['carried', 'selected-review', documentPath],
    ])
  }
  edition.selectedReviews = [{ sourceGoalId: row.sourceGoalId, reviewPath: alternativePath }]
  assert.deepEqual(load(edition, [], { reviews }).effectiveDecisions.map(reportedKind), ['open'])

  const repeated = [alternativePath, documentPath].map(reviewPath => ({ sourceGoalId: row.sourceGoalId, reviewPath }))
  for (const selectedReviews of [repeated, [...repeated].reverse(), [repeated[0], repeated[0]]]) {
    assert.throws(() => load({ ...edition, selectedReviews }, [], { reviews }), /Repeated review selection for row row-1/)
  }
})

test('the same row ID is resolved separately per source and edition', () => {
  const row = officialRow()
  const oldEdition = sourceEdition([row], '2024')
  const edition = sourceEdition([row])
  const otherSource = { ...sourceEdition([row], edition.edition, 'other-physics'), sourceId: 'other-physics-plan' }
  const oldReview = review(oldEdition, [carried(oldEdition, row)], 'curricula/reviews/2024.json')
  const newReview = review(edition, [open(edition, row)])
  const otherReview = review(otherSource, [carried(otherSource, row)], 'curricula/reviews/other-source.json')
  const { effectiveDecisions } = load(edition, [], {
    editions: [oldEdition, edition, otherSource], reviews: [newReview, otherReview, oldReview],
  })
  assert.deepEqual(effectiveDecisions.map(decision => [decision.sourceId, decision.edition, decision.decision]), [
    ['physics-plan', '2024', 'carried'], ['physics-plan', '2026', 'open'], ['other-physics-plan', '2026', 'carried'],
  ])
  assert.throws(() => load(edition, [], { reviews: [oldReview] }), /Unregistered source or edition/)
  assert.throws(() => load(edition, [carried(oldEdition, row)]), /Stale official row binding/)
})

test('missing rows, extra rows, and duplicate rows in either input are rejected', () => {
  const first = officialRow()
  const second = officialRow('row-2')
  const edition = sourceEdition([first, second])
  const valid = [open(edition, first), open(edition, second)]
  assert.deepEqual(load(edition, valid).effectiveDecisions.map(reportedKind), ['open', 'open'])
  assert.throws(() => load(edition, valid.slice(0, 1)), /Missing or ambiguous effective decision.*row-2/)
  assert.throws(() => load(edition, [...valid, open(edition, officialRow('row-outside'))]), /Unknown or duplicate row row-outside/)
  assert.throws(() => load(edition, [...valid, valid[0]]), /Unknown or duplicate row row-1/)
  assert.throws(() => load({ ...edition, rows: [first, second, first] }, valid), /Duplicate official row/)
  assert.throws(() => load({ ...edition, selectedReviews: [{ sourceGoalId: 'absent', reviewPath: documentPath }] }, valid),
    /Selection for unknown row absent/)
})

test('review schema rejects fields outside the decision contract', () => {
  const row = officialRow()
  const edition = sourceEdition([row])
  const decision = open(edition, row)
  assert.throws(() => load(edition, [{ ...decision, contributions: [subject] }]), /Invalid V2 review/)
})

const changedOfficialRows: [string, (row: OfficialRow) => OfficialRow][] = [
  ['wording', row => ({ ...row, wording: `${row.wording} und beurteilen es.` })],
  ['applicable course IDs', row => ({ ...row, applicableScopeIds: ['GK', 'LK'],
    regularTargetsByScope: { ...row.regularTargetsByScope, LK: [] } })],
]

for (const [changedField, change] of changedOfficialRows) {
  test(`changed official ${changedField} invalidates the reviewed row`, () => {
    const row = officialRow()
    const edition = sourceEdition([row])
    const decisions = [open(edition, row)]
    assert.equal(load(edition, decisions).effectiveDecisions.length, 1)
    const changed = change(row)
    changed.sourceRecordSha256 = sourceMappingDigest(sourceRecord(changed))
    assert.throws(() => load(sourceEdition([changed]), decisions), /Stale official row binding: row-1/)
  })
}

test('edition conversion pins extraction bytes and accounts for every atomic source record', () => {
  const row = officialRow()
  const edition = sourceEdition([row])
  const decisions = [open(edition, row)]
  const record = sourceRecord(row)
  const repin = (bytes: Buffer) => ({ ...edition, sourceExtractionSha256: sha256(bytes) })

  const changedRecord = { ...record, section: { title: 'Mechanik', page: 13 } }
  const changedBytes = extraction(edition, [changedRecord])
  assert.throws(() => load(edition, decisions, { sourceBytes: changedBytes }), /Stale source extraction/)
  assert.throws(() => load(repin(changedBytes), decisions, { sourceBytes: changedBytes }), /Stale wording or source record: row-1/)
  const updatedRow = { ...row, sourceRecordSha256: sourceMappingDigest(changedRecord) }
  const updated = { ...repin(changedBytes), rows: [updatedRow] }
  assert.throws(() => load(updated, decisions, { sourceBytes: changedBytes }), /Stale official row binding: row-1/)
  assert.equal(load(updated, [open(updated, updatedRow)], { sourceBytes: changedBytes }).effectiveDecisions.length, 1)

  const omittedRow = extraction(edition, [record, { id: 'skipped', sourceText: 'Eine zweite Pflicht.' }])
  assert.throws(() => load(repin(omittedRow), decisions, { sourceBytes: omittedRow }), /Missing or duplicate official source row: skipped/)
  const duplicatedRow = extraction(edition, [record, record])
  assert.throws(() => load(repin(duplicatedRow), decisions, { sourceBytes: duplicatedRow }), /Missing or duplicate official source row: row-1/)
  const inventedRow = { ...edition, rows: [row, officialRow('invented')] }
  assert.throws(() => load(inventedRow, decisions, { sourceBytes: extraction(edition) }), /Inventoried row absent from source extraction/)
  const withSection = extraction(edition, [{ id: 'section', title: 'Mechanik', contains: [row.sourceGoalId] }, record])
  assert.throws(() => load(repin(withSection), decisions, { sourceBytes: withSection }), /Stale source parent context: row-1/)
})

test('a repinned extraction cannot preserve decisions after a containing heading changes', () => {
  const outer = { id: 'outer', title: 'GK', courseLevel: 'GK' }
  const inner = { id: 'inner', title: 'Mechanik' }
  const row: OfficialRow = { ...officialRow(), parentContext: [
    { kind: 'sourceGoal', id: inner.id, contextSha256: sourceMappingDigest(inner) },
    { kind: 'sourceGoal', id: outer.id, contextSha256: sourceMappingDigest(outer) },
  ] }
  const edition = sourceEdition([row])
  const body = (outerRecord: typeof outer) => extraction(edition, [
    { ...outerRecord, contains: ['inner'] }, { ...inner, contains: [row.sourceGoalId] }, sourceRecord(row),
  ])
  const originalBytes = body(outer)
  const decisions = [open(edition, row)]
  assert.equal(load({ ...edition, sourceExtractionSha256: sha256(originalBytes) }, decisions,
    { sourceBytes: originalBytes }).effectiveDecisions.length, 1)

  const changed = { ...outer, title: 'LK', courseLevel: 'LK' }
  const changedBytes = body(changed)
  const repinned = { ...edition, sourceExtractionSha256: sha256(changedBytes) }
  assert.throws(() => load(repinned, decisions, { sourceBytes: changedBytes }), /Stale source parent context: row-1/)
  const revised = { ...row, parentContext: [row.parentContext[0],
    { kind: 'sourceGoal' as const, id: outer.id, contextSha256: sourceMappingDigest(changed) }] }
  const revisedEdition = { ...repinned, rows: [revised] }
  assert.throws(() => load(revisedEdition, decisions, { sourceBytes: changedBytes }), /Stale official row binding: row-1/)
  assert.equal(load(revisedEdition, [open(revisedEdition, revised)], { sourceBytes: changedBytes }).effectiveDecisions.length, 1)
})

test('flat extraction rows bind passage headings through either explicit link', () => {
  const first = officialRow()
  const second = officialRow('row-2')
  const heading = { id: 'mechanics', title: 'Grundkurs: Mechanik', courseLevel: 'GK' }
  const firstRecord = { ...sourceRecord(first), passageId: heading.id }
  const rows = [first, second].map(row => ({ ...row, parentContext: [{
    kind: 'passage' as const, id: heading.id, contextSha256: sourceMappingDigest(heading),
  }] }))
  rows[0].sourceRecordSha256 = sourceMappingDigest(firstRecord)
  const edition = sourceEdition(rows)
  const body = (metadata: typeof heading) => Buffer.from(JSON.stringify({ sourceLandscapeId: edition.sourceLandscapeId,
    sourceGoals: [firstRecord, sourceRecord(second)], passages: [{ ...metadata, sourceGoalIds: [second.sourceGoalId] }] }))
  const probe = (sourceBytes: Buffer) => load({ ...edition, sourceExtractionSha256: sha256(sourceBytes) },
    rows.map(row => open(edition, row)), { sourceBytes })
  assert.equal(probe(body(heading)).effectiveDecisions.length, 2)
  assert.throws(() => probe(body({ ...heading, title: 'Leistungskurs: Mechanik', courseLevel: 'LK' })), /Stale source parent context/)
})

test('partial contributions cover the course union with regular targets in each stated course', () => {
  const advanced: Contribution = { ...crossCutting, kind: 'subject' }
  const row = officialRow('row-1', { GK: [subject.canonicalGoalId], LK: [advanced.canonicalGoalId] })
  const edition = sourceEdition([row])
  const full = carried(edition, row, [subject, advanced])
  const { effectiveDecisions } = load(edition, [full])
  assert.deepEqual(effectiveDecisions.map(reportedKind), ['subject'])
  assert.deepEqual(exportSourceMappingEdges(load(edition, [full])).positiveEdges.map(edge => [edge.canonicalGoalId, edge.scopeIds]), [
    [advanced.canonicalGoalId, ['LK']], [subject.canonicalGoalId, ['GK']],
  ])

  assert.throws(() => load(edition, [carried(edition, row, [subject])]), /Incomplete course or module coverage/)
  const wrongCourse = { ...advanced, scopeIds: ['GK', 'LK'] }
  assert.throws(() => load(edition, [carried(edition, row, [subject, wrongCourse])]), /not a regular target in GK/)

  const changed = { ...row, regularTargetsByScope: { ...row.regularTargetsByScope, LK: ['other-regular-goal'] } }
  assert.equal(sourceRowSha256(edition, changed), full.rowSha256)
  assert.throws(() => load({ ...edition, rows: [changed] }, [full]), /not a regular target in LK/)
})

test('target sets cannot change or infer a row’s authoritative applicable course scopes', () => {
  const row = officialRow()
  const contradictory = { ...row, regularTargetsByScope: { LK: [crossCutting.canonicalGoalId] } }
  const wrong = sourceEdition([contradictory])
  assert.throws(() => load(wrong, [carried(wrong, contradictory, [crossCutting], 'crossCutting')]),
    /Regular target sets must match the official applicable scopes: row-1/)
  const extra = { ...row, regularTargetsByScope: { ...row.regularTargetsByScope, LK: [] } }
  const extraEdition = sourceEdition([extra])
  assert.throws(() => load(extraEdition, [open(extraEdition, extra)]), /Regular target sets must match/)
  const edition = sourceEdition([row])
  assert.equal(load(edition, [carried(edition, row)]).effectiveDecisions.length, 1)
})

test('a cross-cutting row and a mixed row each count once under the declared main kind', () => {
  const onlyCross = officialRow('cross-only', { LK: [crossCutting.canonicalGoalId] })
  const mixed = officialRow('mixed', { GK: [subject.canonicalGoalId], LK: [crossCutting.canonicalGoalId] })
  const edition = sourceEdition([onlyCross, mixed])
  const single = carried(edition, onlyCross, [crossCutting], 'crossCutting')
  const both = carried(edition, mixed, [crossCutting, subject], 'subject')
  const loaded = load(edition, [single, both])
  assert.deepEqual(loaded.effectiveDecisions.map(item => [item.sourceGoalId, reportedKind(item)]), [
    ['cross-only', 'crossCutting'], ['mixed', 'subject'],
  ])
  assert.deepEqual(exportSourceMappingEdges(loaded).positiveEdges.map(edge => [edge.legacyGoalId, edge.kind]), [
    ['cross-only', 'crossCutting'], ['mixed', 'crossCutting'], ['mixed', 'subject'],
  ])
  assert.throws(() => load(edition, [{ ...single, mainKind: 'subject' }, both]), /Main carrier kind absent/)
})

function legacyReview(edition: SourceEdition, row: OfficialRow, canonicalGoalId: string): ReviewFile {
  const { targetLandscapeId, sourceLandscapeId, sourceExtractionPath } = edition
  return {
    path: `curricula/reviews/legacy-${edition.edition}.json`,
    document: {
      version: 1, targetLandscapeId, sourceLandscapeId, sourceExtractionPath,
      mappings: [{ legacyGoalId: row.sourceGoalId, canonicalGoalId }],
    },
  }
}

test('converted rows suppress stale legacy edges while another edition keeps its v1 mappings', () => {
  const row = officialRow()
  const current = sourceEdition([row])
  const oldEdition = sourceEdition([row], '2024')
  const predecessor = legacyReview(current, row, 'stale-current-goal')
  const older = legacyReview(oldEdition, row, 'retained-old-goal')
  const legacyReviews = [predecessor, older]
  const decisions = [open(current, row)]
  const readEvidence = (path: string) => {
    assert.equal(path, oldEdition.sourceExtractionPath)
    return extraction(oldEdition)
  }
  assert.throws(() => load(current, decisions, { legacyReviews, readEvidence }), /Specify the legacy review belonging to the converted edition/)
  assert.throws(() => load({ ...current, legacyReviewPaths: [older.path] }, decisions, { legacyReviews, readEvidence }), /Invalid predecessor or edition binding/)

  current.legacyReviewPaths = [predecessor.path]
  current.retainedLegacyReviews = [{ path: older.path, edition: oldEdition.edition,
    sourceExtractionPath: oldEdition.sourceExtractionPath, sourceExtractionSha256: oldEdition.sourceExtractionSha256 }]
  for (const [decision, expectedGoals] of [[decisions[0], []], [carried(current, row), [subject.canonicalGoalId]]] as const) {
    const exported = exportSourceMappingEdges(load(current, [decision], { legacyReviews, readEvidence }))
    assert.deepEqual(exported.legacyMappings, [older])
    assert.deepEqual(exported.positiveEdges.map(edge => edge.canonicalGoalId), expectedGoals)
  }
})

function decline(
  edition: SourceEdition, row: OfficialRow, reason: string, duplicateOf?: OfficialRow,
): DeclinedDecision {
  const approval = {
    categoryVersion: 1 as const, reason,
    review: { path: `curricula/reviews/approvals/${row.sourceGoalId}.json`, sha256: '' },
  }
  return {
    ...rowRef(edition, row), decision: 'declined', authorId, reviewerId, reviewedAt,
    deviation: duplicateOf ? {
      ...approval, category: 'duplicate',
      evidence: { duplicateOf: rowRef(edition, duplicateOf), samePerformance: 'Identical model explanation.', sameScope: 'Same course.' },
    } : {
      ...approval, category: 'schoolOrTeacher',
      evidence: {
        addressedTo: 'teacher', subject: 'Die Lehrkraft', operator: 'plant', heading: 'Unterricht',
        tableHeader: 'Vorgaben für Lehrkräfte', sourceLocation: { locator: 'S. 12', excerpt: 'Die Lehrkraft plant den Unterricht.' },
      },
    },
  }
}

function approve(edition: SourceEdition, decision: DeclinedDecision) {
  const bytes = Buffer.from(JSON.stringify({
    schemaVersion: 1, decisionSha256: deviationApprovalSha256(decision, edition),
    reviewerId: decision.reviewerId, reviewedAt: decision.reviewedAt, verdict: 'approved',
  }))
  decision.deviation.review.sha256 = sha256(bytes)
  return bytes
}

function evidenceReader(edition: SourceEdition, ...decisions: DeclinedDecision[]): SourceMappingInputs['readEvidence'] {
  const approvals = new Map(decisions.map(decision => [decision.deviation.review.path, approve(edition, decision)]))
  return path => {
    const approval = approvals.get(path)
    if (!approval) throw new Error(`Missing approval: ${path}`)
    return approval
  }
}

test('declines require independent approval bound to the exact decision and artifact bytes', () => {
  const row = officialRow()
  const edition = sourceEdition([row])
  const decision = decline(edition, row, 'This planning instruction addresses the teacher.')
  const readEvidence = evidenceReader(edition, decision)
  const loaded = load(edition, [decision], { readEvidence })
  assert.deepEqual(loaded.effectiveDecisions.map(reportedKind), ['declined'])
  assert.deepEqual(exportSourceMappingEdges(loaded).positiveEdges, [])

  const revised = structuredClone(decision)
  revised.deviation.reason = 'This reason was never approved.'
  assert.throws(() => load(edition, [revised], { readEvidence }), /approval must affirm this exact decision/)
  const selfApproved = structuredClone(decision)
  selfApproved.reviewerId = authorId
  assert.throws(
    () => load(edition, [selfApproved], { readEvidence: evidenceReader(edition, selfApproved) }),
    /independent|different.*author|distinct.*author/i,
  )
  const tampered = (path: string) => Buffer.concat([readEvidence(path), Buffer.from('\n')])
  assert.throws(() => load(edition, [decision], { readEvidence: tampered }), /approval.*hash/i)
})

test('a duplicate must resolve to an effective positive row inside the edition', () => {
  const row = officialRow()
  const target = officialRow('row-2')
  const edition = sourceEdition([row, target])
  const valid = decline(edition, row, 'Model explanation is repeated in row 2.', target)
  assert.deepEqual(load(edition, [valid, carried(edition, target)], {
    readEvidence: evidenceReader(edition, valid),
  }).effectiveDecisions.map(reportedKind), ['declined', 'subject'])
  assert.throws(() => load(edition, [valid, open(edition, target)], {
    readEvidence: evidenceReader(edition, valid),
  }), /Unresolved reference/)

  const absent = decline(edition, row, 'A referenced row is absent.', officialRow('missing'))
  assert.throws(() => load(edition, [absent, carried(edition, target)], {
    readEvidence: evidenceReader(edition, absent),
  }), /Unresolved reference.*missing/)

  const otherEdition = sourceEdition([row, target], '2024')
  const staleDigest = decline(otherEdition, row, 'Uses the older edition reference.', target)
  staleDigest.rowSha256 = sourceRowSha256(edition, row)
  assert.throws(() => load(edition, [staleDigest, carried(edition, target)], {
    readEvidence: evidenceReader(edition, staleDigest),
  }), /Unresolved reference/)

  const terminalDecline = decline(edition, target, 'The second row is a teacher instruction.')
  assert.throws(() => load(edition, [valid, terminalDecline], {
    readEvidence: evidenceReader(edition, valid, terminalDecline),
  }), /no positive carrier/)
})

test('independently approved duplicate references still reject cycles', () => {
  const first = officialRow()
  const second = officialRow('row-2')
  const edition = sourceEdition([first, second])
  const one = decline(edition, first, 'The first model instruction points to the second.', second)
  const two = decline(edition, second, 'The second instruction repeats the first model explanation.', first)
  assert.throws(() => load(edition, [one, two], { readEvidence: evidenceReader(edition, one, two) }), /Cyclic reference/)
})

test('replacement references follow the same edition-local positive chain as duplicates', () => {
  const first = officialRow()
  const second = officialRow('row-2')
  const third = officialRow('row-3')
  const edition = sourceEdition([first, second, third])
  const duplicate = decline(edition, first, 'The first row repeats the model explanation.', second)
  const replaced = decline(edition, second, 'The plan formally replaces this model explanation.')
  replaced.deviation = {
    categoryVersion: 1, category: 'replacedWithinEdition', reason: replaced.deviation.reason,
    review: replaced.deviation.review,
    evidence: {
      replacedBy: rowRef(edition, third),
      replacedLocation: { locator: 'S. 12', excerpt: 'Die Lernenden erläutern ein Modell.' },
      replacementLocation: { locator: 'S. 18', excerpt: 'Die Lernenden erläutern ihr Kraftmodell.' },
      authorityLocation: { locator: 'S. 17', excerpt: 'Diese Fassung ersetzt die Anforderung auf S. 12.' },
      effectivePeriod: 'Schuljahr 2026/27',
    },
  }

  assert.deepEqual(load(edition, [duplicate, replaced, carried(edition, third)], {
    readEvidence: evidenceReader(edition, duplicate, replaced),
  }).effectiveDecisions.map(reportedKind), ['declined', 'declined', 'subject'])
  replaced.deviation.evidence.replacedBy = rowRef(edition, first)
  assert.throws(() => load(edition, [duplicate, replaced, carried(edition, third)], {
    readEvidence: evidenceReader(edition, duplicate, replaced),
  }), /Cyclic reference/)
})

test('a replacement covers the original scopes unless the official scope change has its own evidence', () => {
  const gk = officialRow()
  const lk = officialRow('row-2', { LK: [crossCutting.canonicalGoalId] })
  const oldAndNew = sourceEdition([gk, lk])
  const replaced = decline(oldAndNew, gk, 'The plan replaces the model explanation.')
  replaced.deviation = {
    categoryVersion: 1, category: 'replacedWithinEdition', reason: replaced.deviation.reason,
    review: replaced.deviation.review,
    evidence: {
      replacedBy: rowRef(oldAndNew, lk),
      replacedLocation: { locator: 'S. 12', excerpt: 'Grundkurs: Die Lernenden erläutern ein Modell.' },
      replacementLocation: { locator: 'S. 18', excerpt: 'Leistungskurs: Die Lernenden beurteilen das Modell.' },
      authorityLocation: { locator: 'S. 17', excerpt: 'Diese Fassung ersetzt die Anforderung auf S. 12.' },
      effectivePeriod: 'Schuljahr 2026/27',
    },
  }
  const lkCarrier = carried(oldAndNew, lk, [crossCutting], 'crossCutting')
  const validate = () => load(oldAndNew, [replaced, lkCarrier], { readEvidence: evidenceReader(oldAndNew, replaced) })
  assert.throws(validate, /Replacement does not cover the original applicable scopes: row-1/)
  replaced.deviation.evidence.scopeChange = {
    fromScopeIds: ['LK'], toScopeIds: ['GK'],
    authorityLocation: { locator: 'S. 17', excerpt: 'Die Anforderung ist im Leistungskurs statt im Grundkurs verbindlich.' },
  }
  assert.throws(validate, /Replacement scope evidence does not match the official scopes: row-1/)
  replaced.deviation.evidence.scopeChange.fromScopeIds = ['GK']
  replaced.deviation.evidence.scopeChange.toScopeIds = ['LK']
  assert.deepEqual(validate().effectiveDecisions.map(reportedKind), ['declined', 'crossCutting'])

  const dup = decline(oldAndNew, gk, 'The same performance appears in the LK.', lk)
  assert.throws(() => load(oldAndNew, [dup, lkCarrier], { readEvidence: evidenceReader(oldAndNew, dup) }),
    /Duplicate rows have different scope: row-1/)

  const broader = officialRow(lk.sourceGoalId, { GK: [subject.canonicalGoalId], LK: [crossCutting.canonicalGoalId] })
  const broadened = sourceEdition([gk, broader])
  delete replaced.deviation.evidence.scopeChange
  replaced.deviation.evidence.replacedBy = rowRef(broadened, broader)
  const loaded = load(broadened, [replaced, carried(broadened, broader, [subject, crossCutting])], {
    readEvidence: evidenceReader(broadened, replaced),
  })
  assert.deepEqual(loaded.effectiveDecisions.map(reportedKind), ['declined', 'subject'])
})

test('individual deviation reasons cannot be reused with spacing, case, or Unicode variations', () => {
  const first = officialRow()
  const second = officialRow('row-2')
  const edition = sourceEdition([first, second])
  const one = decline(edition, first, 'Nur die Lehrkraft plant.')
  const two = decline(edition, second, '　ＮＵＲ DIE   LEHRKRAFT PLANT. ')
  assert.throws(() => load(edition, [one, two], { readEvidence: evidenceReader(edition, one, two) }), /Repeated deviation reason.*row-1.*row-2/)
})

test('reason uniqueness uses full case folding for German ß and SS', () => {
  const first = officialRow()
  const second = officialRow('row-2')
  const edition = sourceEdition([first, second])
  const one = decline(edition, first, 'Die Straße entfällt')
  const two = decline(edition, second, 'DIE STRASSE ENTFÄLLT')
  assert.throws(() => load(edition, [one, two], { readEvidence: evidenceReader(edition, one, two) }),
    /Repeated deviation reason.*row-1.*row-2/)
})
