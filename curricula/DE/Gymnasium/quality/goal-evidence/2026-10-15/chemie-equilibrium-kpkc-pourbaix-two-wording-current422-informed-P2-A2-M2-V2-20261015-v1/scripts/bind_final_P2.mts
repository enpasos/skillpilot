// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync,renameSync} from 'node:fs'
import {resolve,relative} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const [repo,host,own]=process.argv.slice(2)
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const write=(p:string,d:any)=>{writeFileSync(p+'.partial',JSON.stringify(d,null,2)+'\n');renameSync(p+'.partial',p)}
const rel=(p:string)=>relative(repo,p)
const ctx=read(resolve(own,'inputs/final-two-image-bound-whole-contexts.actual.json'))
const first=read(resolve(own,'science/FIRST.actual-informed-P2.original.json'))
const preflight=read(resolve(own,'checks/P2.lowercase-stock-regex.before-CLI.actual.json'))
if(!preflight.actualStockPatternsMatch)throw new Error('P identifier not preflighted')
const model=await import(pathToFileURL(resolve(host,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const criteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
const promptPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/positive-understanding-evidence-profile-authoring-v2.md'
const criteria=sha(readFileSync(resolve(repo,criteriaPath)))
const reviewId=preflight.reviewId,runId=reviewId+'-actual-informed-synthesis'
const start=new Date().toISOString(),bindings:any[]=[]
const records=first.decisions.map((d:any)=>{
 const row=ctx.wholeContexts.find((r:any)=>r.goal.id===d.goalId),g=row.goal,digests:any={}
 for(const l of g.resourceLinks??[])if(l.type==='goal-visualization'){
  digests[l.url]=sha(readFileSync(resolve(host,'app/public',l.url.slice(1))))
  if(digests[l.url]!==row.actualCurrentNativeImage.sha256)throw new Error('actual image mismatch')
 }
 const resourceAddendum=d.goalId.startsWith('a8ddb351')
  ? ' Die zuvor genannte JPG-Revision ist unverändert erhaltene Historie. Jetzt wird nach eigener tatsächlicher erneuter Bild-/Kontextsichtung der akzeptierte PNG-Nachfolger16a58ebe samt aktuellem ALT gebunden; die ganze P-Wissenschaft und der Profilkörper sind unverändert.'
  : ' Die neue finale globale Bildfassung verändert dieses ganze Pourbaix-Ziel und seine tatsächlich geprüfte PNG nicht; der originale positive Bildkontext und P-Körper bleiben exakt.'
 const record={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,
  reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',
  reviewCriteriaFingerprint:criteria,landscapeId:ctx.landscapeId,goalId:g.id,
  goalFingerprint:model.fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),
  reviewInputFingerprint:model.fingerprintPositiveGoalEvidenceReviewInput(g,criteria,digests,'curricularAtomic'),
  profileFingerprint:model.fingerprintPositiveGoalEvidenceProfile(row.profile),
  status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:first.completedAtUTC,
  reviewer:'Codex C informed P2, original16 material author; not final description/image author; no blind origin claim',
  reason:d.reason+resourceAddendum,evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[runId],
  dissent:[
   'Original16 material authorship disclosed. These are newly reasoned informed P judgments, not an independent blind material-author vote.',
   'All four source/course/D holds remain open. Eight author components and LK declaration remain unreviewed; no official source duty is established.',
   'No learner/laboratory performance, human approval/trial, runtime mastery or M7 is asserted. Independent reasoning and transfer are evidence requirements, not a task-label quota.',
   'Current image bytes and ALT are bound actual inputs. A picture is not a performance demonstration and P grants no additional V vote.',
   'The original Kp JPG negative V-FIRST and actual old views remain exact. Current Kp PNG acceptance is the separate genuine successor V science.',
  ],profile:row.profile}
 const errors=model.validatePositiveGoalEvidenceRecordSemantics(record,g,digests,'curricularAtomic')
 if(errors.length)throw new Error(errors.join('\n'))
 bindings.push({goalId:g.id,resourceDigests:digests,goalFingerprint:record.goalFingerprint,
  reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint,
  wholeProfileBodyExact:true,originalPReasonPreservedAsPrefix:true,actualResourceAddendum:resourceAddendum})
 return record
})
const recordsPath=resolve(own,'normal/P2.final-current-image-bound.E1G1.ai-candidates.jsonl')
writeFileSync(recordsPath,records.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
const inputPath=resolve(own,'inputs/final-two-image-bound-whole-contexts.actual.json')
const parPath=resolve(own,'normal/P2.final-generation-disclosure.json')
write(parPath,{role:'informed synthesizer',original16MaterialAuthor:true,blindToOtherRuns:false,
 notAuthorOfFinalTwoDescriptionsOrImages:true,model:'GPT-6 Codex, exact revision and sampling parameters not exposed',
 timestampMeaning:'Normal materialization after original science FIRST plus separately sealed actual new-image science; no invented reading/trial duration'})
const runPath=resolve(own,'normal/P2.final-informed.run.json')
write(runPath,{$schema:'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',schemaVersion:1,
 runId,bundleFingerprint:sha(readFileSync(inputPath)),bookDigest:sha(readFileSync(inputPath)),provider:'OpenAI',
 model:'GPT-6 Codex; exact revision not exposed',role:'synthesizer',promptFamilyId:'positive-understanding-evidence-profile-authoring-v2',
 promptFingerprint:sha(readFileSync(resolve(repo,promptPath))),criteriaFingerprint:criteria,
 generationParametersFingerprint:sha(readFileSync(parPath)),independenceGroupId:reviewId+'-informed-not-blind',blindToOtherRuns:false,
 goalIds:records.map((r:any)=>r.goalId),inputArtifacts:[{role:'review_input_json',digest:sha(readFileSync(inputPath))},
  {role:'review_prompt',digest:sha(readFileSync(resolve(repo,promptPath)))},{role:'review_criteria',digest:criteria}],
 startedAt:start,completedAt:new Date().toISOString(),status:'completed',outputDigest:sha(readFileSync(recordsPath)),toolchainVersion:'positive-understanding-evidence-v2'})
write(resolve(own,'config/P2.final-current-image-bound.config.json'),{
 $schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,
 reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',
 landscapeId:ctx.landscapeId,landscapePath:'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',
 semanticKindLedgerPath:'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',
 reviewCriteriaPath:criteriaPath,reviewPath:rel(recordsPath),reviewRunManifestPaths:[rel(runPath)],
 reviewedResourceTypes:['goal-visualization'],requireApproved:false,
 scope:{label:'Only two final model-bound contexts, informed E1/G1 design; source/course holds remain',goalIds:records.map((r:any)=>r.goalId)}})
write(resolve(own,'checks/P2.final-stock-fingerprints-and-actual-images.json'),{
 boundAtUTC:new Date().toISOString(),canonical:ctx.finalCanonical,semantic:ctx.finalSemantic,
 records:bindings,originalPScienceExact:true,reviewedResourceTypes:['goal-visualization'],
 blind:false,newVVotes:0,newSourceCourseOrHumanApproval:false})
console.log(JSON.stringify({P2Materialized:2,profileBodiesExact:true,currentActualImagesBound:true,reviewId,identifierPreflight:true}))
