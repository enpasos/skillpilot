import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel.ts'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, validatePositiveGoalEvidenceRecordSemantics } from './positiveGoalEvidenceProfileModel.ts'
import { reviewPositiveGoalEvidenceConfig } from './positiveGoalEvidenceReview.ts'
import { fingerprintGoal as atomicityFingerprint } from './independentV19AtomicityFingerprint.ts'
import { fingerprintGoal as memoryFingerprint } from './independentV19MemoryFingerprint.ts'
const input=JSON.parse(readFileSync(process.argv[2],'utf8'));const cap=input.privateRoot
const j=(p:string)=>JSON.parse(readFileSync(join(cap,p),'utf8'))
const rows=(p:string)=>readFileSync(join(cap,p),'utf8').trim().split(/\r?\n/).map(x=>JSON.parse(x))
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
const before=JSON.parse(readFileSync(process.argv[3],'utf8'));assert.equal(sha(readFileSync(process.argv[3])),input.originalWholeCAN.sha256)
const after=j(input.activeCanPath);const b=new Map<string,any>(before.goals.map((g:any)=>[g.id,g]));const a=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));const ids=new Set<string>(input.goalIds)
const oldSEM=j(input.oldSEMPath);const sem=j(input.newSEMPath);assert.equal(sem.decisions.length,678);const semValues=[]
for(let k=0;k<sem.decisions.length;k++){const old=oldSEM.decisions[k],n=sem.decisions[k];assert.equal(n.goalId,old.goalId);assert.equal(old.sourceFingerprint,fingerprintSemanticKindSourceGoal(b.get(n.goalId)));const expected=fingerprintSemanticKindSourceGoal(a.get(n.goalId));assert.equal(n.sourceFingerprint,expected);assert.deepEqual({...n,sourceFingerprint:old.sourceFingerprint},old);if(ids.has(n.goalId)){assert.notEqual(expected,old.sourceFingerprint);semValues.push({goalId:n.goalId,expected,original:old.sourceFingerprint})}else assert.deepEqual(n,old)}
assert.equal(semValues.length,2)
const ajv=new Ajv2020({strict:true,allErrors:true});addFormats(ajv);ajv.addKeyword({keyword:'x-skillpilot-listSemantics',schemaType:['string','object'],valid:true});const schema=ajv.compile(j('contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'));assert(schema(sem),JSON.stringify(schema.errors))
const oldP=rows(input.oldAggregatePath),newP=rows(input.newAggregatePath);const op=new Map<string,any>(oldP.map(r=>[r.goalId,r]));const np=new Map<string,any>(newP.map(r=>[r.goalId,r]));assert.equal(newP.length,336);assert.equal(newP.reduce((n,r)=>n+r.profile.applicationCaseBriefs.length,0),685)
const resourceDigests=(g:any)=>Object.fromEntries((g.resourceLinks??[]).filter((l:any)=>l.type==='goal-visualization').map((l:any)=>[l.url,'sha256:'+sha(readFileSync(join(cap,'app/public',l.url.slice(1))))]))
const positives=[];const negativeCases=[]
for(const gid of ids){const old=op.get(gid),n=np.get(gid);const res=resourceDigests(a.get(gid));assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(old,b.get(gid),res,'curricularAtomic'),[]);assert.equal(n.goalFingerprint,fingerprintGoalForPositiveEvidence(a.get(gid),'curricularAtomic'));assert.equal(n.reviewInputFingerprint,fingerprintPositiveGoalEvidenceReviewInput(a.get(gid),old.reviewCriteriaFingerprint,res,'curricularAtomic'));assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(n,a.get(gid),res,'curricularAtomic'),[]);assert.equal(n.status,'needs_human_review');assert.equal(n.reviewAuthority,'ai_candidate');assert.deepEqual({...n,goalFingerprint:old.goalFingerprint,reviewInputFingerprint:old.reviewInputFingerprint},old);positives.push({goalId:gid,goalFingerprint:n.goalFingerprint,reviewInputFingerprint:n.reviewInputFingerprint,caseCount:n.profile.applicationCaseBriefs.length,status:n.status,authority:n.reviewAuthority,nativeErrors:[]});for(const [name,record,count]of [['oldGoalFingerprintOnly',{...n,goalFingerprint:old.goalFingerprint},1],['oldReviewInputFingerprintOnly',{...n,reviewInputFingerprint:old.reviewInputFingerprint},1]]as const){const errors=validatePositiveGoalEvidenceRecordSemantics(record,a.get(gid),res,'curricularAtomic');assert.equal(errors.length,count);negativeCases.push({goalId:gid,case:name,nativeErrors:errors,detected:true})}}
const amResults=[]
for(const [kind,oldPath,newPath,fp]of [['A',input.oldA,input.newA,atomicityFingerprint],['M',input.oldM,input.newM,memoryFingerprint]]as const){const old=rows(oldPath),n=rows(newPath);assert.equal(n.length,336);let changed=0;for(let k=0;k<n.length;k++){assert.equal(old[k].goalId,n[k].goalId);assert.equal(old[k].fingerprint,fp(b.get(n[k].goalId),old[k].ruleVersion));const expected=fp(a.get(n[k].goalId),n[k].ruleVersion);assert.equal(expected,n[k].fingerprint);assert.deepEqual({...n[k],fingerprint:old[k].fingerprint},old[k]);if(ids.has(n[k].goalId)){changed++;assert.notEqual(expected,old[k].fingerprint);amResults.push({kind,goalId:n[k].goalId,fingerprint:expected,status:n[k].status,unchangedJudgmentAndReason:true,oldFingerprintNativeMismatchDetected:true})}else assert.deepEqual(n[k],old[k])}assert.equal(changed,2)}
const results=[]
for(const cfg of input.targetedPositiveConfigs){const review=reviewPositiveGoalEvidenceConfig(cfg);assert.deepEqual(review.errors,[]);results.push({path:cfg,records:review.records.length,cases:review.records.reduce((n,r)=>n+r.profile.applicationCaseBriefs.length,0),counts:review.counts,nativeErrors:review.errors})}
assert.equal(results.reduce((n,r)=>n+r.records,0),28);assert.equal(results.reduce((n,r)=>n+r.cases,0),58)
console.log(JSON.stringify({scope:'Independent targeted native technical verification only; no description or image science',privateRoot:cap,officialSEMsourceFingerprintRows:678,SEM2ChangedValues:semValues,closedSEMSchemaErrors:0,fullAggregateCounts:{profiles:336,cases:685},targetedPpositives:positives,atomicityMemoryResults:amResults,wholeTargetedPConfigNativeResults:results,ownGenuinePStaleNegativeCases:negativeCases,AMOriginalFPMismatches:4,newScientificOrHumanOrM7Approvals:0,activeWrites:0},null,2))
