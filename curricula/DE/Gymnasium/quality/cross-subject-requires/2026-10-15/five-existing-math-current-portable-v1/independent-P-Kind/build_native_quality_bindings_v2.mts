// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import Ajv2020 from '../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../app/node_modules/ajv-formats/dist/index.js'
import { fingerprintSemanticKindSourceGoal } from '../../../app/scripts/goalBookModel.ts'
import { stableJson, fingerprint } from '../../../app/scripts/lib/crossSubjectRequiresInventory.ts'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceProfile, fingerprintPositiveGoalEvidenceReviewInput, positiveGoalEvidenceReviewInputPayload, validatePositiveGoalEvidenceRecordSemantics } from '../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const out=dirname(fileURLToPath(import.meta.url)), root=resolve(out,'../../..')
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const write=(n:string,v:unknown)=>writeFileSync(resolve(out,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'})
const hash=(raw:Buffer|string)=>'sha256:'+createHash('sha256').update(raw).digest('hex')
const inputs=JSON.parse(readFileSync(resolve(out,'exact-whole-five-proposed-inputs.before-quality-lock.json'),'utf8'))
const opinions=JSON.parse(readFileSync(resolve(out,'whole-five-P-Kind-content-judgments.LOCKED.json'),'utf8'))
const op=new Map(opinions.rows.map((r:any)=>[r.goalId,r]))
const schema=read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv);const schemaValidate=ajv.compile(schema)
const rows:any[]=[], records:any[]=[], rawAssetBindings:any[]=[]
for(const r of inputs.rows){
 const before=r.beforeWholeGoal, goal=r.proposedWholeGoal, old=r.wholeCurrentPRecord, config=r.actualCurrentPOwner.config, opinion:any=op.get(r.goalId)
 const changed=Array.from(new Set([...Object.keys(before),...Object.keys(goal)])).filter(k=>stableJson(before[k])!==stableJson(goal[k]))
 if(stableJson(changed)!==stableJson(['requires']))throw Error('Unexpected wholeGoal mutation '+r.goalId)
 const digests:Record<string,string>={}, assets:any[]=[]
 for(const link of goal.resourceLinks??[]){
  if(link.type!=='goal-visualization')continue
  const p=resolve(root,'app/public',link.url.slice(1));if(!existsSync(p))throw Error('Missing actual image '+p)
  const raw=readFileSync(p), digest=hash(raw)
  const asset={path:p.slice(root.length+1),url:link.url,bytes:raw.length,sha256:digest,usedInPReviewInput:config.reviewedResourceTypes.includes('goal-visualization'),visualInspectionMade:false,newVApproval:false}
  assets.push(asset);rawAssetBindings.push(asset)
  if(asset.usedInPReviewInput)digests[link.url]=digest
 }
 const criteriaRaw=readFileSync(resolve(root,config.reviewCriteriaPath)),criteria=hash(criteriaRaw)
 if(criteria!==old.reviewCriteriaFingerprint)throw Error('Current criteria binding differs '+r.goalId)
 const kindBefore=fingerprintSemanticKindSourceGoal(before),kindAfter=fingerprintSemanticKindSourceGoal(goal)
 const pGoalBefore=fingerprintGoalForPositiveEvidence(before,'curricularAtomic'),pGoalAfter=fingerprintGoalForPositiveEvidence(goal,'curricularAtomic')
 const inputBefore=fingerprintPositiveGoalEvidenceReviewInput(before,criteria,digests,'curricularAtomic'),inputAfter=fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,digests,'curricularAtomic')
 const profileFP=fingerprintPositiveGoalEvidenceProfile(old.profile),wholeGoal=fingerprint(goal),wholeP=fingerprint(old.profile)
 if(kindBefore!==r.currentKindDecision.sourceFingerprint||kindBefore===kindAfter)throw Error('Kind before/proposed input failure '+r.goalId)
 if(pGoalBefore!==old.goalFingerprint||pGoalBefore!==pGoalAfter)throw Error('P goal semantic fingerprint mismatch '+r.goalId)
 if(inputBefore!==old.reviewInputFingerprint||inputBefore===inputAfter)throw Error('P resource/reviewInput before/proposed mismatch '+r.goalId)
 if(profileFP!==old.profileFingerprint)throw Error('Profile fingerprint failure '+r.goalId)
 const c=r.frozenRequiresDecision.positiveEvidenceCondition
 if(wholeGoal!==c.wholeGoalStableJsonSha256||wholeP!==c.wholeProfileStableJsonSha256||profileFP!==c.profileFingerprint)throw Error('Frozen exact Requires triple mismatch '+r.goalId)
 const reason='NEW independent proposed-requires-context wholeP judgment. '+opinion.PReason+' '+opinion.workedCasesAndTransfer+' Source/scope observations remain; no source/placement/route/human acceptance. Original wholeP was held by '+old.reviewer+' under '+old.reviewId+'; original record is retained and this is not reattributed historical approval.'
 const record={...old,reviewId:'physics-five-proposed-current-whole-p-independent-peer-20261015-v1',goalFingerprint:pGoalAfter,reviewInputFingerprint:inputAfter,profileFingerprint:profileFP,status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:new Date().toISOString(),reviewer:'/root/five_current_existing_math_requires_successor_independent_peer; NEW wholeP context review, informed by prior separate Requires work',reason,evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:[...old.dissent,...opinion.observations.map((s:string)=>'Bounded current independent observation: '+s)]}
 const errors=validatePositiveGoalEvidenceRecordSemantics(record,goal,digests,'curricularAtomic')
 const schemaValid=schemaValidate(record)
 if(!schemaValid||errors.length)throw Error('New exact proposed P record invalid '+r.goalId+JSON.stringify({schema:ajv.errorsText(schemaValidate.errors),errors}))
 records.push(record)
 const bound={goalId:r.goalId,wholeProposedGoalStableJsonSha256:wholeGoal,wholeCurrentProfileStableJsonSha256:wholeP,profileFingerprint:profileFP,goalFingerprintBefore:pGoalBefore,goalFingerprintProposed:pGoalAfter,reviewInputFingerprintBefore:inputBefore,reviewInputFingerprintProposed:inputAfter,sourceFingerprintKindBefore:kindBefore,sourceFingerprintKindProposed:kindAfter,kindOpinion:'curricularAtomic',KindDecision:opinion.KindDecision,PDecision:opinion.PDecision,nativeRecordSchemaValid:!!schemaValid,nativePRecordSemanticErrors:errors,reviewedResourceTypes:config.reviewedResourceTypes,resourceDigestsActuallyUsed:digests,assets,unchangedProfileBody:stableJson(record.profile)===stableJson(old.profile),beforeProposedChangedFields:changed,profileBodyAndProfileFingerprintUnchanged:true,PGoalSemanticFingerprintUnchanged:true,PReviewInputFingerprintChanged:true,KindSourceFingerprintChanged:true,sourceObservationRetained:opinion.sourceScopeObservationRetainedFromFrozenRequiresRecord,qualityWrapperAuthority:'ai_candidate/needs_human_review',nativeKindLedgerWritten:false}
 rows.push(bound)
 write('native-P-records/'+r.goalId+'.record.json',record)
 const payloads={before:positiveGoalEvidenceReviewInputPayload(before,criteria,digests,'curricularAtomic'),proposed:positiveGoalEvidenceReviewInputPayload(goal,criteria,digests,'curricularAtomic')}
 write('native-review-input-payloads/'+r.goalId+'.before-and-proposed.json',payloads)
}
writeFileSync(resolve(out,'five-proposed-current-P.ai-candidate.review.jsonl'),records.map(r=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'})
write('five-whole-proposed-P-Kind.native-bindings.actual.json',{scope:'Five exact proposed Physics Goals; full unchanged currentP bodies; native pure helper and official P schema checks. No integration-author P/Kind opinions read.',sourceAuthorV2Sha256:inputs.sourceAuthorSha256,rows,counts:{KindOpinions:5,PKeepOpinions:5,validAICandidatePRecords:records.length,changedPReviewInputs:rows.filter(r=>r.PReviewInputFingerprintChanged).length,unchangedPSemanticGoals:rows.filter(r=>r.PGoalSemanticFingerprintUnchanged).length,unchangedProfileFingerprints:rows.filter(r=>r.profileBodyAndProfileFingerprintUnchanged).length},noNewAuthoritativeKindLedgerOrMainWrites:true,noOther473PhysicsOr807MathPRecordsWritten:true})
write('actual-image-digests-readonly-no-V-opinion.json',{assets:rawAssetBindings,newAssetsCreated:0,imagesInspected:0,VDecisionsCreated:0,claim:'Hash reads only to reproduce actual existing owner P resource-digest policy. Existing V evidence is not recreated or promoted.'})
write('A-M-V-reuse-boundary.json',{newAOpinions:0,newMOpinions:0,newVOpinions:0,existingEvidenceAutomaticallyPromoted:false,claim:'This task establishes P and Kind context evidence only. It does not install or rebind A/M/V ledgers. Any later reuse must match the actual corresponding native fingerprints/asset bytes; unchanged text/images is not itself a newly attributed approval.'})
console.log(JSON.stringify({newKindOpinions:5,newPContextOpinions:5,PcandidateRecords:records.length,allNativeSemanticAndSchemaChecksPass:true,allPGoalFPunchanged:true,allPInputFPchanged:true,allProfileFPunchanged:true,newHumanOrVApproval:false}))
