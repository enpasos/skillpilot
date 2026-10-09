import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync, writeFileSync} from 'node:fs'
import {dirname, resolve, relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {sourceAtlasFacet, sourceAtlasDescendants} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const author = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-rest-five-content-source-author-a-v1')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const bind = (p: string) => { const bytes = readFileSync(p); return {path: relative(root, p), sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length} }
const original = read(resolve(author, 'selected-ten-whole-source-duty-and-original-partner-frame.author-neutral.json'))
const candidates = read(resolve(author, 'five-whole-content-source-candidates.with-ten-original-clauses-and29-partners.author-input.json'))
const canonicalPath = resolve(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const kindsPath = resolve(root, 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
const canonical = read(canonicalPath)
const normalized = normalizeCanonicalLandscape(canonical)
assert.equal(normalized.goals.length, canonical.goals.length)
const goals = new Map(canonical.goals.map((g: any) => [g.id, g])) as Map<string, any>
const kinds = read(kindsPath)
const atoms = new Set<string>(kinds.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').map((d: any) => d.goalId))
const currentKinds = candidates.items.map((entry: any) => {
  const goal: any = goals.get(entry.goalId)
  const d = kinds.decisions.find((d: any) => d.goalId === entry.goalId)
  assert.ok(goal && d)
  for (const field of ['id','title','titleEn','description','descriptionEn','tags','contains','requires','dimensionTags','applicability','extendedData']) {
    assert.deepEqual(goal[field], entry.wholeCurrentTarget[field], `Actual current field changed: ${entry.goalId}/${field}`)
  }
  const actualFP = fingerprintSemanticKindSourceGoal(goal)
  assert.equal(actualFP, d.sourceFingerprint)
  assert.equal(d.semanticKind, 'curricularAtomic')
  return {goalId: goal.id, authoritativeKindDecision: d, actualCurrentSemanticFingerprint: actualFP, wholeSemanticFieldsExact: true, newScientificAtomicityOrMemoryReviewClaimed: false}
})
const facets = original.rows.map((row: any, index: number) => {
  const extractionPath = resolve(root, row.sourceExtraction.path)
  const extraction = read(extractionPath)
  const levels = [row.wholeOriginalSourceGoal, row.wholeOriginalPassage, extraction.sourceDocument ?? {}, extraction]
  const stage = sourceAtlasFacet(levels, 'stage')
  const courseProfile = sourceAtlasFacet(levels, 'courseProfile')
  assert.deepEqual(stage, ['SekII'])
  const projected = row.allOriginalMappingEdges.map((edge: any) => ({edge: edge.value, currentOrdinaryAtomicDescendants: sourceAtlasDescendants(edge.value.canonicalGoalId, goals, atoms, canonical.landscapeId)}))
  return {rowIndex:index, sourceGoalId:row.wholeOriginalSourceGoal.id, ordinaryStage:stage, ordinaryCourseProfile:courseProfile, actualOldMappingProjections:projected, optionsMeaningSuppliedByActualPDFNotInferredByThisFacet: true, oldScientificCoverageRecertified: false}
})
const actualP = {normalCandidateSetsInSuppliedInput:0, normalWholeProfilesInSuppliedInput:0, normalWorkedWholeCasesAndRubricsInSuppliedInput:0, shortSyntheticMechanismSketches:5, ordinaryPReviewExecuted:false, reason:'No closed normal P contract is supplied; do not promote sketches to normal P records.'}
const receipt = {schemaVersion:1, role:'ordinary source facet/descendants and existing kind binding check; no atlas build or source approval', at:new Date().toISOString(), inputs:[bind(canonicalPath),bind(kindsPath),bind(resolve(author,'selected-ten-whole-source-duty-and-original-partner-frame.author-neutral.json')),bind(resolve(author,'five-whole-content-source-candidates.with-ten-original-clauses-and29-partners.author-input.json'))], actualCanonicalNodes:canonical.goals.length, actualActiveCurricularAtoms:atoms.size, actualFiveKindBindings:currentKinds, actualTenSourceFacets:facets, positiveEvidenceContract:actualP, errors:[], activeWrites:false, future395ScopeApproved:false, sourceProgram9Approved:false, nativeApproved:false, humanApproval:false, newStrictClosures:0}
writeFileSync(resolve(own, 'ordinary-ten-source-facets-five-current-kinds.actual.json'), JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({actualCanonicalNodes:canonical.goals.length, actualActiveCurricularAtoms:atoms.size, existingKindBindings:currentKinds.length, ordinarySourceFacets:facets.length, normalPReviewExecuted:false, errors:[]}))
