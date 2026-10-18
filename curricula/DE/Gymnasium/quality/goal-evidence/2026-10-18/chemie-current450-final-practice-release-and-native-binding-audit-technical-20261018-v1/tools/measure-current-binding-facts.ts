// SPDX-License-Identifier: Apache-2.0
// Read-only current Chemistry fingerprints and release inventory; no scientific decisions or normal writes.
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile } from '../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-final-practice-release-and-native-binding-audit-technical-20261018-v1'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const digest=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const pin=(path:string)=>{const raw=readFileSync(path);return {path,sha256:digest(raw).slice(7),bytes:raw.length}}
const registryPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const subject=read(registryPath).subjects.find((s:any)=>s.subject==='chemie'),landscape=read(subject.landscapePath)
const by=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g])),ledger=read(subject.semanticKindLedgerPath)
const kind=new Map<string,string>(ledger.decisions.map((r:any)=>[r.goalId,r.semanticKind]))
const assets=new Map<string,string>(),configs:any[]=[],records:any[]=[],ownerIds=new Set<string>()
for(const path of subject.positiveEvidenceConfigPaths){
 const config=read(path),scope=new Set<string>(config.scope.goalIds),rows=readFileSync(config.reviewPath,'utf8').split(/\r?\n/).filter(Boolean).map(s=>JSON.parse(s))
 for(const row of rows.filter((r:any)=>scope.has(r.goalId))){
  const goal=by.get(row.goalId);if(!goal)throw Error('Unknown P goal '+row.goalId)
  const resourceDigests:Record<string,string>={}
  if(config.reviewedResourceTypes.includes('goal-visualization'))for(const link of goal.resourceLinks??[]){
   if(link.type!=='goal-visualization')continue
   if(!assets.has(link.url))assets.set(link.url,digest(readFileSync('app/public'+link.url)))
   resourceDigests[link.url]=assets.get(link.url)!
  }
  const goalFP=fingerprintGoalForPositiveEvidence(goal,kind.get(goal.id)),inputFP=fingerprintPositiveGoalEvidenceReviewInput(goal,row.reviewCriteriaFingerprint,resourceDigests,kind.get(goal.id)),profileFP=fingerprintPositiveGoalEvidenceProfile(row.profile)
  records.push({goalId:row.goalId,configPath:path,reviewPath:config.reviewPath,reviewId:row.reviewId,storedGoalFingerprint:row.goalFingerprint,actualGoalFingerprint:goalFP,storedReviewInputFingerprint:row.reviewInputFingerprint,actualReviewInputFingerprint:inputFP,storedProfileFingerprint:row.profileFingerprint,actualProfileFingerprint:profileFP,goalFingerprintCurrent:row.goalFingerprint===goalFP,reviewInputFingerprintCurrent:row.reviewInputFingerprint===inputFP,wholeProfileFingerprintCurrent:row.profileFingerprint===profileFP})
  ownerIds.add(row.goalId)
 }
 configs.push({configPin:pin(path),reviewPin:pin(config.reviewPath),scopeGoalIds:[...scope]})
}
const exams=landscape.goals.filter((g:any)=>g.examData).map((g:any)=>({goalId:g.id,title:g.title,semanticKind:kind.get(g.id),phase:g.phase??g.dimensionTags?.phase,reviewStatus:g.examData.reviewStatus??null,sourceArtifactPath:g.examData.sourceArtifactPath??null,coveredGoalIds:g.examData.coveredGoalIds??[],requires:g.requires,maxPoints:g.examData.scoring?.maxPoints,passingPoints:g.examData.scoring?.passingPoints,stepPointsSum:(g.examData.scoring?.steps??[]).reduce((n:number,s:any)=>n+s.points,0),coverageMetadataPresent:!!g.examData.coveredGoalIds?.length&&!!g.examData.coveredStrands?.length&&!!g.examData.demandLevels?.length}))
const summary={role:'TARGETED_CURRENT_CHEMISTRY_FINGERPRINT_AND_METADATA_FACTS_NOT_GLOBAL_QA_OR_RELEASE',registry:pin(registryPath),canonical:pin(subject.landscapePath),semanticKinds:pin(subject.semanticKindLedgerPath),normalGoalCount:landscape.goals.length,curricularAtomicCount:[...kind.values()].filter(k=>k==='curricularAtomic').length,positiveConfigs:configs.length,positiveRecordOccurrences:records.length,uniquePositiveGoalIds:ownerIds.size,goalFingerprintStaleIds:[...new Set(records.filter(r=>!r.goalFingerprintCurrent).map(r=>r.goalId))],reviewInputFingerprintStaleIds:[...new Set(records.filter(r=>!r.reviewInputFingerprintCurrent).map(r=>r.goalId))],wholeProfileFingerprintStaleIds:[...new Set(records.filter(r=>!r.wholeProfileFingerprintCurrent).map(r=>r.goalId))],examCount:exams.length,examStatusCounts:exams.reduce((a:any,g:any)=>(a[g.reviewStatus??'legacy_missing']=(a[g.reviewStatus??'legacy_missing']??0)+1,a),{}),normalWrites:0,newScientificVotes:0}
writeFileSync(out+'/FACTS.actual-current-P-fingerprints-and-exam-release-inventory.json',JSON.stringify({summary,configs,records,exams},null,2)+'\n')
console.log(JSON.stringify(summary,null,2))
