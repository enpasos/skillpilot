// SPDX-License-Identifier: Apache-2.0
import {createHash} from 'node:crypto'
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import Ajv2020 from '../../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../../app/node_modules/ajv-formats'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile,fingerprintPositiveGoalEvidenceReviewInput,positiveGoalEvidenceReviewInputPayload,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
function main(){
 const inputRecordsPath=resolve(process.argv[2]??'');if(!process.argv[2])throw Error('Explicit current author v2 native record path is required')
 const base=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07'),oldAuthor=resolve(base,'biologie-q1-four-current390-native-source-operator-candidate-author-20261007-v1'),own=resolve(base,'biologie-q1-four-current390-ffef-excerpt-and-four-p-image-binding-independent-b-20261007-v2')
 const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex'),write=(p:string,v:unknown)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'})},rows=(p:string)=>readFileSync(p,'utf8').trim().split('\n').map(s=>JSON.parse(s))
 const landscapePath=read(resolve(oldAuthor,'native/atomicity.four.pending.config.json')).landscapePath,landscape=read(landscapePath),raw=read(resolve(oldAuthor,'four-current-native-whole-goals-cases-source-review-input.author.raw.json')),records=rows(inputRecordsPath),oldRecords=rows(resolve(oldAuthor,'native/positive-four.current-author-candidate.jsonl')),resourceDigests:Record<string,string>={},images:any[]=[]
 if(records.length!==4||records.map((r:any)=>r.goalId).join('|')!==raw.wholeFourGoals.map((g:any)=>g.goalId).join('|'))throw Error('Exact four current author records and order required')
 for(const r of records){
  const g=landscape.goals.find((x:any)=>x.id===r.goalId),whole=raw.wholeFourGoals.find((x:any)=>x.goalId===r.goalId)
  if(JSON.stringify(g)!==JSON.stringify(whole.wholeCandidateGoal))throw Error('Unchanged whole candidate goal differs')
  const links=g.resourceLinks.filter((l:any)=>l.type==='goal-visualization'&&l.resourceType==='image');if(links.length!==1||links[0].role!=='primary')throw Error('Exactly one actual primary goal-visualization image required')
  const link=links[0],selectedPath=resolve(oldAuthor,'selected-existing-images',g.id+'.png'),selectedDigest=sha(readFileSync(selectedPath)),inertPath=resolve('tmp/biologie-q1-four-current390-native-author-20261007-v1-attempt02/app/public',link.url.replace(/^\//,'')),inertDigest=sha(readFileSync(inertPath))
  if(selectedDigest!==inertDigest||selectedDigest!==whole.nativeWholeInput.reviewContext.page.visualization.originalDigest)throw Error('Actual selected/inert/native original image digest mismatch')
  resourceDigests[link.url]=selectedDigest;images.push({goalId:g.id,linkType:link.type,resourceType:link.resourceType,url:link.url,selectedPath,selectedDigest,inertPath,inertDigest,nativeOriginalDigest:whole.nativeWholeInput.reviewContext.page.visualization.originalDigest})
 }
 const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv);const validate=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')),oldCorrectDigestErrors:string[]=[],authorErrors:string[]=[],ownErrors:string[]=[],ownRecords:any[]=[],inputs:any[]=[]
 for(const r of records){
  const g=landscape.goals.find((x:any)=>x.id===r.goalId),input=positiveGoalEvidenceReviewInputPayload(g,r.reviewCriteriaFingerprint,resourceDigests,'curricularAtomic')
  if(input.goalInput.goalVisualizations.length!==1||!input.goalInput.goalVisualizations[0].digest)throw Error('Native input fails non-null PNG digest assertion')
  authorErrors.push(...validatePositiveGoalEvidenceRecordSemantics(r,g,resourceDigests,'curricularAtomic'));if(!validate(r))authorErrors.push(...(validate.errors??[]).map(e=>JSON.stringify(e)))
  const old=oldRecords.find((x:any)=>x.goalId===r.goalId);oldCorrectDigestErrors.push(...validatePositiveGoalEvidenceRecordSemantics(old,g,resourceDigests,'curricularAtomic'))
  const ownRecord={...r,reviewId:'biologie-q1-four-current390-targeted-independent-b-p-current-images-20261007-v2',goalFingerprint:fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(g,r.reviewCriteriaFingerprint,resourceDigests,'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(r.profile),reviewedAt:new Date().toISOString(),reviewer:'OpenAI GPT-6 Codex; targeted independent B after sealed own original first pass',reason:g.id.startsWith('ffef')?'KEEP revised current candidate: explicit marked excerpt of a longer enzyme gene/protein resolves the original four-amino-acid enzyme-context ambiguity. Sequence/frame/copy-origin/function-data reasoning is retained. All four actual PNG bytes independently bound with native goal-visualization digests.':'KEEP unchanged current P body from sealed own first pass; technical input fingerprint is freshly bound to actual selected PNG bytes. No description or visualization review restart.',reviewRunIds:[],status:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E1',maximumClaimScope:'G1'}
  ownErrors.push(...validatePositiveGoalEvidenceRecordSemantics(ownRecord,g,resourceDigests,'curricularAtomic'));if(!validate(ownRecord))ownErrors.push(...(validate.errors??[]).map(e=>JSON.stringify(e)))
  ownRecords.push(ownRecord);inputs.push({goalId:g.id,oldV1ReviewInputFingerprint:old.reviewInputFingerprint,currentAuthorV2ReviewInputFingerprint:r.reviewInputFingerprint,ownCurrentReviewInputFingerprint:ownRecord.reviewInputFingerprint,currentGoalFingerprint:ownRecord.goalFingerprint,currentProfileFingerprint:ownRecord.profileFingerprint,wholeNativeInputPayload:input})
 }
 write(resolve(own,'receipts/own-four-actual-P-image-digests.native-validation.json'),{role:'Actual independent selected PNG bytes, non-null native payload digests, current author and own schema/semantic validations',authorRecordsPath:inputRecordsPath,authorRecordsSHA256:sha(readFileSync(inputRecordsPath)),unchangedCandidateLandscapePath:landscapePath,resourceDigests,images,inputs,oldV1RecordsAgainstActualPNGDigestsErrors:oldCorrectDigestErrors,currentAuthorV2Errors:authorErrors,ownCurrentErrors:ownErrors,ownCurrentRecords:4,ownE1G1AIOnly:true,activeWrites:false,humanApproval:false,strictGain:0})
 if(authorErrors.length||ownErrors.length)throw Error([...authorErrors,...ownErrors].join('\n'))
 const p=resolve(own,'native/positive-four.independent-b.current-images.jsonl');mkdirSync(dirname(p),{recursive:true});writeFileSync(p,ownRecords.map(r=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'})
 console.log(JSON.stringify({actualPNGDigests:Object.keys(resourceDigests).length,nativePayloadsWithNonNullPNG:inputs.length,authorV2Errors:authorErrors.length,ownCurrentErrors:ownErrors.length,oldV1StaleErrors:oldCorrectDigestErrors.length,ownCurrentRecordSHA256:sha(readFileSync(p))}))
}
try{main()}catch(e){console.error(e);process.exitCode=1}
