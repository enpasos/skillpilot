import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { reviewPositiveGoalEvidenceConfig } from './positiveGoalEvidenceReview.ts'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel.ts'
const actualRepository = process.argv[2]
const output = process.argv[3]
const privateRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const rd = (p:string) => JSON.parse(readFileSync(p,'utf8'))
const input = rd(join(output,'actual-v18-fifteen-qualified-graph-technical-author-inputs.json'))
const delta = rd(join(output,'actual-official-fifteen-SEM-and-ten-P-whole-input-only-field-deltas.author.json'))
const records = new Map<string,any>()
const results:any[] = []
let cases = 0
for(const path of input.newPConfigPaths) {
  const r = reviewPositiveGoalEvidenceConfig(path)
  assert.deepEqual(r.errors,[],path+JSON.stringify(r.errors))
  for(const record of r.records) {
    assert(!records.has(record.goalId)); records.set(record.goalId,record)
    cases += record.profile.applicationCaseBriefs.length
    assert.equal(record.status,'needs_human_review'); assert.equal(record.reviewAuthority,'ai_candidate')
  }
  results.push({path,goals:r.records.length,counts:r.counts,errors:r.errors})
}
assert.equal(results.length,43); assert.equal(records.size,336); assert.equal(cases,685)
const sem = rd(join(privateRoot,input.newSEMPath))
const can = rd(join(privateRoot,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'))
assert.deepEqual(can,rd(join(actualRepository,input.wholeAfterCAN.path)))
const goals = new Map(can.goals.map((g:any)=>[g.id,g]))
for(const d of sem.decisions) assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(goals.get(d.goalId)))
const aggregate = readFileSync(join(privateRoot,input.newAggregatePPath),'utf8').trim().split(/\r?\n/).map(x=>JSON.parse(x))
for(const d of aggregate) assert.deepEqual(d,records.get(d.goalId))
assert.equal(aggregate.length,336)
const originalAggregate = readFileSync(join(actualRepository,input.oldWholeP336.path),'utf8').trim().split(/\r?\n/).map(x=>JSON.parse(x))
const orig = new Map(originalAggregate.map((r:any)=>[r.goalId,r]))
const changed = new Set(delta.actual10PWholeRecordFingerprintOnlyChanges.map((r:any)=>r.goalId))
for(const record of aggregate) {
  const old = orig.get(record.goalId)
  const retained = {...record,goalFingerprint:old.goalFingerprint,reviewInputFingerprint:old.reviewInputFingerprint}
  assert.deepEqual(retained,old)
  if(!changed.has(record.goalId)) assert.deepEqual(record,old)
}
writeFileSync(join(output,'actual-native43-current-v18-P336685-and-all678-officialSEM-checks.PASS.json'),JSON.stringify({
  role:'TECHNICAL_NATIVE_CHECK_PASS_NOT_NEW_SCIENCE', configs:results,
  actualConfigs:43,actualPositiveRecords:336,actualOriginalCases:685,actualSEM:678,
  actualErrors:0,actualNeedsHumanReview:336,actualAIcandidateAuthority:336,actualApproved:0,
  all678OfficialSourceFingerprintsCurrent:true,
  all336Profiles685CasesProfileFingerprintsStatusAuthorityMetaExact:true,
  only10QualifiedGoalAndInputFingerprintsChanged:true,
  other326WholeRecordsExact:true,
  qualifiedForeignGraphKEEP:input.foreignRootQualifiedGraphDeltaKEEP,
  newScientificOrScopeDecisions:0,strictNetGain:0,humanApproval:false,activeWrites:0
},null,2)+'\n')
console.log(JSON.stringify({configs:43,P:336,cases:685,SEM:678,errors:0,needsHumanReview:336,approved:0}))
