import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../../app/scripts/positiveGoalEvidenceReview'

async function main() {
const root='/home/enpasos/projects/skillpilot'
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
const author=`${base}/biologie-molecular-genetics-twenty-three-whole-author-v1/remediation-v2`
const own=`${base}/biologie-molecular-genetics-twenty-three-whole-independent-a-v1/targeted-two-fidelity-remediation-v2`
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const digest=(p:string)=>`sha256:${createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')}`
const write=(p:string,x:unknown)=>writeFileSync(resolve(root,p),JSON.stringify(x,null,2)+'\n',{flag:'wx'})
const first=read(`${own}/targeted-two-fidelity-and-pair-rubrics.first.independent-A.verdict.json`)
const input=read(`${own}/targeted-two-remediation-v2.independent-A.input.first.freeze.json`)
const ids=first.perTargetedGoalJudgments.map((g:any)=>g.goalId)
const runId='bio23-targeted-two-fidelity-v2-independent-a-component-p2-normal-successor'
const reviewId='bio23-targeted-two-fidelity-v2-independent-a'
const config={...read(`${author}/twenty-three-whole-positive.v2.author-candidate.config.json`),reviewId,reviewPath:`${own}/ordinary-targeted-component-P2.v2.independent-A.records.jsonl`,reviewRunManifestPaths:[`${own}/ordinary-targeted-component-P2.v2.independent-A.run.json`],scope:{label:'Own genuine targeted two-goal fidelity/component P successor;21 old scientific judgments are separate exact reuse; no native/current image approval',goalIds:ids}}
const materials=read(`${author}/twenty-three-whole46-bilingual-cases-and-P.v2.author-candidate.json`)
const selected=materials.entries.filter((e:any)=>ids.includes(e.goalId))
const candidateSet={schemaVersion:1,authoringContract:'positive-understanding-evidence-candidates-v1',reviewId,reviewedAt:first.firstJudgmentAt,reviewer:'/root/bio_science14_independent_a',goals:selected.map((e:any)=>{const judgment=first.perTargetedGoalJudgments.find((g:any)=>g.goalId===e.goalId);return {goalId:e.goalId,reason:`Own genuine targeted whole DE/EN goal/profile/two-case followup: ${judgment.ownIndependentScientificAndFidelityReason} ${judgment.sourceScopeAndAtomarityObservation} Explicit pair-level rubric references score only requested/shown subperformance, no additional task quota. The original science FIRST remains immutable. Component only; all current native/image/source/course/view/Human gates remain separate.`,dissent:[],evidenceLevel:'E1',maximumClaimScope:'G1',profile:e.wholeProfile}})}
const records=await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet})
for(const record of records)record.reviewRunIds=[runId]
writeFileSync(resolve(root,config.reviewPath),records.map(r=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'})
write(`${own}/ordinary-targeted-component-P2.v2.independent-A.config.json`,config)
write(`${own}/ordinary-targeted-component-P2.v2.independent-A.candidate-set.json`,candidateSet)
const parameters=`${own}/ordinary-targeted-component-P2.v2.actual-model-disclosure.json`
write(parameters,{provider:'OpenAI',model:'unexposed-by-tooling',actualModelVariantExposed:false,temperatureExposed:false,seedExposed:false,execution:'Actual independent targeted semantic followup followed by ordinary P2 materialization; no new review claimed by serialization',promptDisclosure:'Assigned conversational instructions reconstructed after first followup for the portable run; not raw model/system prompt',peerRootShortOutcomeReceivedAfterOwnSemanticFirst:true,ownFirstJudgmentUnchanged:true,normalMaterializationSuccessor:'Corrected lowercase reviewId schema pattern only; same already-reviewed profile bodies and own sealed judgments'})
const prompt=`${own}/actual-targeted-followup-protocol.md`
write(config.reviewRunManifestPaths[0],{$schema:'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',schemaVersion:1,runId,bundleFingerprint:digest(`${author}/neutral-whole23-targeted-two-fidelity-remedies-and-honest-pair-rubrics.author-review.entry.json`),bookDigest:digest(config.landscapePath),provider:'OpenAI',model:'unexposed-by-tooling',role:'subject_reviewer',promptFamilyId:'bio23-targeted-two-fidelity-science-component-P2-A-v2',promptFingerprint:digest(prompt),criteriaFingerprint:digest(config.reviewCriteriaPath),generationParametersFingerprint:digest(parameters),independenceGroupId:'bio23-targeted-two-fidelity-independent-A',blindToOtherRuns:true,goalIds:ids,inputArtifacts:[{role:'book_model',digest:digest(config.landscapePath)},{role:'review_input_json',digest:digest(`${author}/twenty-three-whole46-bilingual-cases-and-P.v2.author-candidate.json`)},{role:'review_prompt',digest:digest(prompt)},{role:'review_criteria',digest:digest(config.reviewCriteriaPath)},{role:'finding_schema',digest:digest('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')},{role:'run_manifest_schema',digest:digest('contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json')}],startedAt:input.frozenAt,completedAt:new Date().toISOString(),status:'completed',outputDigest:digest(config.reviewPath),toolchainVersion:'positive-understanding-evidence-v2-targeted-independent-component-materialization'})
const result=reviewPositiveGoalEvidenceConfig(`${own}/ordinary-targeted-component-P2.v2.independent-A.config.json`)
write(`${own}/ordinary-targeted-component-P2.v2.independent-A.actual-validator-result.json`,result)
console.log(JSON.stringify({records:result.records.length,counts:result.counts,errors:result.errors}))
}
main().catch(error=>{console.error(error);process.exitCode=1})
