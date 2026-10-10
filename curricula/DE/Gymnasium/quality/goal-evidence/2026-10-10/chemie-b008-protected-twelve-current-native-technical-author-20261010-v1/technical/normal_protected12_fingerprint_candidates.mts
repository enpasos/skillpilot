// SPDX-License-Identifier: Apache-2.0
// Technical candidate input only; originals and scientific profiles stay whole.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {fingerprintSemanticKindSourceGoal,stableGoalBookJson} from './isolated-normal-capsule/app/scripts/goalBookModel.ts'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from './isolated-normal-capsule/app/scripts/positiveGoalEvidenceProfileModel.ts'
const root=resolve('.'),p='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-protected-twelve-current-native-technical-author-20261010-v1'
const read=(f:string)=>JSON.parse(readFileSync(resolve(root,f),'utf8'))
const sha=(s:string|Buffer)=>'sha256:'+createHash('sha256').update(s).digest('hex')
const put=(f:string,x:any)=>{assert.ok(f.startsWith(p+'/'));mkdirSync(dirname(resolve(root,f)),{recursive:true});writeFileSync(resolve(root,f),JSON.stringify(x,null,2)+'\n')}
const before=read(p+'/inputs/active-basis/current-whole-active-canonical.exact.json'),after=read(p+'/inputs/candidate/current-whole511-398-B008.inactive.json')
const bg=new Map<string,any>(before.goals.map((x:any)=>[x.id,x])),ag=new Map<string,any>(after.goals.map((x:any)=>[x.id,x]))
const scope=read(p+'/checks/actual-full381-to398-protected180-context-deltas.json'),ids=new Set<string>(scope.actualDeltaGoalIds)
const qa=new Map<string,any>(read(p+'/inputs/candidate/current-whole-QA.native-unapproved.inactive.json').records.map((x:any)=>[x.goalId,x]))
const bindings=read(p+'/inputs/protected12-P-body-and-profile-bindings.actual.json'),rows:any[]=[],outputs:string[]=[]
for(const [index,path]of bindings.normalExactCopyRecordPaths.entries()){
 const records=readFileSync(resolve(root,path),'utf8').split(/\r?\n/).filter(x=>x.trim()).map(x=>JSON.parse(x))
 const current=records.map((old:any)=>{
  if(!ids.has(old.goalId))return old
  const goal=ag.get(old.goalId),record=structuredClone(old),q=qa.get(old.goalId),resources=q?{[q.imageUrl]:q.assetSha256}:{}
  record.goalFingerprint=fingerprintGoalForPositiveEvidence(goal,'curricularAtomic')
  record.reviewInputFingerprint=fingerprintPositiveGoalEvidenceReviewInput(goal,old.reviewCriteriaFingerprint,resources,'curricularAtomic')
  assert.equal(record.profileFingerprint,fingerprintPositiveGoalEvidenceProfile(record.profile))
  assert.equal(stableGoalBookJson(old.profile),stableGoalBookJson(record.profile))
  assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate')
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,'curricularAtomic'),[])
  rows.push({goalId:old.goalId,wholeExistingRecord:old,wholeCurrentTechnicalCandidateRecord:record,actualChangedRecordFields:Object.keys(record).filter(k=>stableGoalBookJson(record[k])!==stableGoalBookJson(old[k])),normalBeforeGoalFingerprint:fingerprintGoalForPositiveEvidence(bg.get(old.goalId),'curricularAtomic'),normalAfterGoalFingerprint:record.goalFingerprint,normalBeforeReviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(bg.get(old.goalId),old.reviewCriteriaFingerprint,resources,'curricularAtomic'),normalAfterReviewInputFingerprint:record.reviewInputFingerprint,normalBeforeSemanticKindSourceFingerprint:fingerprintSemanticKindSourceGoal(bg.get(old.goalId)),normalAfterSemanticKindSourceFingerprint:fingerprintSemanticKindSourceGoal(goal),wholeScientificProfileExact:true,currentTargetedScientificPReviewPending:record.reviewInputFingerprint!==old.reviewInputFingerprint,technicalCandidateOnly:true})
  return record
 })
 const output=p+`/positive/current-context-technical-candidates-${index+1}.records.jsonl`
 mkdirSync(dirname(resolve(root,output)),{recursive:true});writeFileSync(resolve(root,output),current.map((x:any)=>JSON.stringify(x)).join('\n')+'\n');outputs.push(output)
}
assert.equal(rows.length,12);assert.equal(rows.filter(x=>x.currentTargetedScientificPReviewPending).length,5)
const afterConfig=p+'/native/after-whole-normal-book.config.json',cfg=read(afterConfig)
cfg.evidenceReviewPaths=cfg.evidenceReviewPaths.filter((x:string)=>!bindings.normalExactCopyRecordPaths.includes(x)).concat(outputs);put(afterConfig,cfg)
const am=read(p+'/inputs/whole-existing-A-M-and-normal-target-bindings.actual.json')
// These are the exact payload fields used by the unchanged normal A/M CLIs.
const norm=(v:any)=>String(v??'').normalize('NFKC').replace(/\s+/g,' ').trim()
const stable=(v:any):string=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>JSON.stringify(k)+':'+stable(x)).join(',')+'}':JSON.stringify(v)
const ampayload=(g:any,ruleVersion:string)=>({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:norm(g.title),titleEn:norm(g.titleEn),description:norm(g.description),descriptionEn:norm(g.descriptionEn),phase:norm(g.dimensionTags?.phase),area:norm(g.dimensionTags?.area),topicCode:norm(g.dimensionTags?.topicCode),nodeKind:norm(g.nodeKind)})
const aRecords=am.atomicity.flatMap((x:any)=>x.wholeSelectedRecords),mRecords=am.memory.wholeSelectedRecords
for(const row of rows){
 const a=aRecords.find((x:any)=>x.goalId===row.goalId),m=mRecords.find((x:any)=>x.goalId===row.goalId);assert.ok(a&&m)
 row.wholeExistingAtomicityRecord=a;row.wholeExistingMemoryRecord=m
 row.normalAtomicityPayloadBefore=ampayload(bg.get(row.goalId),a.ruleVersion);row.normalAtomicityPayloadAfter=ampayload(ag.get(row.goalId),a.ruleVersion)
 row.normalAtomicityFingerprintBefore=sha(stable(row.normalAtomicityPayloadBefore));row.normalAtomicityFingerprintAfter=sha(stable(row.normalAtomicityPayloadAfter))
 row.normalMemoryPayloadBefore=ampayload(bg.get(row.goalId),m.ruleVersion);row.normalMemoryPayloadAfter=ampayload(ag.get(row.goalId),m.ruleVersion)
 row.normalMemoryFingerprintBefore=sha(stable(row.normalMemoryPayloadBefore));row.normalMemoryFingerprintAfter=sha(stable(row.normalMemoryPayloadAfter))
 assert.equal(a.fingerprint,row.normalAtomicityFingerprintBefore);assert.equal(a.fingerprint,row.normalAtomicityFingerprintAfter)
 assert.equal(m.fingerprint,row.normalMemoryFingerprintBefore);assert.equal(m.fingerprint,row.normalMemoryFingerprintAfter)
}
put(p+'/checks/whole12-old-records-and-current-normal-P-A-M-kind-fingerprints.actual.json',{schemaVersion:1,role:'Technical normal fingerprint comparison; five real requires/P-input changes; whole old records retained; no review or gate acceptance',normalExportedAPIs:['fingerprintGoalForPositiveEvidence','fingerprintPositiveGoalEvidenceReviewInput','fingerprintPositiveGoalEvidenceProfile','validatePositiveGoalEvidenceRecordSemantics','fingerprintSemanticKindSourceGoal'],normalAMCalculationSource:'Exact documented payload from unchanged semanticAtomicityReview.ts and memoryCardReview.ts; separately confirmed by normal targeted CLI checks',actualProtectedGoalCount:12,actualWholeGoalRequiresChanges:5,actualPReviewInputFingerprintChanges:5,actualPGoalFingerprintChanges:0,actualPProfileFingerprintChanges:0,actualAMFingerprintChanges:0,actualSemanticKindSourceFingerprintChanges:5,normalCurrentTechnicalPRecordPaths:outputs,rows,wholeExistingScientificProfilesExact:true,newScientificPApprovals:0,newAApprovals:0,newMApprovals:0,newKindScienceApprovals:0,activeWrites:[],strictGain:0,humanApproval:false})
console.log(JSON.stringify({normalWholeP12CandidateInputs:12,actualPInputDeltas:5,actualKindSourceDeltas:5,actualAMFingerprintDeltas:0,scientificApprovals:0,activeWrites:0,strictGain:0}))
