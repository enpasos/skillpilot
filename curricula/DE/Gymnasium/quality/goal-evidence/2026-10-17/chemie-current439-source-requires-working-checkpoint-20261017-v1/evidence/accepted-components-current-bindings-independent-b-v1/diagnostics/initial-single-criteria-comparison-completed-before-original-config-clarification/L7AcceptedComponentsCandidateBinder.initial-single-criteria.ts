import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, existsSync, realpathSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import {
  fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput,
  fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics,
} from './positiveGoalEvidenceProfileModel'
import {
  stockResourceDigestsForGoal, stockPositiveRepoRoot, reviewPositiveGoalEvidenceConfig,
} from './.L7-stock-positiveGoalEvidenceReview-exports'
import {
  stockMemoryGoalFingerprint, stockMemoryCardFingerprint, stockCollectMemoryDeckEvidence,
  stockValidateMemoryRecordShape, stockValidateCardRecordShape, stockMemoryRepoRoot,
  collectMemoryVisibilityReport, stockVisibleGoalIds,
} from './.L7-stock-memoryCardReview-exports'
import { getSrsFilterTags } from '../src/utils/srsTags'
import { goalMatchesFilters } from '../src/utils/goalFilters'
import { collectCompositionProjectionRoleGoalIds } from '../src/utils/authoring/compositionViewAuthoring'

// Technical serialization only. Science decisions are the accepted, sealed
// external FIRSTs. This script issues no scientific, native-D, human or M7 vote.
const scriptPath = fileURLToPath(import.meta.url)
const root = realpathSync(resolve(dirname(scriptPath), '../..'))
const outer = dirname(root)
const read = (path: string): any => JSON.parse(readFileSync(path, 'utf8'))
const sha = (x: Buffer | string): string => `sha256:${createHash('sha256').update(x).digest('hex')}`
const pin = (path: string) => ({ path, sha256: sha(readFileSync(path)), bytes: readFileSync(path).byteLength })
const meta = read(resolve(root, 'candidate-inputs/BINDER.inputs.json'))
assert.equal(root, meta.physicalRoot)
assert.equal(realpathSync(stockPositiveRepoRoot), root)
assert.equal(realpathSync(stockMemoryRepoRoot), root)
const outRel = meta.outputsRelative
const out = resolve(root, outRel)
mkdirSync(out, { recursive: true })
const write = (name: string, value: unknown) => writeFileSync(resolve(out, name), JSON.stringify(value, null, 2) + '\n')
const lines = (path: string): Array<{ record: any; line: string }> => readFileSync(path, 'utf8').split('\n').filter(x => x.trim()).map(line => ({ record: JSON.parse(line), line }))
const writeLines = (name: string, rows: Array<{line: string}>) => writeFileSync(resolve(out, name), rows.map(x => x.line).join('\n') + (rows.length ? '\n' : ''))
const today = new Date().toISOString()
const decision = read(meta.rootDecision)
assert.equal(sha(readFileSync(meta.rootDecision)), 'sha256:be4d8863ccd5edbf819d03e4f5ecb5d7ffaf4ee306c72d9d69b9fe9693829173')
const input = Object.fromEntries(Object.entries(meta.inputs).map(([key, spec]: [string, any]) => {
  const path = resolve(root, spec.path)
  assert.equal(sha(readFileSync(path)), spec.sha256, key)
  return [key, read(path)]
})) as Record<string, any>
const sourceProof = (key: string) => `${decision.inputs[key].path} @ ${decision.inputs[key].sha256}`
const sourcePair = [sourceProof('sourceA'), sourceProof('sourceB')]
const m9bPair = [sourceProof('R1and9bMemoryA'), sourceProof('R1and9bMemoryB')]
const sixPair = [sourceProof('sixRoutesA'), sourceProof('sixRoutesB')]
const quantPair = [sourceProof('quantAInformed'), sourceProof('quantTHB')]
const thPair = [sourceProof('THDiagramAFresh'), sourceProof('quantTHB')]
const eightPin = `${meta.inputs.eightAcceptance.originalPath} @ ${meta.inputs.eightAcceptance.sha256}`
const pairForEight = input.eightAcceptance.independentPairs.map((x: any) => x)
const proofPair = (p: any) => [p.A, p.B].map(x => `${x.path} @ ${x.sha256}`)
const sevenScience = proofPair(pairForEight[0])
const niScience = [...proofPair(pairForEight[1]), ...proofPair(pairForEight[2])]
const sourceA76Pair = [
  { path: 'tmp/chemie-m7-resumed-20261016/bounded-memory-and-source-successor-independent-a-v1/FIRST.SOURCE.md', sha256: 'sha256:99c1ccf729c2b284261f8f3dff99d3a1e7cd6ca0c15b5cf113467132f4fc84f1' },
  { path: 'tmp/chemie-m7-resumed-20261016/bounded-source-ten-P1-successor-independent-b-v1/FIRST.bounded-source-ten-P1-independent-b.json', sha256: 'sha256:46946b73334100822c9d4cbee68826492c95434b0aaf3cea75b5bc2e74328068' },
]
for (const proof of sourceA76Pair) assert.equal(sha(readFileSync(resolve('/home/enpasos/projects/skillpilot', proof.path))), proof.sha256)
const sourceA76Science = sourceA76Pair.map(x => `${x.path} @ ${x.sha256}`)
const reviewer = 'Codex machine technical serializer of root-accepted paired AI FIRSTs; exact executing model not exposed; human=false'
const boundary = 'Isolated inactive L7 candidate only; no new independent science or formal reviewRunId; no Human Approval, Human Trial, current native-D or M7 claim.'
const landscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const landscape = read(resolve(root, landscapePath))
const goals = new Map<string, any>(landscape.goals.map((g: any) => [g.id, g]))
assert.equal(goals.size, 650)
const memoryGoals = landscape.goals.filter((g: any) => g.nodeKind === 'memory' || (g.tags ?? []).includes('memorization') || (g.tags ?? []).some((t: string) => t.startsWith('srs-deck:')))
assert.equal(memoryGoals.length, 67)
const mConfigPath = 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json'
const mConfig = read(resolve(root, mConfigPath))
assert.equal(mConfig.scope.leafGoalIds.length, 506)
assert.equal(mConfig.visibilityScopes.length, 39)

// Actual stock SEM source fingerprint: no reimplementation or broad reclassification.
const originalSEM = read(meta.SEM641)
const oldKinds = new Map<string, any>(originalSEM.decisions.map((x: any) => [x.goalId, x]))
const kindChanges: any[] = []
const addedKinds: any[] = []
const semDecisions = landscape.goals.map((g: any) => {
  const old = oldKinds.get(g.id)
  if (!old) assert(memoryGoals.some((m: any) => m.id === g.id), `Unexpected non-Memory new SEM goal ${g.id}`)
  const sourceFingerprint = fingerprintSemanticKindSourceGoal(g)
  const result = old ? { ...old, sourceFingerprint } : {
    goalId: g.id, sourceFingerprint, semanticKind: 'memory', decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-pilot-memory',
  }
  if (!old) addedKinds.push({ goalId: g.id, sourceFingerprint, science: g.id === 'e7bd0158-16c0-51a9-a8bb-08243fc36d3c' ? sourcePair : [eightPin], authorityMeaning: 'Stock schema authoritative kind classification, not human acceptance' })
  else if (old.sourceFingerprint !== sourceFingerprint) kindChanges.push({ goalId: g.id, retainedKind: old.semanticKind, previousSourceFingerprint: old.sourceFingerprint, sourceFingerprint })
  return result
})
assert.equal(addedKinds.length, 9)
const counts = Object.fromEntries(['programStructure', 'curricularArea', 'curricularAtomic', 'orientation', 'practiceAssessment', 'memory', 'runtimeSupport'].map(k => [k, semDecisions.filter((d: any) => d.semanticKind === k).length]))
counts.total = semDecisions.length
const sem = { ...originalSEM, ledgerId: 'chemie-l7-650-accepted-components-current-bindings-20261017-v1', sourceLandscapePath: landscapePath, counts, decisions: semDecisions }
const semRel = `${outRel}/SEM650.current-source-kinds.candidate.json`
write('SEM650.current-source-kinds.candidate.json', sem)
const stockSEMPath = resolve(root, 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
mkdirSync(dirname(stockSEMPath), { recursive: true })
writeFileSync(stockSEMPath, JSON.stringify(sem, null, 2) + '\n')
const kinds = new Map(semDecisions.map((d: any) => [d.goalId, d.semanticKind]))
assert.equal(kinds.get('9b56d01e-c2d7-51d8-b78e-237592c1ed20'), 'curricularAtomic')
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const semValidator = ajv.compile(read(resolve(root, 'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json')))
const semOK = semValidator(sem)
const semSchemaErrors = semOK ? [] : structuredClone(semValidator.errors)

// Memory goal decisions: exact old lines unless accepted references or fresh9b decision changed.
const originalM = lines(meta.baselineM439)
const oldM = new Map(originalM.map(x => [x.record.goalId, x]))
const additiveM = lines(meta.currentAdditiveM439)
assert.equal(additiveM.length, 439)
const mRows: any[] = []
const mSuccessors: any[] = []
const mIdentityOnlySuccessors: any[] = []
const openMemoryBindings: any[] = []
const nineB = '9b56d01e-c2d7-51d8-b78e-237592c1ed20'
for (const { record: additive } of additiveM) {
  const original = oldM.get(additive.goalId)!
  assert(original, `Unarchived M ${additive.goalId}`)
  const goal = goals.get(additive.goalId)
  const actualFingerprint = stockMemoryGoalFingerprint(goal, mConfig.ruleVersion)
  const referencesChanged = JSON.stringify(additive.memoryGoalIds ?? []) !== JSON.stringify(original.record.memoryGoalIds ?? []) || JSON.stringify(additive.deckIds ?? []) !== JSON.stringify(original.record.deckIds ?? [])
  if (referencesChanged || additive.goalId === nineB) {
    const fresh9b = additive.goalId === nineB
    const proofs = fresh9b ? m9bPair : additive.goalId === '67cd332f-9db7-50e1-87f6-172ef3714300' ? sourcePair : additive.goalId === '4955f745-b946-5d3d-82d6-5e52dc8549a3' ? niScience : sevenScience
    const reason = fresh9b
      ? 'Fresh paired current-content M reasoning: whole angle-only9b and its actual P cases supply angles, shapes and electron-domain counts. Assessment concerns applying supplied references, qualitative lone-pair compression, comparison and model/measurement limits with fresh transfer. It introduces no new hard unaided angle/value recall. Therefore no_memory_needed, memoryUseful=false, no Memory/deck references. Existing67 remains memory_required with corrected004. '
      : 'Technical successor serializes the exact independently accepted additive compact-recall references for this unchanged memory_required owner; all historical owner/deck evidence is archived. Shared application origins do not imply prerequisites. Actual unit selectors, card contents and acquisition paths are science-bounded by the accepted paired FIRSTs; unresolved NI jurisdiction and compiled exclusions remain open. '
    const record = {
      schemaVersion: 1, reviewId: mConfig.reviewId, ruleVersion: mConfig.ruleVersion, landscapeId: mConfig.landscapeId,
      goalId: additive.goalId, fingerprint: actualFingerprint,
      status: fresh9b ? 'no_memory_needed' : additive.status, memoryUseful: fresh9b ? false : additive.memoryUseful,
      memoryGoalIds: fresh9b ? [] : additive.memoryGoalIds ?? [], deckIds: fresh9b ? [] : additive.deckIds ?? [],
      reviewedAt: today, reviewer, reason: reason + 'Accepted science pins: ' + proofs.join('; ') + '. ' + boundary,
    }
    const previousRefs = original.record.memoryGoalIds ?? []
    mSuccessors.push({ goalId: additive.goalId, kind: fresh9b ? 'fresh-content-no-memory-decision' : 'accepted-reference-successor', previousFingerprint: original.record.fingerprint, fingerprint: actualFingerprint, previousMemoryGoalIds: previousRefs, memoryGoalIds: record.memoryGoalIds, removedReferenceIds: previousRefs.filter((x: string) => !record.memoryGoalIds.includes(x)), science: proofs, oldReviewRunIdentifiersArchivedNotTransferred: true })
    mRows.push({ record, line: JSON.stringify(record) })
  } else {
    if (original.record.fingerprint !== actualFingerprint) openMemoryBindings.push({ goalId: additive.goalId, actualFingerprint, historicalFingerprint: original.record.fingerprint, reason: 'Outside accepted M reference/fresh9b successor scope; original line archived, not rebound automatically', originalReview: { reviewId: original.record.reviewId, reviewer: original.record.reviewer, reviewedAt: original.record.reviewedAt, firstJudgmentsSeal: original.record.firstJudgmentsSeal, scientificDecisionSource: original.record.scientificDecisionSource } })
    if (original.record.reviewId !== mConfig.reviewId && original.record.fingerprint === actualFingerprint) {
      const record = { ...original.record, reviewId: mConfig.reviewId, reason: original.record.reason + ' Technical ledger-identity adaptation only to canonical-chemistry-full for this isolated candidate on ' + today + '; original local reviewId ' + original.record.reviewId + ', exact original whole line, original science date and reviewer remain archived. Goal, fingerprint, scientific disposition and original science evidence are unchanged; serializer issues no new science/human vote.' }
      mIdentityOnlySuccessors.push({ goalId: additive.goalId, field: 'reviewId', previous: original.record.reviewId, current: record.reviewId, originalScienceReason: original.record.reason, actualFingerprint, originalReviewDateAndReviewerPreserved: true, newScienceVote: false })
      mRows.push({ record, line: JSON.stringify(record) })
    } else mRows.push(original)
  }
}
assert.equal(mSuccessors.length, 11)
writeLines('M439.current439-with-accepted11-successors.candidate.jsonl', mRows)
mConfig.reviewPath = `${outRel}/M439.current439-with-accepted11-successors.candidate.jsonl`
mConfig.cardReviewPath = `${outRel}/cards80.current-with-five-successors.candidate.jsonl`
mConfig.reportPath = `${outRel}/M.finite-technical-not-full-review.md`
const mById = new Map(mRows.map(x => [x.record.goalId, x.record]))
const deckEvidence = stockCollectMemoryDeckEvidence(landscape)
const cardMap = new Map<string, any>()
for (const card of deckEvidence.primaryCards) {
  const key = `${card.deckId}::${card.cardId}`
  const previous = cardMap.get(key)
  if (previous) assert.equal(stockMemoryCardFingerprint(previous, mConfig.ruleVersion), stockMemoryCardFingerprint(card, mConfig.ruleVersion), `Inconsistent deck duplicate ${key}`)
  cardMap.set(key, card)
}
assert.equal(cardMap.size, 80)
const oldCards = lines(meta.card79)
const oldCardByKey = new Map(oldCards.map(x => [`${x.record.deckId}::${x.record.cardId}`, x]))
const changedExistingCardIds = new Set(['chem_basics_006', 'chem_bond_004', 'chem_bond_008', 'chem_org_q1_007'])
const cardRows: any[] = []
const cardSuccessors: any[] = []
const openCardBindings: any[] = []
for (const [key, card] of cardMap) {
  const actualFingerprint = stockMemoryCardFingerprint(card, mConfig.ruleVersion)
  const old = oldCardByKey.get(key)
  const changed = !old || changedExistingCardIds.has(card.cardId)
  if (changed) {
    const proofs = card.cardId === 'chem_bond_004' ? sourcePair : old ? sevenScience : niScience
    const origins = old?.record.originGoalIds ?? card.tags.filter((t: string) => t.startsWith('goal:')).map((t: string) => t.slice(5))
    const record = {
      schemaVersion: 1, reviewId: mConfig.reviewId, ruleVersion: mConfig.ruleVersion, landscapeId: mConfig.landscapeId,
      deckId: card.deckId, cardId: card.cardId, fingerprint: actualFingerprint, status: 'kept', necessary: true,
      originGoalIds: origins, reviewedAt: today, reviewer,
      reason: 'Current whole-card content bound to actual physical primary deck bytes through the unchanged stock normalization/fingerprint function. Kept compact recall and all global origins are the exact root-accepted paired science scope. Actual changed field: ' + (card.cardId === 'chem_basics_006' ? 'front' : old ? 'back' : 'new whole NI card, isolated select tag without broad LK tag') + '. No historical release or human approval transfers. Accepted pins: ' + proofs.join('; ') + '. ' + boundary,
    }
    cardRows.push({ record, line: JSON.stringify(record) })
    cardSuccessors.push({ key, changedField: card.cardId === 'chem_basics_006' ? 'front' : old ? 'back' : 'new-card', originalFingerprint: old?.record.fingerprint ?? null, actualFingerprint, originGoalIds: origins, science: proofs, originalWholeReviewLineArchived: !!old })
  } else {
    if (old.record.fingerprint !== actualFingerprint) openCardBindings.push({ key, historicalFingerprint: old.record.fingerprint, actualFingerprint, reason: 'Outside five accepted successor cards; no blind fingerprint update' })
    cardRows.push(old)
  }
}
assert.equal(cardSuccessors.length, 5)
writeLines('cards80.current-with-five-successors.candidate.jsonl', cardRows)
writeFileSync(resolve(root, mConfigPath), JSON.stringify(mConfig, null, 2) + '\n')
write('M506-scope-39views.candidate.config.json', mConfig)
const mShapeErrors = mRows.flatMap(x => stockValidateMemoryRecordShape(x.record, mConfig, goals, deckEvidence))
const cardShapeErrors = cardRows.flatMap(x => stockValidateCardRecordShape(x.record, mConfig, goals, mById))

// Selectors use actual SRS select-tag extraction and exact Drill OR condition.
// This is a finite data check, not invocation of the full M gate.
const selectors = memoryGoals.map((g: any) => {
  const filterTags = getSrsFilterTags(g.tags)
  const source = g.extendedData?.vocabularySource
  assert(typeof source === 'string', `No primary vocabulary ${g.id}`)
  const path = source.startsWith('/data/') ? resolve(root, 'app/public', source.slice(1)) : resolve(root, source.replace(/^\//, ''))
  const deck = read(path)
  const selected = deck.cards.filter((c: any) => !filterTags.length || (c.tags && c.tags.some((t: string) => filterTags.includes(t))))
  return { goalId: g.id, filterTags, actualCardIds: selected.map((c: any) => c.id).sort(), source, sourceDigest: pin(path), GK: goalMatchesFilters(g, ['GK']), LK: goalMatchesFilters(g, ['LK']), applicability: g.applicability, requires: g.requires ?? [] }
})
assert(selectors.every((s: any) => s.actualCardIds.length > 0))
const EPA = selectors.find((s: any) => s.goalId === 'e7bd0158-16c0-51a9-a8bb-08243fc36d3c')!
assert.deepEqual(EPA.actualCardIds, ['chem_bond_004'])
const NI = selectors.find((s: any) => s.goalId === 'd3e04497-93bf-5e9c-a707-19cae50a2b3f')!
assert.deepEqual(NI.actualCardIds, ['chem_polymer_chain_conformation'])
assert.equal(NI.GK, false)
assert.equal(NI.LK, true)
const broadOrganicAdoption = selectors.filter((s: any) => s.goalId !== NI.goalId && s.actualCardIds.includes('chem_polymer_chain_conformation'))
assert.equal(broadOrganicAdoption.length, 0)
const previousFinitePath = resolve('/home/enpasos/projects/skillpilot', decision.inputs.actual67SelectorsAnd809MemoryPaths.path)
assert.equal(sha(readFileSync(previousFinitePath)), decision.inputs.actual67SelectorsAnd809MemoryPaths.sha256)
const previousSelectorRows = new Map<string, any>(read(previousFinitePath).selectorRows.map((x: any) => [x.goalId, x]))
const previousSelectionDifferences = selectors.filter((s: any) => JSON.stringify(s.actualCardIds) !== JSON.stringify([...(previousSelectorRows.get(s.goalId)?.actualCardIds ?? [])].sort()))
const visibility = collectMemoryVisibilityReport(mConfig, goals, mRows.map(x => x.record))
const pathRows: any[] = []
const missingPaths: any[] = []
for (const scope of mConfig.visibilityScopes) {
  const raw = stockVisibleGoalIds(scope.viewPath, goals)
  assert.equal(raw.errors.length, 0)
  const view = read(resolve(root, scope.viewPath))
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals)
  const roleAll = new Set<string>([...roles.targetGoalIds, ...roles.prerequisiteOnlyGoalIds].filter(id => goalMatchesFilters(goals.get(id), view.scope?.courseProfile)))
  for (const m of memoryGoals.filter((g: any) => raw.visibleGoalIds.has(g.id))) {
    const seen = new Set<string>()
    const visit = (id: string) => { if (seen.has(id)) return; seen.add(id); for (const prior of goals.get(id)?.requires ?? []) visit(prior) }
    for (const id of m.requires ?? []) visit(id)
    const absent = [...seen].filter(id => !roleAll.has(id))
    const row = { scope: scope.label, memoryGoalId: m.id, directRequires: m.requires ?? [], checkedTransitivePriorIds: [...seen].sort(), absentIds: absent.sort(), semantics: 'Raw authored role/path presence only; compiled jurisdiction eligibility is separately unresolved' }
    pathRows.push(row)
    if (absent.length) missingPaths.push(row)
  }
}

// P9 use accepted profiles unchanged, actual semantic kind, actual resource bytes.
const profiles = new Map<string, { profile: any; input: string; science: string[] }>()
for (const d of input.sourceFive.wholeFivePProfileDeltas) profiles.set(d.goalId, { profile: d.afterProfile, input: 'sourceFive', science: sourcePair })
profiles.set(input.source95dcR1.wholeUnchangedCanonicalGoal.id, { profile: input.source95dcR1.wholeProfileAfter, input: 'source95dcR1', science: m9bPair })
profiles.set(input.sourceQuant.whole4a08GoalAfterPrior.id, { profile: input.sourceQuant.wholeProposedQuantitativeProfile, input: 'sourceQuant', science: quantPair })
profiles.set(input.sourceTH.wholeUnchanged4928Goal.id, { profile: input.sourceTH.wholeProposed4928Profile, input: 'sourceTH', science: thPair })
const p801 = input.source801.proposedSixPositiveProfiles.find((x: any) => x.goalId === '801790f9-be3a-51fe-9b0f-3452c1bba887')
profiles.set(p801.goalId, { profile: p801.profile, input: 'source801', science: sixPair })
profiles.set(input.sourceA76.goalId, { profile: input.sourceA76.profile, input: 'sourceA76', science: sourceA76Science })
assert.equal(profiles.size, 9)
const criteriaPath = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md'
const criteriaFingerprint = sha(readFileSync(resolve(root, criteriaPath)))
const reviewId = 'chemie-l7-accepted-nine-positive-candidate-20261017-v1'
const pRows: any[] = []
const pMaterialized: any[] = []
const pSchemaErrors: any[] = []
const pSemanticErrors: any[] = []
const pValidator = ajv.compile(read(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
for (const [goalId, accepted] of profiles) {
  const goal = goals.get(goalId)
  const resourceState = stockResourceDigestsForGoal(goal, new Set(['goal-visualization']))
  assert.equal(resourceState.errors.length, 0, resourceState.errors.join('\n'))
  const record = {
    $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json', schemaVersion: 2,
    reviewId, goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2',
    reviewCriteriaFingerprint: criteriaFingerprint, landscapeId: landscape.landscapeId, goalId,
    goalFingerprint: fingerprintGoalForPositiveEvidence(goal, kinds.get(goalId)),
    reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFingerprint, resourceState.digests, kinds.get(goalId)),
    profileFingerprint: fingerprintPositiveGoalEvidenceProfile(accepted.profile),
    status: 'needs_human_review', reviewAuthority: 'ai_candidate', reviewedAt: today, reviewer,
    reason: 'Exact unchanged accepted whole profile from content input ' + meta.inputs[accepted.input].originalPath + ' @ ' + meta.inputs[accepted.input].sha256 + '; paired science: ' + accepted.science.join('; ') + '. Actual current goal, reviewed-resource bytes and profile fingerprints computed by unchanged stock functions in this physical capsule. This is technical serialization, not a new scientific vote. Scoped source requirements and source optionality remain separate exact-bound context. ' + boundary,
    evidenceLevel: 'E1', maximumClaimScope: 'G1', reviewRunIds: [], dissent: [], profile: accepted.profile,
  }
  if (!pValidator(record)) pSchemaErrors.push({ goalId, errors: structuredClone(pValidator.errors) })
  pSemanticErrors.push(...validatePositiveGoalEvidenceRecordSemantics(record, goal, resourceState.digests, kinds.get(goalId)))
  pRows.push({ record, line: JSON.stringify(record) })
  pMaterialized.push({ goalId, goalFingerprint: record.goalFingerprint, reviewInputFingerprint: record.reviewInputFingerprint, profileFingerprint: record.profileFingerprint, input: meta.inputs[accepted.input], pairedScience: accepted.science, resourceDigests: resourceState.digests, oldFormalRunIdsTransferred: false })
}
writeLines('P9.current-accepted-profiles.ai-candidate.jsonl', pRows)
const pConfig = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json', schemaVersion: 2,
  reviewId, goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2',
  landscapeId: landscape.landscapeId, landscapePath, semanticKindLedgerPath: semRel, reviewCriteriaPath: criteriaPath,
  reviewPath: `${outRel}/P9.current-accepted-profiles.ai-candidate.jsonl`, reviewedResourceTypes: ['goal-visualization'],
  requireApproved: false, reviewRunManifestPaths: [], scope: { label: 'Exact nine accepted current profiles, technical candidate only', goalIds: [...profiles.keys()] },
}
write('P9.current-bound.candidate.config.json', pConfig)
const nativeP9 = reviewPositiveGoalEvidenceConfig(`${outRel}/P9.current-bound.candidate.config.json`)
const oldP = lines(meta.P439)
assert.equal(oldP.length, 439)
const eligibleRetainedP: any[] = []
const openPBindings: any[] = []
const outsideChecks: any[] = []
for (const old of oldP.filter(x => !profiles.has(x.record.goalId))) {
  const r = old.record
  const goal = goals.get(r.goalId)
  const state = goal ? stockResourceDigestsForGoal(goal, new Set(['goal-visualization'])) : { digests: {}, errors: ['Missing current goal'] }
  const actual = goal ? {
    goalFingerprint: fingerprintGoalForPositiveEvidence(goal, kinds.get(r.goalId)),
    reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFingerprint, state.digests, kinds.get(r.goalId)),
    profileFingerprint: fingerprintPositiveGoalEvidenceProfile(r.profile),
    reviewCriteriaFingerprint: criteriaFingerprint,
  } : null
  const changedFields = actual ? Object.entries(actual).filter(([k, v]) => r[k] !== v).map(([k]) => k) : ['missing-goal']
  const recordSchemaOK = pValidator(r)
  const check = { goalId: r.goalId, originalReviewId: r.reviewId, currentFPMatches: changedFields.length === 0 && !state.errors.length, changedFields, resourceErrors: state.errors, schemaValid: !!recordSchemaOK, oldReviewRunIds: r.reviewRunIds ?? [] }
  outsideChecks.push(check)
  if (!changedFields.length && !state.errors.length && recordSchemaOK) eligibleRetainedP.push(old)
  else openPBindings.push({ ...check, historicalFingerprints: Object.fromEntries(['goalFingerprint','reviewInputFingerprint','profileFingerprint','reviewCriteriaFingerprint'].map(k => [k,r[k]])), actualStockFingerprints: actual, originalReviewer: r.reviewer, originalReviewedAt: r.reviewedAt, originalReason: r.reason, archivedWholeLineSource: meta.P439, originalSciencePathStatus: 'Original whole record and any embedded source/FIRST/run references preserved; no new source/review authority inferred from a fingerprint check', action: 'Original whole line remains historical only; excluded from current-eligible combined draft. Requires separately authorized substantive current binding.' })
}
assert.equal(outsideChecks.length, 430)
writeLines('P430.exact-original-lines-current-FP-matching-only.candidate.jsonl', eligibleRetainedP)
writeLines('P.current-eligible-retained-plus-nine.candidate.jsonl', [...eligibleRetainedP, ...pRows])
write('P430.actual-stock-FP-comparison.no-review-authority-transfer.json', outsideChecks)
write('OPEN.P-outside-nine-current-bindings.json', openPBindings)

// Exact scoped contracts / source statuses are candidate bindings, not a new
// runtime field, blanket official duty, or claim of source-case enforcement.
write('SOURCE.scoped-cases-and-primary-status.current-P9-binding-drafts.json', {
  role: 'Technical current-fingerprint bindings to accepted content-only source contracts; runtime enforcement and source D checks remain pending',
  atUTC: today, P9: pMaterialized,
  sourceFiveContracts: input.sourceFive.scopedSourceCaseRequirements,
  BY587R1AuthoritativeSuccessorWithinAcceptedCandidate: input.source95dcR1.sourceCaseContractAfter,
  supersededBY587GlobalRequirementNotOperative: true,
  quantitativePrimaryCitationAndStatus: input.sourceQuant.currentProposedPrimaryCitationAndStatusRecords,
  TH44ColumnStatus: input.sourceTH.literalHistoricalSource44AndCurrentColumnCitation,
  noSelectionOrUniversalGKDutiesInferred: true,
  noFormalNativeD: true, noNewRuntimeOrSchemaFields: true, HumanApproval: false, M7: false,
})
const stockAdapters = ['memoryCardReview', 'positiveGoalEvidenceReview'].map(name => {
  const stock = resolve(root, `app/scripts/${name}.ts`)
  const adapter = resolve(root, `app/scripts/.L7-stock-${name}-exports.ts`)
  const bytes = readFileSync(stock)
  assert(readFileSync(adapter).subarray(0, bytes.length).equals(bytes))
  return { original: pin(stock), adapter: pin(adapter), originalBytePrefixExact: true, modification: 'Appended exports only; original module bytes unchanged', realModuleRoot: root }
})
const result = {
  atUTC: today, role: 'Isolated technical accepted-components candidate binding draft; no new science vote', physicalRoot: root, physicalScriptPath: realpathSync(scriptPath),
  rootDecision: pin(meta.rootDecision), canonical: pin(resolve(root, landscapePath)), inputPins: meta.inputs,
  dimensions: { canonicalGoals: goals.size, ordinaryGoals: mRows.length, memoryGoals: memoryGoals.length, memoryScope: mConfig.scope.leafGoalIds.length, views: mConfig.visibilityScopes.length, cards: cardMap.size },
  SEM: { schemaValid: !!semOK, schemaErrors: semSchemaErrors, preservedClassificationCount: oldKinds.size, addedMemoryClassifications: addedKinds, retainedKindsWithUpdatedActualSourceFP: kindChanges, counts },
  Memory: { exactHistoricalLinesRetained: mRows.length - mSuccessors.length - mIdentityOnlySuccessors.length, currentSuccessors: mSuccessors, identityOnlySuccessors: mIdentityOnlySuccessors, openBindings: openMemoryBindings, shapeErrors: mShapeErrors, deckEvidenceErrors: deckEvidence.errors, finiteOwnerVisibility: visibility },
  cards: { exactHistoricalLinesRetained: cardRows.length - cardSuccessors.length, currentSuccessors: cardSuccessors, openBindings: openCardBindings, shapeErrors: cardShapeErrors, primaryNormalizedUniqueCards: cardMap.size },
  P9: { count: pRows.length, schemaErrors: pSchemaErrors, semanticErrors: pSemanticErrors, nativeStockBoundedConfigErrors: nativeP9.errors, nativeStockCounts: nativeP9.counts, materialized: pMaterialized },
  outsideP9: { checked: outsideChecks.length, exactHistoricalLinesCurrentFPEligible: eligibleRetainedP.length, openBindings: openPBindings.length, noBlindUpdate: true, original439Archive: pin(meta.P439), noNewScienceOrRunAuthorityForRetainedLines: true },
  selectorFinite: { checked: selectors.length, all67Nonempty: true, all67MatchAcceptedPriorFiniteIDSets: previousSelectionDifferences.length === 0, previousFinitePin: pin(previousFinitePath), priorSelectionDifferences: previousSelectionDifferences, EPA, NI, broadOrganicNIAdoption: broadOrganicAdoption, compiledNIJurisdictionUnresolved: true, fullM: false },
  rawMemoryPathFinite: { checked: pathRows.length, missingPathRows: missingPaths.length, rawOnlyNotCompiledScopeAcceptance: true },
  stockAdapters, criteria: pin(resolve(root, criteriaPath)), stockSourceFingerprintNormalizationProfile: pin(resolve(root, 'contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json')),
  stillOpen: ['NI4955/d3 source/acquisition jurisdiction; no APV27 overrides applied', '160 compiled frontend exclusions retain separate runtime/source classification', 'Any listed outside-P9 or M/card mismatches require real authorized successor bindings', 'Scoped source-case runtime enforcement and current source-status integration', 'Formal current native D/context and changed9b atomicity/source bindings', 'Full strict D/P/A/M/V, central439, CQR303/M7 and protected-floor checks not run'],
  fullM: false, fullAPV: false, fullCentral: false, fullNativeD: false, fullBuild: false, normalOrL6WritesByThisBinder: 0, newFormalReviewRunIds: [], newFiveGateClosures: 0, HumanApproval: false, HumanTrial: false, M7: false,
}
write('FINITE.selectors67-and-raw-Memory-paths39views.json', { atUTC: today, selectors, routeRows: pathRows, missingPaths, rawOnlyNoCompiledAcceptance: true })
write('PROVENANCE.current-successors-and-archived-science.json', { atUTC: today, rootDecision: pin(meta.rootDecision), pairForEight, sourceA76Pair, SEMKindClassificationScopeOnly: true, newMemoryKinds: addedKinds, SEMUpdatedSourceFP: kindChanges, memorySuccessors: mSuccessors, memoryIdentityOnlySuccessors: mIdentityOnlySuccessors, cardSuccessors, P9: pMaterialized, executingModel: 'unknown-not-exposed', serializerIssuedNewScientificVote: false, inheritedRunIdentifiersForChangedRecords: [], HumanApproval: false, HumanTrial: false })
write('RESULT.technical-bindings-and-open-holds.json', result)
const blockingErrors = [ ...semSchemaErrors, ...mShapeErrors, ...cardShapeErrors, ...deckEvidence.errors, ...pSchemaErrors, ...pSemanticErrors, ...nativeP9.errors, ...previousSelectionDifferences ]
console.log(JSON.stringify({ physicalRoot: root, dimensions: result.dimensions, technicalValidationErrors: blockingErrors.length, SEMAdded: addedKinds.length, MSuccessors: mSuccessors.length, cardSuccessors: cardSuccessors.length, P9: pRows.length, P430CurrentFPEligible: eligibleRetainedP.length, outsideP9Open: openPBindings.length, openMemory: openMemoryBindings.length, openCards: openCardBindings.length, ownerVisibilityErrors: visibility.errors.length, rawPaths: pathRows.length, missingRawPaths: missingPaths.length, resultPath: resolve(out, 'RESULT.technical-bindings-and-open-holds.json') }, null, 2))
if (blockingErrors.length) process.exitCode = 1
