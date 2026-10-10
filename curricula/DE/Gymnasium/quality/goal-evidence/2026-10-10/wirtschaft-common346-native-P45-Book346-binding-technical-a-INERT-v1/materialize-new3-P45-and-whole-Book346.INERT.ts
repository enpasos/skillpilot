import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile,
  validatePositiveGoalEvidenceRecordSemantics, POSITIVE_GOAL_EVIDENCE_SCHEMA_URL, POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,
  POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION, POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview'
import { loadGoalBookBuildInputs, parseAndValidateGoalBookModel } from '../../../../../../../app/scripts/goalBookModel'

// Own additive technical outputs only. Existing343 profile bodies remain exact;
// final ten explicitly disclosed applicability-only normalization/source corrections are reported honestly.
const out = dirname(fileURLToPath(import.meta.url)), root = resolve(out, '../../../../../../..')
const relOut = relative(root, out), q = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/'
const previous = q + 'wirtschaft-common343-native-P44-Book343-binding-technical-a-INERT-v1/'
const startedAt = new Date().toISOString()
const inputs = new Map<string, any>()
const sha = (b: Buffer | string) => 'sha256:' + createHash('sha256').update(b).digest('hex')
function bytes(p: string): Buffer { const b = readFileSync(resolve(root, p)); if (!inputs.has(p)) inputs.set(p, { path: p, sha256: sha(b), bytes: b.length }); return b }
function json(p: string): any { return JSON.parse(bytes(p).toString('utf8')) }
function write(name: string, value: any) { const path = resolve(out, name); if (relative(out, path).startsWith('..') || existsSync(path)) throw new Error('Own fresh output only: ' + path); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n') }
function arg(name: string) { const value = process.argv.find(v => v.startsWith('--' + name + '='))?.slice(name.length + 3); if (!value) throw new Error('Required --' + name); return value }
const stable = (x: any) => JSON.stringify(x)
const lines = (p: string) => bytes(p).toString('utf8').split(/\r?\n/).filter(v => v.trim()).map(raw => ({ raw, record: JSON.parse(raw) }))

async function main() {
  const codePaths = ['app/scripts/positiveGoalEvidenceProfileModel.ts', 'app/scripts/goalEvidenceProfileModel.ts', 'app/scripts/positiveGoalEvidenceReview.ts', 'app/scripts/goalBookModel.ts', 'app/scripts/goalBookEvidenceReviewLoader.ts', 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json', 'contracts/goal-book/v1/goal-book-model-1.1.schema.json', 'app/node_modules/tsx/dist/cli.mjs', 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json', 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json']
  codePaths.forEach(p => bytes(p))
  const corePath = arg('core'), semanticPath = arg('semantic'), positivePath = arg('positive'), criteriaPath = arg('criteria'), authorSeal = arg('author-seal'), scienceReceipt = arg('science')
  bytes(authorSeal); bytes(scienceReceipt)
  const commonOld = q + 'wirtschaft-common343-M6-fieldwise-composition-AUTHOR-INERT-v1/'
  const oldCorePath = commonOld + 'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
  const oldSemanticPath = commonOld + 'semantic689.candidate-bound.INERT.json'
  if (sha(bytes(oldCorePath)) !== 'sha256:698a7b95e35e0fb6988a74d344a563557ea232ab17728306f4a91744b8b0fc5e') throw new Error('Historical core changed')
  if (sha(bytes(oldSemanticPath)) !== 'sha256:d2509e73d7a2aa94fbccdcb470cae1880575ebd5b30d9a64ee8d3a2975cd6f88') throw new Error('Historical SEM changed')
  bytes(previous + 'actual-native-P343-Book343-44configs-after-main-a866-all-exact.SEALED.receipt.json')
  const oldCore = json(oldCorePath), oldSem = json(oldSemanticPath), core = json(corePath), sem = json(semanticPath)
  const oldGoalByID = new Map<string, any>(oldCore.goals.map((g: any) => [g.id, g])), goalByID = new Map<string, any>(core.goals.map((g: any) => [g.id, g]))
  const kindByID = new Map<string, string>(sem.decisions.filter((d: any) => d.decisionStatus === 'authoritative').map((d: any) => [d.goalId, d.semanticKind]))
  const oldKinds = new Map<string, string>(oldSem.decisions.filter((d: any) => d.decisionStatus === 'authoritative').map((d: any) => [d.goalId, d.semanticKind]))
  const ordinary = [...kindByID].filter(([, kind]) => kind === 'curricularAtomic').map(([id]) => id)
  if (ordinary.length !== 346 || sem.sourceLandscapeId !== core.landscapeId) throw new Error('Actual current ordinary universe must346')
  const oldCombinedPath = previous + 'whole343.qualified-profile-bodies-common689-native-bindings.INERT.jsonl'
  const oldCombinedBytes = bytes(oldCombinedPath), oldCombinedLines = lines(oldCombinedPath)
  if (oldCombinedLines.length !== 343) throw new Error('Historical whole343 missing')
  const oldIds = new Set(oldCombinedLines.map(l => l.record.goalId)), novel = ordinary.filter(id => !oldIds.has(id))
  if (novel.length !== 3) throw new Error('Expected exactly three new ordinary goals')
  let positive: any
  if (positivePath.endsWith('.jsonl')) positive = { goals: lines(positivePath).map(l => l.record) }
  else positive = json(positivePath)
  const sourceRecords: any[] = Array.isArray(positive) ? positive : positive.goals ?? positive.records
  if (!Array.isArray(sourceRecords)) throw new Error('Expected whole supplied three-profile records/spec')
  const sourceByID = new Map<string, any>(sourceRecords.map(g => [g.goalId, g]))
  if (novel.some(id => !sourceByID.has(id))) throw new Error('Three qualified whole profile bodies absent')
  const oldReceipt = json(previous + 'actual-P343-native-binding-body-reuse-and-book343.READONLY.receipt.json')
  if (oldReceipt.configPaths.length !== 44) throw new Error('Expected old44 exact configs')
  const configPaths: string[] = [], parity: any[] = [], oldScopeProof: any[] = []
  const allowedScopeDeltas = new Map([
    ['410e7ab4-a4ef-5090-8d4c-11a28372082d', 'remove-BB'],
    ['a5009946-62bb-5e6a-8c92-732d02e8fd70', 'remove-BB'],
    ['fab48742-756b-564d-87ef-cd6f3c75f348', 'add-BB'],
    ['f9132615-8166-5e42-ad04-d8b2b75d719d', 'add-NI'],
    ['676684da-5ba2-5c2a-ba7e-a8413915c29c', 'add-NI'],
    ['d17ff931-085d-56be-932d-3839b5b88ba8', 'add-BE'],
    ['dae93971-726c-56e5-8044-19dbd40febf7', 'add-MV-SH'],
    ['79d244e0-049e-59e9-a2fb-b8f8670b315a', 'sort-only'],
    ['da73483a-2c18-5d42-b4f3-6ac6bcd6b5b0', 'sort-only'],
    ['776457c2-8bb3-53b9-838b-a028319175fb', 'sort-only'],
  ])
  for (let i = 0; i < oldReceipt.configPaths.length; i++) {
    const path = oldReceipt.configPaths[i], before = json(path), c = structuredClone(before), n = String(i + 1).padStart(2, '0')
    const criteriaFP = sha(bytes(c.reviewCriteriaPath)), types = new Set(c.reviewedResourceTypes)
    for (const { record } of lines(c.reviewPath)) {
      const goal = goalByID.get(record.goalId), oldGoal = oldGoalByID.get(record.goalId), kind = kindByID.get(record.goalId)
      if (!goal || !oldGoal || kind !== oldKinds.get(record.goalId) || kind !== 'curricularAtomic') throw new Error(record.goalId + ': historical goal/semantic kind absent or changed')
      const wholeGoalExact = stable(goal) === stable(oldGoal)
      let applicabilityDelta: any = null
      if (!wholeGoalExact) {
        const oldOutsideApp = { ...oldGoal }; delete oldOutsideApp.applicability
        const currentOutsideApp = { ...goal }; delete currentOutsideApp.applicability
        const direction = allowedScopeDeltas.get(record.goalId)
        const oldApp = oldGoal.applicability, currentApp = goal.applicability
        const additions = direction === 'add-BB' ? ['DE-BB'] : direction === 'add-NI' ? ['DE-NI'] : direction === 'add-BE' ? ['DE-BE'] : direction === 'add-MV-SH' ? ['DE-MV', 'DE-SH'] : []
        const expectedJurisdiction = [...new Set<string>([...oldApp.jurisdiction.filter((j: string) => direction !== 'remove-BB' || j !== 'DE-BB'), ...additions])].sort()
        if (!direction || stable(oldOutsideApp) !== stable(currentOutsideApp) || stable(currentApp) !== stable({ ...oldApp, jurisdiction: expectedJurisdiction })) throw new Error(record.goalId + ': unexpected historical whole-goal change')
        applicabilityDelta = { direction, before: oldApp, after: currentApp, outsideApplicabilityWholeExact: true, nativePositivePayloadDoesNotConsumeApplicability: true }
      }
      const assets: Record<string, string> = {}
      if (types.has('goal-visualization')) for (const link of goal.resourceLinks ?? []) if (link.type === 'goal-visualization') assets[link.url] = sha(bytes('app/public' + link.url))
      if (record.goalFingerprint !== fingerprintGoalForPositiveEvidence(goal, kind) || record.reviewInputFingerprint !== fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFP, assets, kind) || record.profileFingerprint !== fingerprintPositiveGoalEvidenceProfile(record.profile) || record.reviewCriteriaFingerprint !== criteriaFP) throw new Error(record.goalId + ': native per-record parity changed')
      parity.push({ goalId: record.goalId, wholeGoalExact, applicabilityOnlyQualifiedSourceScopeDelta: applicabilityDelta, semanticKindExact: true, resourceDigests: assets, nativeGoalFingerprintExact: true, nativeReviewInputFingerprintExact: true, nativeProfileFingerprintExact: true, recordLineUnchanged: true, retainedReviewPath: c.reviewPath })
    }
    c.landscapePath = corePath; c.semanticKindLedgerPath = semanticPath
    const changedKeys = Object.keys(c).filter(k => stable(c[k]) !== stable(before[k]))
    if (changedKeys.some(k => !['landscapePath', 'semanticKindLedgerPath'].includes(k))) throw new Error('Old config contract changed')
    const target = relOut + '/configs/' + n + '.old-scope-exact-current-core-SEM.INERT.config.json'
    write('configs/' + n + '.old-scope-exact-current-core-SEM.INERT.config.json', c); configPaths.push(target)
    oldScopeProof.push({ previousConfigPath: path, currentConfigPath: target, scopeWholeExact: stable(c.scope) === stable(before.scope), reviewPathAndWholeJSONLBytesUnchanged: true, onlyPointerKeysChanged: changedKeys })
  }
  if (parity.length !== 343 || new Set(parity.map(p => p.goalId)).size !== 343) throw new Error('Old343 parity incomplete')
  if (parity.filter(p => !p.wholeGoalExact).length !== 10 || parity.filter(p => p.wholeGoalExact).length !== 333) throw new Error('Expected exactly333 whole-exact and ten disclosed applicability-only ordinary deltas')
  const template = json(oldReceipt.configPaths[43]), criteriaFP = sha(bytes(criteriaPath))
  const config45 = { ...template, reviewId: 'wirtschaft-three-bb-personal-qualified-p346-native-binding-20261010-v1', landscapePath: corePath, semanticKindLedgerPath: semanticPath,
    reviewPath: relOut + '/positive/45.three-whole-qualified-personal-current-native-bindings.INERT.jsonl', reviewCriteriaPath: criteriaPath, reviewedResourceTypes: [], requireApproved: false,
    scope: { label: 'Three independently reviewed BB selected Personal whole AI candidate profiles; E1/G1, human review pending', goalIds: novel } }
  const newRecords = novel.map(id => {
    const src = sourceByID.get(id), goal = goalByID.get(id), kind = kindByID.get(id)!, profile = src.profile
    if (!profile) throw new Error(id + ': whole profile absent')
    const r: any = { $schema: POSITIVE_GOAL_EVIDENCE_SCHEMA_URL, schemaVersion: POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION, landscapeId: core.landscapeId, goalId: id,
      reviewId: config45.reviewId, status: 'needs_human_review', reviewAuthority: 'ai_candidate', evidenceLevel: 'E1', maximumClaimScope: 'G1', reviewRunIds: [], dissent: src.dissent ?? [],
      reason: src.reason ?? 'Independently qualified whole AI candidate profile body; native technical current binding only. Human review remains pending.',
      reviewer: src.reviewer ?? positive.reviewer ?? '/root/economics_final56_current_round_a; native technical binding of separately qualified AI author candidate', reviewedAt: src.reviewedAt ?? positive.reviewedAt ?? new Date().toISOString(),
      goalFingerprintRuleVersion: POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION, profileRuleVersion: POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
      reviewCriteriaFingerprint: criteriaFP, goalFingerprint: fingerprintGoalForPositiveEvidence(goal, kind), reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFP, {}, kind), profileFingerprint: fingerprintPositiveGoalEvidenceProfile(profile), profile }
    const errors = validatePositiveGoalEvidenceRecordSemantics(r, goal, {}, kind)
    if (errors.length) throw new Error(errors.join('\n'))
    if (stable(r.profile) !== stable(src.profile)) throw new Error('Whole source body changed')
    return r
  })
  const newText = newRecords.map(r => JSON.stringify(r)).join('\n') + '\n'
  write('positive/45.three-whole-qualified-personal-current-native-bindings.INERT.jsonl', newText)
  const config45Path = relOut + '/configs/45.three-new-whole-personal-current-native-bindings.INERT.config.json'
  write('configs/45.three-new-whole-personal-current-native-bindings.INERT.config.json', config45); configPaths.push(config45Path)
  const nativeNew3 = reviewPositiveGoalEvidenceConfig(config45Path)
  if (nativeNew3.errors.length || nativeNew3.records.length !== 3) throw new Error(nativeNew3.errors.join('\n') || 'New three native records missing')
  if (!oldCombinedBytes.toString().endsWith('\n')) throw new Error('Historical whole343 newline boundary absent')
  const combinedPath = relOut + '/whole346.old343-byte-prefix-plus-three-qualified-current-records.INERT.jsonl'
  write('whole346.old343-byte-prefix-plus-three-qualified-current-records.INERT.jsonl', oldCombinedBytes.toString('utf8') + newText)
  const combined = readFileSync(resolve(root, combinedPath))
  if (!combined.subarray(0, oldCombinedBytes.length).equals(oldCombinedBytes)) throw new Error('Old343 byte prefix changed')
  const book = json(previous + 'whole-book.common689-sem689-P343.review-only.INERT.config.json')
  book.landscapePath = corePath; book.semanticKindLedgerPath = semanticPath; book.evidenceReviewPaths = [combinedPath]; book.outputPath = relOut + '/whole346.review-only-native-book-model.INERT.json'
  bytes(book.compositionViewPath); bytes(book.goalVisualizationQaPath)
  const bookPath = relOut + '/whole-book.current-core-SEM-P346.review-only.INERT.config.json'
  write('whole-book.current-core-SEM-P346.review-only.INERT.config.json', book)
  const build = await loadGoalBookBuildInputs(bookPath), model: any = build.model
  parseAndValidateGoalBookModel(model)
  const pageIDs = (model.goals ?? model.pages).map((p: any) => p.goalId ?? p.id)
  if (pageIDs.length !== 346 || new Set(pageIDs).size !== 346 || ordinary.some(id => !pageIDs.includes(id))) throw new Error('WholeBook346 current ordinary universe mismatch')
  write('whole346.review-only-native-book-model.INERT.json', model)
  const toolchain = { nativeNode: process.version, tsx: json('app/node_modules/tsx/package.json').version }
  const guards = [...inputs.values()].map(before => { const b = readFileSync(resolve(root, before.path)); return { before, after: { path: before.path, sha256: sha(b), bytes: b.length }, exact: before.sha256 === sha(b) && before.bytes === b.length } })
  if (guards.some(g => !g.exact)) throw new Error('Input changed during targeted native binding')
  write('actual-P45-new3-native-Book346-old343-full-parity.READONLY.receipt.json', { role: 'TARGETED_NATIVE_TECHNICAL_BINDING_NO_HISTORICAL343_SCIENCE_REREVIEW', startedAt, completedAt: new Date().toISOString(), corePath, semanticPath, wholeCoreGoals: core.goals.length, ordinary: 346,
    configPaths, old44ScopesExact: oldScopeProof, old343GoalKindResourceAndPerRecordParity: parity, old333WholeGoalObjectsExact: true, tenApplicabilityOnlyOrdinaryDeltasDisclosed: true, applicabilityScopeScienceQualificationRemainsSeparate: true, old343WholeProfileLinesAsExactBytePrefix: true,
    newRecordGoalIDs: novel, newBodiesWholeExactToQualifiedAuthor: true, authorSeal, scienceReceipt, nativeNew3: { records: 3, errors: nativeNew3.errors, counts: nativeNew3.counts },
    previous44NativeChecksReusedUnderActualPerRecordParity: true, all45NativeSubprocessesRerun: false,
    wholeBook: { configPath: bookPath, pages: 346, ordinaryGoalIDs: pageIDs, ownModelBuildAndSchemaParsePassed: true, retainedHistoricalQAPath: book.goalVisualizationQaPath, freshImageOrDReviewClaimed: false },
    combinedReviewPath: combinedPath, inputGuards: guards, allExact: true, toolchain,
    generationMetadata: { provider: 'OpenAI', modelFamily: 'GPT-6', runtime: 'Codex', exactModelRevision: 'not_exposed', samplingParameters: 'not_exposed' },
    activeWrites: 0, coreSourceREGAMWrites: 0, E1G1aiCandidateNeedsHumanReview: true, humanApproval: false, newBlindDReview: false, publicationOrM7Claim: false })
  console.log(JSON.stringify({ configCount: 45, old343Parity: parity.length, nativeNew3Errors: nativeNew3.errors.length, wholeBookPages: pageIDs.length, allEndguardsExact: true, activeWrites: 0 }))
}
void main().catch(e => { console.error(e); process.exitCode = 1 })
