// SPDX-License-Identifier: Apache-2.0
// Technical ordinary-API probe of pending author source routes; no scientific approval.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs, sourceAtlasFacet, sourceAtlasDescendants } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'

const root = resolve('.'), own = dirname(fileURLToPath(import.meta.url)), out = resolve(own, 'twenty-two-bounded-source-routes-author-v1')
const bind = (path: string) => { const bytes = readFileSync(path); return { path: relative(root, path), sha256: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length } }
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const write = (name: string, value: any) => { const path = resolve(out, name); assert.ok(!existsSync(path)); writeFileSync(path, JSON.stringify(value, null, 2) + '\n'); return bind(path) }
const configPath = resolve(out, 'whole395-with-reviewedSL-and-twenty-two-pending-routes.ordinary-inputs.author-candidate.json')
const config = read(configPath)
const mappingPath = resolve(out, 'BY-twenty-two-partial-source-routes.ordinary-mapping.author-candidate.json')
const extractionPath = resolve(out, 'BY-twenty-two-whole-clause-bounded-routes.source-extraction.author-candidate.json')
const mapping = read(mappingPath), extraction = read(extractionPath)
const inputPath = resolve(out, 'whole-twenty-two-source-route-operator-scope-and-partner.neutral-input.json')
const input = read(inputPath)
const canonical = read(resolve(root, config.landscapePath)), ledger = read(resolve(root, config.semanticKindLedgerPath))
const goals = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g]))
const atoms = new Set<string>(ledger.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').map((d: any) => d.goalId))
assert.equal(atoms.size, 395)
assert.equal(config.expectedCurricularAtomicGoalCount, 395)
assert.equal(config.expectedUnresolvedScopeDecisionCount, 496)
assert.equal(mapping.sourceLandscapeId, extraction.sourceLandscapeId)
assert.equal(mapping.targetLandscapeId, canonical.landscapeId)
assert.equal(mapping.decisions.length, extraction.sourceGoals.length)
assert.equal(mapping.decisions.length, 49)
assert.equal(mapping.mappings.length, 59)
assert.equal(new Set(extraction.sourceGoals.map((g: any) => g.id)).size, 49)
const sourceGoals = new Map<string, any>(extraction.sourceGoals.map((g: any) => [g.id, g]))
const passages = new Map<string, any>(extraction.passages.map((p: any) => [p.id, p]))
const ordinarySourceScopes: any[] = [], resolved = new Set<string>(), unresolved = new Set<string>()
for (const decision of mapping.decisions) {
  assert.equal(decision.reviewer, null); assert.equal(decision.reviewedAt, null)
  const source = sourceGoals.get(decision.sourceGoalId), passage = passages.get(source.passageId)
  assert.ok(source && passage)
  const stage = sourceAtlasFacet([source, passage, extraction.sourceDocument, extraction], 'stage')
  const course = sourceAtlasFacet([source, passage, extraction.sourceDocument, extraction], 'courseProfile')
  const isScoped = course !== null && stage?.length === 1 && (stage[0] === 'SekI' || course.length > 0)
  for (const goalId of decision.canonicalGoalIds) {
    assert.deepEqual(sourceAtlasDescendants(goalId, goals, atoms, canonical.landscapeId), [goalId])
    const relations = mapping.mappings.filter((r: any) => r.legacyGoalId === source.id && r.canonicalGoalId === goalId)
    assert.equal(relations.length, 1); assert.equal(relations[0].matchType, 'partial')
    ;(isScoped ? resolved : unresolved).add(goalId)
    ordinarySourceScopes.push({ sourceGoalId: source.id, originalSourceGoalId: source.extendedData.scopedWholeOriginalClauseRole.originalSourceGoalId,
      sourceSpan: source.sourceSpan, goalId, stage, courseProfile: course,
      actualGrade: source.extendedData.scopedWholeOriginalClauseRole.actualGrade,
      actualTrack: source.extendedData.scopedWholeOriginalClauseRole.actualTrack,
      ordinarySourceScopeResolved: isScoped, partialOnly: true, operativeSourceReviewPending: true })
  }
}
assert.equal(new Set(ordinarySourceScopes.map(r => r.goalId)).size, 22)
assert.equal(resolved.size, 21)
assert.deepEqual([...unresolved], ['e5a5dcd8-053c-55fd-b5c7-bba93779da53'])
assert.ok(ordinarySourceScopes.filter(r => r.sourceSpan.startsWith('C12-GA.')).every(r => JSON.stringify(r.courseProfile) === '["GK"]'))
assert.ok(ordinarySourceScopes.filter(r => r.sourceSpan.startsWith('C11.')).every(r => JSON.stringify(r.courseProfile) === '[]'))
assert.ok(ordinarySourceScopes.filter(r => r.stage?.[0] === 'SekI').every(r => JSON.stringify(r.courseProfile) === '[]'))
const beforeOutputsExist = [config.outputDirectory, config.manifestPath, config.navigationViewPath].map((p: string) => existsSync(resolve(root, p)))
assert.ok(beforeOutputsExist.every(v => !v))
let ordinaryFailure: string | null = null
try { buildGoalBookSourceAtlasInputs(config, root) } catch (error) { ordinaryFailure = error instanceof Error ? error.message : String(error) }
assert.ok(ordinaryFailure?.startsWith('Missing reviewed mapping decision metadata: by-chem-b008-scope-'))
assert.ok([config.outputDirectory, config.manifestPath, config.navigationViewPath].every((p: string) => !existsSync(resolve(root, p))))
for (const declaration of input.originalAllMappingInputsUnchanged) assert.equal(bind(resolve(root, declaration.path)).sha256.replace('sha256:', ''), declaration.sha256)
const diagnosis = read(resolve(root, input.actualSource395Diagnostic.path))
const potentialSourceUnion = new Set<string>([...diagnosis.supportedGoalIds, ...resolved])
assert.equal(potentialSourceUnion.size, 375)
const report = write('actual-twenty-two-pending-routes.ordinary-facets-and-real-atlas-HOLD.json', {
  schemaVersion: 1, role: 'Ordinary source helpers on exact unapproved author data; actual normal compiler metadata HOLD preserved',
  config: bind(configPath), mapping: bind(mappingPath), extraction: bind(extractionPath), input: bind(inputPath),
  actualSourceGoalCount: 49, actualPartialMappingEdgeCount: 59, wholeSelectedRoutineGoalCount: 22,
  actualOrdinarySourceScopes: ordinarySourceScopes, currentSourceUnion354: 354,
  prospectiveScopeResolvedCandidateGoalCount: 21, unresolvedCandidateGoalIds: [...unresolved],
  unapprovedHypotheticalScopeUnionWouldBe375Of395: potentialSourceUnion.size,
  expectedUnresolvedScopeDecisionCountUnchanged: 496, actualAdditionalCandidateC11Uncertainty: 1,
  actualOrdinaryCompilerTerminal: { exitCode: 1, failure: ordinaryFailure, stage: 'unapproved mapping metadata rejected before any output' },
  normalMetadataGuardNotBypassed: true, noOrdinaryGeneratedOutputs: true,
  noScientificReviewNo395Approval: true, newFiveRolesRequireTwoReviews: true,
  wholeSourceAndSourceOperatorOrPlacementApproval: false, allCurrentMappingsByteExact: true,
  activeWrites: [], humanApproval: false, netStrictGain: 0 })
console.log(JSON.stringify({ report, ordinaryActualExitCode: 1, expectedAuthorMetadataHold: true, selected: 22,
  pendingScopedCandidates: 21, C11StillCourseHold: 1, no395Approval: true, netStrictGain: 0 }))
