import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile,
  validatePositiveGoalEvidenceRecordSemantics, POSITIVE_GOAL_EVIDENCE_SCHEMA_URL, POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,
  POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION, POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview'
import { loadGoalBookBuildInputs, parseAndValidateGoalBookModel } from '../../../../../../../app/scripts/goalBookModel'

// Own additive technical outputs only. Existing343 whole goals/profile bodies remain exact.
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
  const codePaths = ['app/scripts/positiveGoalEvidenceProfileModel.ts', 'app/scripts/goalEvidenceProfileModel.ts', 'app/scripts/positiveGoalEvidenceReview.ts', 'app/scripts/goalBookModel.ts', 'app/scripts/goalBookEvidenceReviewLoader.ts', 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json', 'contracts/goal-book/v1/goal-book-model-1.1.schema.json']
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
  if (ordinary.length !== 345 || sem.sourceLandscapeId !== core.landscapeId) throw new Error('Actual current ordinary universe must345')
  const oldCombinedPath = previous + 'whole343.qualified-profile-bodies-common689-native-bindings.INERT.jsonl'
  const oldCombinedBytes = bytes(oldCombinedPath), oldCombinedLines = lines(oldCombinedPath)
  if (oldCombinedLines.length !== 343) throw new Error('Historical whole343 missing')
  const oldIds = new Set(oldCombinedLines.map(l => l.record.goalId)), novel = ordinary.filter(id => !oldIds.has(id))
  if (novel.length !== 2) throw new Error('Expected exactly two new ordinary goals')
  let positive: any
  if (positivePath.endsWith('.jsonl')) positive = { goals: lines(positivePath).map(l => l.record) }
  else positive = json(positivePath)
  const sourceRecords: any[] = Array.isArray(positive) ? positive : positive.goals ?? positive.records
  if (!Array.isArray(sourceRecords)) throw new Error('Expected whole supplied two-profile records/spec')
  const sourceByID = new Map<string, any>(sourceRecords.map(g => [g.goalId, g]))
  if (novel.some(id => !sourceByID.has(id))) throw new Error('Two qualified whole profile bodies absent')
  const oldReceipt = json(previous + 'actual-P343-native-binding-body-reuse-and-book343.READONLY.receipt.json')
  if (oldReceipt.configPaths.length !== 44) throw new Error('Expected old44 exact configs')
  const configPaths: string[] = [], parity: any[] = [], oldScopeProof: any[] = []
  for (let i = 0; i < oldReceipt.configPaths.length; i++) {
    const path = oldReceipt.configPaths[i], before = json(path), c = structuredClone(before), n = String(i + 1).padStart(2, '0')
    const criteriaFP = sha(bytes(c.reviewCriteriaPath)), types = new Set(c.reviewedResourceTypes)
    for (const { record } of lines(c.reviewPath)) {
      const goal = goalByID.get(record.goalId), oldGoal = oldGoalByID.get(record.goalId), kind = kindByID.get(record.goalId)
      if (!goal || stable(goal) !== stable(oldGoal) || kind !== oldKinds.get(record.goalId) || kind !== 'curricularAtomic') throw new Error(record.goalId + ': historical whole goal/semantic kind changed')
      const assets: Record<string, string> = {}
      if (types.has('goal-visualization')) for (const link of goal.resourceLinks ?? []) if (link.type === 'goal-visualization') assets[link.url] = sha(bytes('app/public' + link.url))
      if (record.goalFingerprint !== fingerprintGoalForPositiveEvidence(goal, kind) || record.reviewInputFingerprint !== fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFP, assets, kind) || record.profileFingerprint !== fingerprintPositiveGoalEvidenceProfile(record.profile) || record.reviewCriteriaFingerprint !== criteriaFP) throw new Error(record.goalId + ': native per-record parity changed')
      parity.push({ goalId: record.goalId, wholeGoalExact: true, semanticKindExact: true, resourceDigests: assets, nativeGoalFingerprintExact: true, nativeReviewInputFingerprintExact: true, nativeProfileFingerprintExact: true, recordLineUnchanged: true, retainedReviewPath: c.reviewPath })
    }
    c.landscapePath = corePath; c.semanticKindLedgerPath = semanticPath
    const changedKeys = Object.keys(c).filter(k => stable(c[k]) !== stable(before[k]))
    if (changedKeys.some(k => !['landscapePath', 'semanticKindLedgerPath'].includes(k))) throw new Error('Old config contract changed')
    const target = relOut + '/configs/' + n + '.old-scope-exact-current-core-SEM.INERT.config.json'
    write('configs/' + n + '.old-scope-exact-current-core-SEM.INERT.config.json', c); configPaths.push(target)
    oldScopeProof.push({ previousConfigPath: path, currentConfigPath: target, scopeWholeExact: stable(c.scope) === stable(before.scope), reviewPathAndWholeJSONLBytesUnchanged: true, onlyPointerKeysChanged: changedKeys })
  }
  if (parity.length !== 343 || new Set(parity.map(p => p.goalId)).size !== 343) throw new Error('Old343 parity incomplete')
  const template = json(oldReceipt.configPaths[43]), criteriaFP = sha(bytes(criteriaPath))
  const config45 = { ...template, reviewId: 'wirtschaft-two-BB-personal-qualified-P345-native-binding-20261010-v1', landscapePath: corePath, semanticKindLedgerPath: semanticPath,
    reviewPath: relOut + '/positive/45.two-whole-qualified-personal-current-native-bindings.INERT.jsonl', reviewCriteriaPath: criteriaPath, reviewedResourceTypes: [], requireApproved: false,
    scope: { label: 'Two independently reviewed BB selected Personal whole AI candidate profiles; E1/G1, human review pending', goalIds: novel } }
  const newRecords = novel.map(id => {
    const src = sourceByID.get(id), goal = goalByID.get(id), kind = kindByID.get(id)!, profile = src.profile
    if (!profile) throw new Error(id + ': whole profile absent')
    const r: any = { $schema: POSITIVE_GOAL_EVIDENCE_SCHEMA_URL, schemaVersion: POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION, landscapeId: core.landscapeId, goalId: id,
      reviewId: config45.reviewId, status: 'needs_human_review', reviewAuthority: 'ai_candidate', evidenceLevel: 'E1', maximumClaimScope: 'G1', reviewRunIds: [], dissent: src.dissent ?? [],
      reason: src.reason ?? 'Independently qualified whole AI candidate profile body; native technical current binding only. Human review remains pending.',
      reviewer: src.reviewer ?? positive.reviewer ?? '/root/economics_final56_current_round_a; native technical binding of separately qualified AI author candidate', reviewedAt: src.reviewedAt ?? positive.reviewedAt ?? '2026-10-10',
      goalFingerprintRuleVersion: POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION, profileRuleVersion: POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
      reviewCriteriaFingerprint: criteriaFP, goalFingerprint: fingerprintGoalForPositiveEvidence(goal, kind), reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFP, {}, kind), profileFingerprint: fingerprintPositiveGoalEvidenceProfile(profile), profile }
    const errors = validatePositiveGoalEvidenceRecordSemantics(r, goal, {}, kind)
    if (errors.length) throw new Error(errors.join('\n'))
    if (stable(r.profile) !== stable(src.profile)) throw new Error('Whole source body changed')
    return r
  })
  const newText = newRecords.map(r => JSON.stringify(r)).join('\n') + '\n'
  write('positive/45.two-whole-qualified-personal-current-native-bindings.INERT.jsonl', newText)
  const config45Path = relOut + '/configs/45.two-new-whole-personal-current-native-bindings.INERT.config.json'
  write('configs/45.two-new-whole-personal-current-native-bindings.INERT.config.json', config45); configPaths.push(config45Path)
  const nativeNew2 = reviewPositiveGoalEvidenceConfig(config45Path)
  if (nativeNew2.errors.length || nativeNew2.records.length !== 2) throw new Error(nativeNew2.errors.join('\n') || 'New two native records missing')
  if (!oldCombinedBytes.toString().endsWith('\n')) throw new Error('Historical whole343 newline boundary absent')
  const combinedPath = relOut + '/whole345.old343-byte-prefix-plus-two-qualified-current-records.INERT.jsonl'
  write('whole345.old343-byte-prefix-plus-two-qualified-current-records.INERT.jsonl', oldCombinedBytes.toString('utf8') + newText)
  const combined = readFileSync(resolve(root, combinedPath))
  if (!combined.subarray(0, oldCombinedBytes.length).equals(oldCombinedBytes)) throw new Error('Old343 byte prefix changed')
  const book = json(previous + 'whole-book.common689-sem689-P343.review-only.INERT.config.json')
  book.landscapePath = corePath; book.semanticKindLedgerPath = semanticPath; book.evidenceReviewPaths = [combinedPath]; book.outputPath = relOut + '/whole345.review-only-native-book-model.INERT.json'
  bytes(book.compositionViewPath); bytes(book.goalVisualizationQaPath)
  const bookPath = relOut + '/whole-book.current-core-SEM-P345.review-only.INERT.config.json'
  write('whole-book.current-core-SEM-P345.review-only.INERT.config.json', book)
  const build = await loadGoalBookBuildInputs(bookPath), model: any = build.model
  parseAndValidateGoalBookModel(model)
  const pageIDs = (model.goals ?? model.pages).map((p: any) => p.goalId ?? p.id)
  if (pageIDs.length !== 345 || new Set(pageIDs).size !== 345 || ordinary.some(id => !pageIDs.includes(id))) throw new Error('WholeBook345 current ordinary universe mismatch')
  write('whole345.review-only-native-book-model.INERT.json', model)
  const toolchain = { nativeNode: process.version, tsx: json('app/node_modules/tsx/package.json').version }
  const guards = [...inputs.values()].map(before => { const b = readFileSync(resolve(root, before.path)); return { before, after: { path: before.path, sha256: sha(b), bytes: b.length }, exact: before.sha256 === sha(b) && before.bytes === b.length } })
  if (guards.some(g => !g.exact)) throw new Error('Input changed during targeted native binding')
  write('actual-P45-new2-native-Book345-old343-full-parity.READONLY.receipt.json', { role: 'TARGETED_NATIVE_TECHNICAL_BINDING_NO_HISTORICAL343_SCIENCE_REREVIEW', startedAt, completedAt: new Date().toISOString(), corePath, semanticPath, wholeCoreGoals: core.goals.length, ordinary: 345,
    configPaths, old44ScopesExact: oldScopeProof, old343WholeGoalKindResourceAndPerRecordParity: parity, old343WholeProfileLinesAsExactBytePrefix: true,
    newRecordGoalIDs: novel, newBodiesWholeExactToQualifiedAuthor: true, authorSeal, scienceReceipt, nativeNew2: { records: 2, errors: nativeNew2.errors, counts: nativeNew2.counts },
    previous44NativeChecksReusedUnderActualPerRecordParity: true, all45NativeSubprocessesRerun: false,
    wholeBook: { configPath: bookPath, pages: 345, ordinaryGoalIDs: pageIDs, ownModelBuildAndSchemaParsePassed: true, retainedHistoricalQAPath: book.goalVisualizationQaPath, freshImageOrDReviewClaimed: false },
    combinedReviewPath: combinedPath, inputGuards: guards, allExact: true, toolchain,
    activeWrites: 0, coreSourceREGAMWrites: 0, E1G1aiCandidateNeedsHumanReview: true, humanApproval: false, newBlindDReview: false, publicationOrM7Claim: false })
  console.log(JSON.stringify({ configCount: 45, old343Parity: parity.length, nativeNew2Errors: nativeNew2.errors.length, wholeBookPages: pageIDs.length, allEndguardsExact: true, activeWrites: 0 }))
}
void main().catch(e => { console.error(e); process.exitCode = 1 })
