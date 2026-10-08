// Apache-2.0. Exactly three substantively inspected prerequisite/input successors.
import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const directory=dirname(fileURLToPath(import.meta.url)),root=resolve(directory,'../../../../../../..')
const author=resolve(directory,'../wirtschaft-q-business-macro-twenty-bilingual-author-v1')
const original=resolve(directory,'../wirtschaft-q-business-macro-twenty-independent-substantive-review-v1')
const hash=(x:string|Buffer)=>'sha256:'+createHash('sha256').update(x).digest('hex')
const oldBytes=await readFile(resolve(author,'whole-goals.with-individual-taxonomy.candidate.json'))
const newBytes=await readFile(resolve(author,'whole-goals.with-individual-taxonomy-and-bounded-prerequisite-corrections.candidate.v2.json'))
const old=JSON.parse(oldBytes.toString()),goals=JSON.parse(newBytes.toString())
const recordBytes=await readFile(resolve(original,'native-current-taxonomy-positive-twenty.records.inert.jsonl'))
const records=recordBytes.toString().trim().split('\n').map(x=>JSON.parse(x)),byId=new Map(records.map((x:any)=>[x.goalId,x]))
const closureBytes=await readFile(resolve(directory,'actual-independent-root-authored-three-requires-v2-closure.receipt.json'))
const closure=JSON.parse(closureBytes.toString()),approved=new Set(closure.actualWholeAffectedThreeBeforeAfterCompared.map((x:any)=>x.goalId))
const schemaBytes=await readFile(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const require=createRequire(resolve(root,'app/package.json')),Ajv=require('ajv/dist/2020.js').default,formats=require('ajv-formats').default
const ajv=new Ajv({strict:false,allErrors:true});formats(ajv);const validate=ajv.compile(JSON.parse(schemaBytes.toString()))
const successors:any[]=[],actual:any[]=[];const now=new Date().toISOString()
for(let i=0;i<goals.length;i++){
 const goal=goals[i],before=old[i],record:any=byId.get(goal.id)
 if(goal.id!==before.id||!record)throw new Error('Mismatch')
 const oldInput=fingerprintPositiveGoalEvidenceReviewInput(before,record.reviewCriteriaFingerprint,{},'curricularAtomic')
 const newInput=fingerprintPositiveGoalEvidenceReviewInput(goal,record.reviewCriteriaFingerprint,{},'curricularAtomic')
 if(oldInput!==record.reviewInputFingerprint)throw new Error('Prior input does not bind genuine prior record')
 const changed=oldInput!==newInput
 if(changed!==approved.has(goal.id))throw new Error('Unexpected positive-input delta')
 if(fingerprintGoalForPositiveEvidence(goal,'curricularAtomic')!==record.goalFingerprint)throw new Error('Unexpected goal substance delta')
 actual.push({goalId:goal.id,reviewInputChanged:changed,wholeGoalSubstanceFingerprintPreserved:true,wholeProfileFingerprintPreserved:true,oldReviewInputFingerprint:oldInput,newReviewInputFingerprint:newInput})
 if(changed){
  const successor={...record,reviewId:'wirtschaft-business-macro-three-independent-prerequisite-input-20261008-v2',reviewInputFingerprint:newInput,reviewedAt:now,
   reason:'The whole affected bilingual goal, both complete current profile cases and precise before/after prerequisites were actually independently reinspected; the exact three-edge source/competence closure is preserved separately. This successor restores a current prerequisite input binding supported by that subject review; it is not a new positive-profile content closure or final image-bound approval.'}
  if(!validate(successor))throw new Error(JSON.stringify(validate.errors))
  const errors=validatePositiveGoalEvidenceRecordSemantics(successor,goal,{},'curricularAtomic');if(errors.length)throw new Error(JSON.stringify(errors))
  if(fingerprintPositiveGoalEvidenceProfile(successor.profile)!==record.profileFingerprint)throw new Error('Profile mutated')
  successors.push(successor)
 }
}
if(successors.length!==3)throw new Error('Wrong successor count')
const receipt={role:'actual_native_three_positive_input_successors_after_real_whole_subject_review',createdAt:now,passed:true,
 originalWholeGoalSha256:hash(oldBytes),successorWholeGoalSha256:hash(newBytes),priorIndependentRecordSha256:hash(recordBytes),actualSubjectClosureSha256:hash(closureBytes),
 changedReviewInputs:3,unchangedReviewInputs:17,wholeSubstanceAndProfileFingerprintsChanged:0,actualPerGoalChecks:actual,
 newPositiveContentClosures:0,restoredCandidatePrerequisiteInputBindings:3,finalImageResourceDigests:{},finalMachineGatePApprovalClaim:false,
 status:'needs_human_review',reviewAuthority:'ai_candidate',statusMeaning:'Preserves truthful inert native candidate contract; no human gate is required or claimed by the separate machine content receipt.',
 activeWrites:0,humanApprovalClaim:false,newStrictCompletions:0}
await writeFile(resolve(directory,'native-three-positive-input-successor.records.inert.jsonl'),successors.map(x=>JSON.stringify(x)).join('\n')+'\n',{flag:'wx'})
await writeFile(resolve(directory,'actual-native-three-positive-input-successor.receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log('PASS exactly3 changed native review input bindings;17 unchanged;20 substantive goal/profile fingerprints unchanged;3 inert closed-schema successors.')
