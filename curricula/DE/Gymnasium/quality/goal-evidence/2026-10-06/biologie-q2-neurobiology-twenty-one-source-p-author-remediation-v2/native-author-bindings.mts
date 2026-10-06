// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
const here=dirname(fileURLToPath(import.meta.url)); const root=resolve(here,'../../../../../../..')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const write=(p:string,x:any)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(x,null,2)+'\n')}
const CP='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json';const LP='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
const candidate=read(resolve(here,'canonical.current464.author-v2.candidate.json')); const baseline=read(resolve(here,'canonical.current464.baseline.snapshot.json'))
const selected=new Set(read(resolve(here,'positive-evidence.author-v2.config.json')).scope.goalIds)
const ledger=read(resolve(root,LP));const before=structuredClone(ledger);const goalmap=new Map(candidate.goals.map((g:any)=>[g.id,g]));const oldmap=new Map(baseline.goals.map((g:any)=>[g.id,g]));const updates=[]
for (const d of ledger.decisions){
 const g=goalmap.get(d.goalId) as any;const old=oldmap.get(d.goalId) as any
 if (d.sourceFingerprint!==fingerprintSemanticKindSourceGoal(old))throw new Error(`stale actual baseline ${d.goalId}`)
 const next=fingerprintSemanticKindSourceGoal(g)
 if (d.sourceFingerprint!==next){
  if(!selected.has(d.goalId))throw new Error(`unauthorized outside21 update ${d.goalId}`)
  if(d.semanticKind!=='curricularAtomic')throw new Error(`unexpected classification ${d.goalId}`)
  updates.push({goalId:d.goalId,semanticKindBefore:d.semanticKind,semanticKindAfter:d.semanticKind,decisionStatusBefore:d.decisionStatus,decisionStatusAfter:d.decisionStatus,beforeSourceFingerprint:d.sourceFingerprint,afterSourceFingerprint:next,authorClassificationDecision:'One bounded assessable curricular content competence retained; source applicability boundary is metadata and not quality approval',scienceOrHumanApprovalClaim:false});d.sourceFingerprint=next
 }
}
write(resolve(here,'semantic-kinds.author-v2.candidate.json'),ledger);write(resolve(root,'tmp/biologie-q2-neurobiology-twenty-one-source-p-author-remediation-20261006-v2-native-scope',LP),ledger);write(resolve(root,'tmp/biologie-q2-neurobiology-twenty-one-source-p-author-remediation-20261006-v2-native-scope',CP),candidate)
write(resolve(here,'semantic-kinds.actual.targeted-binding-receipt.json'),{schemaVersion:1,classificationChanges:0,targetedBindingUpdates:updates.length,updates,allOtherDecisionsExact:ledger.decisions.every((d:any,i:number)=>selected.has(d.goalId)||JSON.stringify(d)===JSON.stringify(before.decisions[i])),nativeFingerprintFunction:'app/scripts/goalBookModel.ts#fingerprintSemanticKindSourceGoal',scienceAcceptanceClaim:false,independentAuthorV2Approval:false})
const config=read(resolve(here,'positive-evidence.author-v2.config.json'));const candidateSet=read(resolve(here,'positive-evidence.author-v2.candidates.json'))
const records=await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet})
const require=createRequire(resolve(root,'app/package.json'));const Ajv=require('ajv/dist/2020.js').default;const addFormats=require('ajv-formats').default;const ajv=new Ajv({strict:true,allErrors:true});addFormats(ajv)
const schemaBytes=readFileSync(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));const validate=ajv.compile(JSON.parse(schemaBytes.toString()))
const errors:string[]=[]
for(const r of records){if(!validate(r))errors.push(r.goalId+': '+ajv.errorsText(validate.errors)); errors.push(...validatePositiveGoalEvidenceRecordSemantics(r,goalmap.get(r.goalId) as any,{},'curricularAtomic'));if(r.status!=='needs_human_review'||r.reviewAuthority!=='ai_candidate'||r.evidenceLevel!=='E1'||r.maximumClaimScope!=='G1')errors.push('claim mismatch '+r.goalId)}
if(records.length!==21)errors.push('not21 records')
writeFileSync(resolve(here,'positive-evidence.author-v2.actual.candidate.jsonl'),records.map(r=>JSON.stringify(r)).join('\n')+'\n')
write(resolve(here,'native-positive21.actual.schema-receipt.json'),{schemaVersion:1,nativeBuilderUnchanged:true,records:records.length,syntheticCases:records.reduce((n,r)=>n+r.profile.applicationCaseBriefs.length,0),schemaSha256:createHash('sha256').update(schemaBytes).digest('hex'),errors,status:errors.length?'fail':'pass_author_candidate_schema',allStatuses:['needs_human_review'],allAuthorities:['ai_candidate'],evidenceLevel:'E1',maximumClaimScope:'G1',actualObservedLearnerDemonstrations:0,independentV2Review:false,humanApproval:false})
console.log(JSON.stringify({targetedBindings:updates.length,PRecords:records.length,errors}));if(errors.length)process.exitCode=1
