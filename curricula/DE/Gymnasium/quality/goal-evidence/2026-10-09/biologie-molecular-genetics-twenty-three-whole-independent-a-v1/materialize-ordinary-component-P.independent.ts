import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview'

async function main() {
const root = '/home/enpasos/projects/skillpilot'
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
const author = `${base}/biologie-molecular-genetics-twenty-three-whole-author-v1`
const own = `${base}/biologie-molecular-genetics-twenty-three-whole-independent-a-v1`
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const digest = (p: string) => `sha256:${createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')}`
const write = (p: string, body: unknown) => writeFileSync(resolve(root,p), JSON.stringify(body,null,2)+'\n',{flag:'wx'})
const first = read(`${own}/whole23-science-source-scope-P.first.independent-A.verdict.json`)
const authorConfig = read(`${author}/twenty-three-whole-positive.author-candidate.config.json`)
const runId = 'biologie-molecular-genetics23-independent-A-component-P-first'
const reviewId = 'biologie-molecular-genetics-twenty-three-whole-independent-a-v1'
const reviewedAt = first.firstJudgmentAt
const ownConfig = {...authorConfig, reviewId, reviewPath:`${own}/ordinary-component-P.first.independent-A.records.jsonl`,reviewRunManifestPaths:[`${own}/ordinary-component-P.first.independent-A.run.json`], scope:{...authorConfig.scope,label:'Independent whole23 science/material first, component P only; native resources/pages pending'}}
const materials = read(`${author}/twenty-three-whole46-bilingual-cases-and-P.author-candidate.json`)
const candidateSet = {schemaVersion:1,authoringContract:'positive-understanding-evidence-candidates-v1',reviewId,reviewedAt,reviewer:'/root/bio_science14_independent_a',goals:materials.entries.map((e: any,i: number)=>({goalId:e.goalId,reason:`Own actual whole DE/EN goal/profile/two-case/transfer/source-partner reading: ${first.perGoalJudgments[i].status}. ${first.perGoalJudgments[i].heterogeneityJudgment} ${first.perGoalJudgments[i].sourceAndClaimLimit} Pair-level coverage is independently described in the sealed first verdict; generic rubric references do not prove every listed performance in each case. Component review only; current native D/P/V and whole-source/course/view approval remain open.`,evidenceLevel:'E1',maximumClaimScope:'G1',dissent:first.perGoalJudgments[i].findings,profile:e.wholeProfile}))}
const records = await buildPositiveGoalEvidenceCandidateRecords({config:ownConfig,candidateSet})
for (const record of records) record.reviewRunIds=[runId]
writeFileSync(resolve(root,ownConfig.reviewPath),records.map(r=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'})
write(`${own}/ordinary-component-P.first.independent-A.config.json`,ownConfig)
write(`${own}/ordinary-component-P.first.independent-A.candidate-set.json`,candidateSet)
const protocol = `${own}/actual-assigned-review-protocol.md`
const generationPath = `${own}/ordinary-component-P.actual-unexposed-generation-metadata.json`
write(generationPath,{provider:'OpenAI',actualModelVariantExposedByTooling:false,model:'unexposed-by-tooling',temperatureExposed:false,seedExposed:false,execution:'Actual independent whole semantic review followed by ordinary-record materialization; no new review claimed by JSONL production',promptBinding:'Written reconstruction of assigned conversational instructions, materialized after first judgment; not a raw provider prompt dump'})
const freeze = read(`${own}/whole23-science.actual-input.first.freeze.json`)
const run = {$schema:'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',schemaVersion:1,runId,bundleFingerprint:digest(`${author}/neutral-whole23-source38-partners44-P23-cases46.author-independent-review.entry.json`),bookDigest:digest(ownConfig.landscapePath),provider:'OpenAI',model:'unexposed-by-tooling',role:'subject_reviewer',promptFamilyId:'bio23-whole-science-component-P-independent-A-v1',promptFingerprint:digest(protocol),criteriaFingerprint:digest(ownConfig.reviewCriteriaPath),generationParametersFingerprint:digest(generationPath),independenceGroupId:'bio23-whole-science-independent-A-first',blindToOtherRuns:true,goalIds:records.map(r=>r.goalId),inputArtifacts:[{role:'book_model',digest:digest(ownConfig.landscapePath)},{role:'review_input_json',digest:digest(`${author}/twenty-three-whole46-bilingual-cases-and-P.author-candidate.json`)},{role:'review_prompt',digest:digest(protocol)},{role:'review_criteria',digest:digest(ownConfig.reviewCriteriaPath)},{role:'finding_schema',digest:digest('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')},{role:'run_manifest_schema',digest:digest('contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json')}],startedAt:freeze.startedAt,completedAt:new Date().toISOString(),status:'completed',outputDigest:digest(ownConfig.reviewPath),toolchainVersion:'positive-understanding-evidence-v2-independent-component-materialization'}
write(ownConfig.reviewRunManifestPaths[0],run)
const result=reviewPositiveGoalEvidenceConfig(`${own}/ordinary-component-P.first.independent-A.config.json`)
write(`${own}/ordinary-component-P.first.independent-A.actual-validator-result.json`,result)
console.log(JSON.stringify({records:result.records.length,counts:result.counts,errors:result.errors,config:`${own}/ordinary-component-P.first.independent-A.config.json`}))
}
main().catch(error=>{console.error(error);process.exitCode=1})
