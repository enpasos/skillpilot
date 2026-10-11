import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel.ts'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceReviewInput,
  fingerprintPositiveGoalEvidenceProfile,
} from './positiveGoalEvidenceProfileModel.ts'

const actualRepository = process.argv[2]
const output = process.argv[3]
const privateRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const rd = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const input = rd(join(output, 'actual-v18-fifteen-qualified-graph-technical-author-inputs.json'))
const readSource = (p: string) => rd(join(actualRepository, p))
const put = (p: string, value: string) => {
  for (const root of [actualRepository, privateRoot]) {
    const absolute = join(root, p)
    mkdirSync(dirname(absolute), { recursive: true })
    writeFileSync(absolute, value)
  }
}
const putJson = (p: string, d: unknown) => put(p, JSON.stringify(d, null, 2) + '\n')
const sha = (data: Buffer | string) => 'sha256:' + createHash('sha256').update(data).digest('hex')
const before = readSource(input.wholeBeforeCAN.path)
const after = rd(join(privateRoot, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'))
assert.deepEqual(after, readSource(input.wholeAfterCAN.path))
const oldGoals = new Map<string, any>(before.goals.map((g: any) => [g.id, g]))
const newGoals = new Map<string, any>(after.goals.map((g: any) => [g.id, g]))
assert.equal(newGoals.size, 678)
const oldSem = readSource(input.oldKindLedger.path)
const newSem = structuredClone(oldSem)
const kind = new Map<string, string>(oldSem.decisions.map((d: any) => [d.goalId, d.semanticKind]))
const changedGoalIds = new Set<string>(readSource(input.wholeFifteenGoalDeltas.path).map((r: any) => r.goalId))
const phaseIds = new Set<string>(input.ordinaryPhaseGoalIds)
const incomeId = input.ordinaryIncomeRequiresGoalId
const sourceFPChanges: any[] = []
for (const d of newSem.decisions) {
  assert.equal(d.sourceFingerprint, fingerprintSemanticKindSourceGoal(oldGoals.get(d.goalId)), d.goalId)
  const original = structuredClone(d)
  d.sourceFingerprint = fingerprintSemanticKindSourceGoal(newGoals.get(d.goalId))
  if (d.sourceFingerprint !== original.sourceFingerprint) sourceFPChanges.push({ goalId: d.goalId, before: original, after: structuredClone(d) })
  assert.deepEqual({ ...d, sourceFingerprint: original.sourceFingerprint }, original)
}
assert.deepEqual(new Set(sourceFPChanges.map(x => x.goalId)), changedGoalIds)
assert.equal(sourceFPChanges.length, 15)
assert.deepEqual(newSem.counts, oldSem.counts)
putJson(input.newSEMPath, newSem)

const originalRecords = new Map<string, any>()
const changedRecords = new Map<string, any>()
const wholePChanges: any[] = []
const groupRows: any[] = []
let originalCases = 0
for (let i = 0; i < input.all43OldConfigReviewCriteriaBindings.length; i++) {
  const item = input.all43OldConfigReviewCriteriaBindings[i]
  const cfg = item.config
  const bytes = readFileSync(join(actualRepository, item.review.path), 'utf8')
  const lines = bytes.trimEnd().split(/\r?\n/)
  const afterLines: string[] = []
  const changedInGroup: string[] = []
  for (const line of lines) {
    const record = JSON.parse(line)
    assert(!originalRecords.has(record.goalId))
    originalRecords.set(record.goalId, structuredClone(record))
    originalCases += record.profile.applicationCaseBriefs.length
    assert.equal(record.status, 'needs_human_review')
    assert.equal(record.reviewAuthority, 'ai_candidate')
    assert.equal(record.profileFingerprint, fingerprintPositiveGoalEvidenceProfile(record.profile))
    const digests: Record<string, string> = {}
    if ((cfg.reviewedResourceTypes ?? []).includes('goal-visualization')) {
      for (const link of oldGoals.get(record.goalId).resourceLinks ?? []) {
        if (link.type === 'goal-visualization') digests[link.url] = sha(readFileSync(join(privateRoot, 'app/public', link.url.slice(1))))
      }
    }
    const semanticKind = kind.get(record.goalId)
    assert.equal(record.goalFingerprint, fingerprintGoalForPositiveEvidence(oldGoals.get(record.goalId), semanticKind), record.goalId)
    assert.equal(record.reviewInputFingerprint, fingerprintPositiveGoalEvidenceReviewInput(oldGoals.get(record.goalId), record.reviewCriteriaFingerprint, digests, semanticKind), record.goalId)
    const next = structuredClone(record)
    next.goalFingerprint = fingerprintGoalForPositiveEvidence(newGoals.get(record.goalId), semanticKind)
    next.reviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(newGoals.get(record.goalId), record.reviewCriteriaFingerprint, digests, semanticKind)
    const changed = Object.keys(record).filter(k => JSON.stringify(record[k]) !== JSON.stringify(next[k])).sort()
    if (changed.length) {
      const expectedFields = phaseIds.has(record.goalId) ? ['goalFingerprint', 'reviewInputFingerprint'] : ['reviewInputFingerprint']
      assert(phaseIds.has(record.goalId) || record.goalId === incomeId, record.goalId)
      assert.deepEqual(changed, expectedFields)
      assert.deepEqual(next.profile, record.profile)
      assert.equal(next.profileFingerprint, record.profileFingerprint)
      wholePChanges.push({ goalId: record.goalId, changedFields: changed, wholeBefore: record, wholeAfter: next })
      changedRecords.set(record.goalId, next)
      changedInGroup.push(record.goalId)
      afterLines.push(JSON.stringify(next))
    } else afterLines.push(line)
  }
  const newCfg = structuredClone(cfg)
  newCfg.semanticKindLedgerPath = input.newSEMPath
  let reviewPath = cfg.reviewPath
  if (changedInGroup.length) {
    reviewPath = join(input.newPositiveGroupsPath, `${String(i + 1).padStart(2, '0')}.whole-original-profile-only-qualified-current-input-FPs.review.jsonl`)
    put(reviewPath, afterLines.join('\n') + '\n')
    newCfg.reviewPath = reviewPath
  }
  putJson(input.newPConfigPaths[i], newCfg)
  groupRows.push({ oldConfigPath: item.old.path, newConfigPath: input.newPConfigPaths[i], oldReviewPath: cfg.reviewPath, newReviewPath: reviewPath, changedPRecordIds: changedInGroup, onlyConfigFieldsChanged: Object.keys(cfg).filter(k => JSON.stringify(cfg[k]) !== JSON.stringify(newCfg[k])) })
}
assert.equal(originalRecords.size, 336)
assert.equal(originalCases, 685)
assert.equal(wholePChanges.length, 10)
assert.deepEqual(new Set(wholePChanges.map(x => x.goalId)), new Set([...phaseIds, incomeId]))
const aggregateLines = readFileSync(join(actualRepository, input.oldWholeP336.path), 'utf8').trimEnd().split(/\r?\n/)
assert.equal(aggregateLines.length, 336)
put(input.newAggregatePPath, aggregateLines.map(line => {
  const row = JSON.parse(line)
  assert.deepEqual(row, originalRecords.get(row.goalId))
  return changedRecords.has(row.goalId) ? JSON.stringify(changedRecords.get(row.goalId)) : line
}).join('\n') + '\n')
putJson(join(output.replace(actualRepository + '/', ''), 'actual-official-fifteen-SEM-and-ten-P-whole-input-only-field-deltas.author.json'), {
  role: 'TECHNICAL_AUTHOR_OFFICIAL_FINGERPRINT_FUNCTIONS_WITH_FOREIGN_GRAPH_DECISION_NO_NEW_SCIENCE',
  qualifiedForeignGraphKEEP: input.foreignRootQualifiedGraphDeltaKEEP,
  actual15SEMSourceFPOnlyChanges: sourceFPChanges,
  other663SemanticRowsWholeExact: true,
  all678KindsStatusesBasesExact: true,
  actual10PWholeRecordFingerprintOnlyChanges: wholePChanges,
  all336WholeProfileBodies685CasesProfileFPsStatusAuthorityReviewMetaExact: true,
  other326PWholeRecordsExact: true,
  all43ConfigAndWholeGroupChanges: groupRows,
  newSEMPath: input.newSEMPath,
  newPConfigPaths: input.newPConfigPaths,
  newAggregatePPath: input.newAggregatePPath,
  newScientificDecisions: 0,
  humanApproval: false,
  activeWrites: 0,
})
console.log(JSON.stringify({ SEM:678, semanticFPChanges:15, P:336, cases:685, PInputChanges:10, affectedWholeGroups:groupRows.filter(x=>x.changedPRecordIds.length).length, newScientificDecisions:0 }))
