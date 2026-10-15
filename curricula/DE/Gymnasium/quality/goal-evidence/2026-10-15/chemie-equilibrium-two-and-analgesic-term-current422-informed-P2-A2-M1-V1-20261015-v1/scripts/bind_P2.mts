// SPDX-License-Identifier: Apache-2.0
import {readFileSync, writeFileSync, renameSync} from 'node:fs'
import {resolve, relative} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const [repo,host,own]=process.argv.slice(2)
const rel=(p:string)=>relative(repo,p)
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const write=(p:string,d:any)=>{writeFileSync(p+'.partial',JSON.stringify(d,null,2)+'\n');renameSync(p+'.partial',p)}
const model=await import(pathToFileURL(resolve(host,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const context=read(resolve(own,'inputs/whole-three-contexts-two-profiles-six-cases.actual.json'))
const firstPath=resolve(own,'science/FIRST.actual-informed-P2.original.json')
const first=read(firstPath),firstSeal=read(resolve(own,'science/FIRST.actual-informed-P2.seal.json'))
for(const r of firstSeal.files){if(sha(readFileSync(resolve(repo,r.path)))!==r.sha256)throw new Error('FIRST changed')}
if(firstSeal.normalNewRecordsAtSeal!==0||firstSeal.normalNewFingerprintsAtSeal!==0)throw new Error('FIRST sequence')
const criteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
const promptPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/positive-understanding-evidence-profile-authoring-v2.md'
const criteria=sha(readFileSync(resolve(repo,criteriaPath)))
const canonicalAlias='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const semanticAlias='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const canonical=read(resolve(host,canonicalAlias))
const semantic=read(resolve(host,semanticAlias))
const reviewId='chemie-equilibrium-two-current-final-informed-P2-20261015-v1'
const runId=reviewId+'-actual-informed-synthesis'
const inputPath=resolve(own,'inputs/whole-three-contexts-two-profiles-six-cases.actual.json')
const startedAt=new Date().toISOString()
const bindings:any[]=[]
const records=first.decisions.map((d:any)=>{
 const g=canonical.goals.find((g:any)=>g.id===d.goalId)
 const ctx=context.wholeContexts.find((c:any)=>c.goal.id===d.goalId)
 if(JSON.stringify(g)!==JSON.stringify(ctx.goal))throw new Error('whole current goal mismatch')
 const digests:any={}
 for(const link of g.resourceLinks??[]){if(link.type==='goal-visualization'){
   const b=readFileSync(resolve(host,'app/public',link.url.slice(1)));digests[link.url]=sha(b)
   if(digests[link.url]!==ctx.actualImage.sha256)throw new Error('actual image mismatch')
 }}
 const kind=semantic.decisions.find((s:any)=>s.goalId===d.goalId)?.semanticKind
 if(kind!=='curricularAtomic')throw new Error('unexpected semantic kind')
 const profile=context.wholeProfiles2.find((p:any)=>p.goalId===d.goalId).profile
 const record={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,
  reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',
  reviewCriteriaFingerprint:criteria,landscapeId:canonical.landscapeId,goalId:d.goalId,
  goalFingerprint:model.fingerprintGoalForPositiveEvidence(g,kind),
  reviewInputFingerprint:model.fingerprintPositiveGoalEvidenceReviewInput(g,criteria,digests,kind),
  profileFingerprint:model.fingerprintPositiveGoalEvidenceProfile(profile),
  status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:first.completedAtUTC,
  reviewer:'Codex C informed P2; original equilibrium16 material author, not author of final text/B correction; no blind claim',
  reason:d.reason,evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[runId],
  dissent:[
   'Informed role: original16 material author; no independent blind material-author review claimed. The final wording and B correction were actually read anew.',
   'Both goals retain their unresolved D/source/course holds. Positive assessment design does not establish curricular duty, national source coverage or M7.',
   'No actual learner or laboratory performance, human approval, trial or runtime mastery is asserted. The profile is a future E1/G1 AI candidate.',
   'Image bytes/ALT are honestly bound current inputs; recognizing the picture is not a demonstration. Both complete cases for each goal stand independently of the image.',
   first.profileInterpretation,
  ],profile}
 const errors=model.validatePositiveGoalEvidenceRecordSemantics(record,g,digests,kind)
 if(errors.length)throw new Error(errors.join('\n'))
 bindings.push({goalId:d.goalId,resourceDigests:digests,goalFingerprint:record.goalFingerprint,
  reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint,
  profileBodyExactToActuallyReadBSuccessor:true})
 return record
})
const recordsPath=resolve(own,'normal/P2.current-image-bound.E1G1.ai-candidates.jsonl')
writeFileSync(recordsPath,records.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
const parameters={role:'informed synthesizer',blindToOtherRuns:false,original16MaterialAuthor:true,
 notAuthorOfLaterFourDescriptionsOrBMaterialCorrection:true,model:'GPT-6 Codex; exact revision and sampling settings not exposed',
 timestampMeaning:'Normal binding after separately sealed actual science; no invented reading or learner duration',
 FIRST:sha(readFileSync(firstPath))}
const parametersPath=resolve(own,'normal/P2.generation-disclosure.json');write(parametersPath,parameters)
const run={$schema:'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',schemaVersion:1,
 runId,bundleFingerprint:sha(readFileSync(inputPath)),bookDigest:sha(readFileSync(inputPath)),provider:'OpenAI',
 model:'GPT-6 Codex; exact revision not exposed',role:'synthesizer',promptFamilyId:'positive-understanding-evidence-profile-authoring-v2',
 promptFingerprint:sha(readFileSync(resolve(repo,promptPath))),criteriaFingerprint:criteria,
 generationParametersFingerprint:sha(readFileSync(parametersPath)),independenceGroupId:reviewId+'-informed-not-blind',
 blindToOtherRuns:false,goalIds:records.map((r:any)=>r.goalId),
 inputArtifacts:[{role:'review_input_json',digest:sha(readFileSync(inputPath))},
  {role:'review_prompt',digest:sha(readFileSync(resolve(repo,promptPath)))},{role:'review_criteria',digest:criteria}],
 startedAt,completedAt:new Date().toISOString(),status:'completed',outputDigest:sha(readFileSync(recordsPath)),
 toolchainVersion:'positive-understanding-evidence-v2'}
const runPath=resolve(own,'normal/P2.actual-informed.run.json');write(runPath,run)
write(resolve(own,'config/P2.current-image-bound.config.json'),{
 $schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId,
 goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',
 landscapeId:canonical.landscapeId,landscapePath:canonicalAlias,semanticKindLedgerPath:semanticAlias,
 reviewCriteriaPath:criteriaPath,reviewPath:rel(recordsPath),reviewRunManifestPaths:[rel(runPath)],
 reviewedResourceTypes:['goal-visualization'],requireApproved:false,
 scope:{label:'Only e0/1a informed E1/G1 profile design; D/source/course holds retained',goalIds:records.map((r:any)=>r.goalId)}})
write(resolve(own,'checks/P2.actual-stock-fingerprints-and-image-binding.json'),{
 boundAtUTC:new Date().toISOString(),finalCanonical:context.finalCanonical,finalSemantic:context.finalSemantic,
 FIRSTBeforeBinding:true,reviewedResourceTypes:['goal-visualization'],records:bindings,
 newVVotesByP:0,humanApproval:false,sourceCourseApproval:false})
console.log(JSON.stringify({P2Materialized:2,profileBodiesExact:true,E1G1:true,aiCandidates:true,imageBound:true,blind:false}))
