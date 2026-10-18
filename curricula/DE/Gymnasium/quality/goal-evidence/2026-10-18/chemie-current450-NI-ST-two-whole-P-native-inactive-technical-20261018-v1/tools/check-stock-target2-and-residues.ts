// SPDX-License-Identifier: Apache-2.0
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {buildPositiveGoalEvidenceCandidateRecords} from '../../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import {reviewPositiveGoalEvidenceConfig} from '../../../../../../../../app/scripts/positiveGoalEvidenceReview'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile,fingerprintPositiveGoalEvidenceReviewInput} from '../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-NI-ST-two-whole-P-native-inactive-technical-20261018-v1/'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
async function main(){
const plan=read(O+'PLAN.inactive-native-P2-and-exact-residues.json'),config=read(plan.exactNewStockConfig.path),candidates=read(plan.exactStockCandidateSet.path)
const expected=await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:candidates})
assert.equal(expected.length,2)
const nativeBytes=readFileSync(config.reviewPath)
assert.deepEqual(nativeBytes,Buffer.from(expected.map(x=>JSON.stringify(x)).join('\n')+'\n'))
const canonical=read(config.landscapePath),ledger=read(config.semanticKindLedgerPath),criteriaFingerprint=hash(readFileSync(config.reviewCriteriaPath)),inventory=read(O+'INPUT.current-450-native-owner-inventory.structural-retention-only.json')
const profiles:any[]=[]
for(const record of expected){
 const goal=canonical.goals.find((g:any)=>g.id===record.goalId),kind=ledger.decisions.find((d:any)=>d.goalId===record.goalId&&d.decisionStatus==='authoritative')?.semanticKind
 assert.equal(kind,'curricularAtomic')
 const resourceDigests:Record<string,string>={}
 for(const link of goal.resourceLinks??[])if(link.type==='goal-visualization')resourceDigests[link.url]=hash(readFileSync('app/public'+link.url))
 assert.equal(record.goalFingerprint,fingerprintGoalForPositiveEvidence(goal,kind))
 assert.equal(record.reviewInputFingerprint,fingerprintPositiveGoalEvidenceReviewInput(goal,criteriaFingerprint,resourceDigests,kind))
 assert.equal(record.profileFingerprint,fingerprintPositiveGoalEvidenceProfile(record.profile))
 const old=inventory.records.find((r:any)=>r.goalId===record.goalId),oldRecord=readFileSync(old.review.path,'utf8').trim().split('\n').map(JSON.parse).find((r:any)=>r.goalId===record.goalId)
 assert.equal(record.goalFingerprint,oldRecord.goalFingerprint)
 assert.equal(record.reviewInputFingerprint,oldRecord.reviewInputFingerprint)
 assert.notEqual(record.profileFingerprint,oldRecord.profileFingerprint)
 assert.deepEqual(record.profile,candidates.goals.find((g:any)=>g.goalId===record.goalId).profile)
 assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate');assert.equal(record.evidenceLevel,'E1');assert.equal(record.maximumClaimScope,'G1');assert.deepEqual(record.reviewRunIds,[])
 profiles.push({goalId:record.goalId,goalFingerprint:record.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint,profileExactlyAcceptedWholeBody:true,goalAndReviewInputFingerprintsRemainCurrentAndUnchanged:true,status:record.status,reviewAuthority:record.reviewAuthority,evidenceLevel:record.evidenceLevel,maximumClaimScope:record.maximumClaimScope,reviewRunIds:record.reviewRunIds})
}
const stockChecks=[]
for(const path of [plan.exactNewStockConfig.path,...plan.residuals.map((r:any)=>r.newConfig.path)]){
 const result=reviewPositiveGoalEvidenceConfig(path);assert.deepEqual(result.errors,[]);assert.equal(result.config.requireApproved,false)
 stockChecks.push({configPath:path,scopeGoalIds:result.config.scope.goalIds,counts:result.counts,stockSchemaAndFingerprintSemanticErrors:result.errors})
}
assert.equal(stockChecks[0].scopeGoalIds.length,2)
assert.equal(stockChecks.slice(1).reduce((n,x)=>n+x.scopeGoalIds.length,0),5)
console.log(JSON.stringify({status:'PASS',scope:'Stock target2 native P schema/fingerprints and exact5 residual records only; no448-profile scientific review',actualStockFunctions:['buildPositiveGoalEvidenceCandidateRecords','fingerprintGoalForPositiveEvidence','fingerprintPositiveGoalEvidenceReviewInput','fingerprintPositiveGoalEvidenceProfile','reviewPositiveGoalEvidenceConfig'],nativeTwoProfiles:profiles,stockChecks,newDDecisions:0,newScientificFirstDecisions:0,normalWrites:0,apCompilerGlobalSchemaBuildRuns:0},null,2))
}
void main()
