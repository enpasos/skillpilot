import { readFile,writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig } from './positiveGoalEvidenceReview'
const root='/home/enpasos/projects/skillpilot'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-nineteen-native-v2-independent-a-v1'
const native='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1/nineteen-operative-native-preparation-v2'
const digest=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const read=async(p:string)=>JSON.parse(await readFile(resolve(root,p),'utf8'))
const main=async()=>{
const executionStartedAt=new Date().toISOString(); const config=await read(`${own}/current-nineteen-P-frame.normal.config.json`);const candidates=await read(`${own}/current-nineteen-P-frame.normal-contract-v2.candidate-set.json`)
const records=await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:candidates});const runId='chemie-b008-current-native19-P-frame-independent-A-20261009-first';for(const r of records)r.reviewRunIds=[runId]
const bytes=records.map(r=>JSON.stringify(r)).join('\n')+'\n';await writeFile(resolve(root,config.reviewPath),bytes,{flag:'wx'})
const campaign=await read(`${native}/native-nineteen/round-b/description-review-campaign.json`);const inputFirst=await read(`${own}/input/native-nineteen-current-input.first.freeze.json`)
const bind=async(role:string,path:string)=>({role,digest:digest(await readFile(resolve(root,path)))})
const prompt=await bind('review_prompt',`${own}/current-nineteen-P-frame.actual-effective-review-prompt.md`);const criteria=await bind('review_criteria',config.reviewCriteriaPath)
const params=digest(await readFile(resolve(root,`${own}/current-nineteen-P-frame.actual-generation-parameters.json`)))
const artifacts=[prompt,criteria,await bind('book_pdf',`${native}/native-nineteen/bundle/book.pdf`),await bind('book_html',`${native}/native-nineteen/bundle/book.html`),await bind('review_input_json',`${native}/current-nineteen-thirty-eight-operative-cases-and-whole-profiles.neutral-input.json`),await bind('run_manifest_schema','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json')]
const run={$schema:'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',schemaVersion:1,runId,bundleFingerprint:campaign.bundleFingerprint,bookDigest:campaign.bookDigest,provider:'OpenAI',model:'unexposed-by-current-tool',role:'subject_reviewer',promptFamilyId:'positive-understanding-evidence-v2-native-frame-independent-review',promptFingerprint:prompt.digest,criteriaFingerprint:criteria.digest,generationParametersFingerprint:params,independenceGroupId:'chemie-b008-current-native19-P-frame-independent-A-20261009',blindToOtherRuns:true,goalIds:records.map(r=>r.goalId),inputArtifacts:artifacts,startedAt:inputFirst.startedAt,completedAt:new Date().toISOString(),status:'completed',outputDigest:digest(bytes),toolchainVersion:'normal-byte-exact-P19-native-frame-validator-capsule-v1'}
await writeFile(resolve(root,`${own}/current-nineteen-P-frame.normal.run.json`),JSON.stringify(run,null,2)+'\n',{flag:'wx'})
const result=reviewPositiveGoalEvidenceConfig(`${own}/current-nineteen-P-frame.normal.config.json`)
const summary={schemaVersion:1,role:'Actual normal buildPositiveGoalEvidenceCandidateRecords and reviewPositiveGoalEvidenceConfig with exact inactive current assets and selected whole-goal/profile bodies; no source gate approval',executionStartedAt,completedAt:new Date().toISOString(),actualModuleRoot:`${own}/ordinary-P19-validation-capsule`,normalImplementationByteExact:true,configPath:`${own}/current-nineteen-P-frame.normal.config.json`,errors:result.errors,records:result.records.length,counts:result.counts,goalIds:result.records.map(r=>r.goalId),recordStatus:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E1',maximumClaimScope:'G1',recordsDigest:digest(bytes),normalRunId:runId,currentActiveIntegration:false,currentWholeSourceCourseAtlasApproval:false,humanApproval:false,humanTrial:false,netStrictGain:0}
await writeFile(resolve(root,`${own}/current-nineteen-P-frame.normal.schema-semantics.actual-validation.json`),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(summary,null,2));if(result.errors.length)process.exitCode=1
}
main().catch(e=>{console.error(e);process.exitCode=1})
