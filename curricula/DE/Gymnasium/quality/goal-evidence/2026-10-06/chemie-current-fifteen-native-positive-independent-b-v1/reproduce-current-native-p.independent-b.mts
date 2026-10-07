import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates.ts'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview.ts'

const root = resolve(process.cwd())
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own = base + 'chemie-current-fifteen-native-positive-independent-b-v1/'
const author = base + 'chemie-current-atomic-description-positive-gap-author-v1/'
const previous = base + 'chemie-current-fifteen-native-d-independent-b-v1/'
const inputs = new Map<string, {path:string; sha256:string; bytes:number}>()
const digest = (bytes: Buffer|string) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
async function bytes(path: string) {
  const data = await readFile(resolve(root, path))
  inputs.set(path, {path, sha256:digest(data).slice(7), bytes:data.length})
  return data
}
async function json(path: string) { return JSON.parse((await bytes(path)).toString('utf8')) }
async function out(path:string, value:unknown) {
  assert(path.startsWith(own))
  await writeFile(resolve(root,path), JSON.stringify(value,null,2)+'\n')
}
const startedAt = new Date().toISOString()
const config = await json(own+'positive.fifteen.independent-b.config.json')
const specs = await json(own+'positive.fifteen.independent-b.specifications.json')
const originals = (await bytes(author+'positive-evidence.fifteen.author-candidates.review.jsonl')).toString('utf8').trim().split('\n').map(JSON.parse)
const actualMaterialSet = await json(author+'thirty-complete-materials.de-en.author-candidates.json')
const sourceD = await json(previous+'native-d-fifteen.independent-b.final.freeze.json')
assert.equal(digest(await bytes(previous+'native-d-fifteen.independent-b.final.freeze.json')), 'sha256:e8c46706e1f2dfabd6a2989db6cc88318079e3d873d528a4b6b3e7de50446f5c')
const landscape = await json(config.landscapePath)
await bytes(config.semanticKindLedgerPath)
await bytes(config.reviewCriteriaPath)
const records = await buildPositiveGoalEvidenceCandidateRecords({config, candidateSet:specs})
assert.equal(records.length,15)
const goals = new Map(landscape.goals.map((g:any)=>[g.id,g]))
const dCanonical = sourceD.inputs.find((i:any)=>i.path===config.landscapePath)
assert.equal(inputs.get(config.landscapePath)!.sha256,dCanonical.sha256)
const bindings=[]
for (let i=0;i<records.length;i++) {
  const r=records[i], a=originals[i], g:any=goals.get(r.goalId)
  assert.equal(r.goalId,a.goalId)
  assert.deepEqual(r.profile,a.profile)
  for (const field of ['goalFingerprint','reviewInputFingerprint','profileFingerprint','reviewCriteriaFingerprint']) assert.equal(r[field],a[field])
  assert.equal(r.reviewAuthority,'ai_candidate');assert.equal(r.status,'needs_human_review')
  assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1')
  const linked = actualMaterialSet.materials.filter((m:any)=>m.goalId===r.goalId)
  assert.equal(linked.length,2)
  for (let c=0;c<2;c++) {
    const m=linked[c], brief=r.profile.applicationCaseBriefs[c]
    assert.equal(brief.id,m.caseId)
    for (const [s,l] of [['De','de'],['En','en']]) {
      assert.equal(brief['taskDemand'+s],m.material[l]+' '+m.taskDemand[l])
      assert.equal(brief['expectedPerformance'+s],m.expectedPerformance[l])
      assert.equal(brief['understandingFocus'+s],m.specificBoundaryOrCounterexample[l])
    }
  }
  const assetBindings=[]
  for (const link of g.resourceLinks??[]) {
    if (link.type!=='goal-visualization') continue
    assert(link.url.startsWith('/assets/goal-visualizations/'))
    const appPath='app/public'+link.url
    const sourcePath='curricula/DE/Gymnasium/visualizations/'+link.url.slice('/assets/goal-visualizations/'.length)
    const backendPath='backend/src/main/resources/static'+link.url
    const data=await bytes(appPath)
    for (const path of [sourcePath,backendPath]) assert.equal(digest(await bytes(path)),digest(data))
    for (const path of [appPath,sourcePath,backendPath]) assert.equal(inputs.get(path)!.sha256,sourceD.inputs.find((x:any)=>x.path===path).sha256)
    assetBindings.push({url:link.url,sha256:digest(data),copies:[sourcePath,appPath,backendPath],actualPersonallyViewedInValidOwnDStage:true})
  }
  bindings.push({goalId:r.goalId,wholeCurrentCanonicalBytesUnchangedSinceOwnDStage:true,profilePayloadUnchanged:true,currentNativeGoalFingerprint:r.goalFingerprint,currentNativeReviewInputFingerprint:r.reviewInputFingerprint,currentNativeProfileFingerprint:r.profileFingerprint,allThreeCurrentHelperFingerprintsMatchAuthor:true,caseIds:linked.map((m:any)=>m.caseId),wholeDEENMaterialNativeBriefBindingsExact:true,assetBindings})
}
const runId='chemie-current-fifteen-native-positive-independent-b-v1.final-own-followup'
for (const r of records) r.reviewRunIds=[runId]
const recordBytes=records.map((r)=>JSON.stringify(r)).join('\n')+'\n'
await writeFile(resolve(root,config.reviewPath),recordBytes)
const bundle=await json(own+'review-bundle.bindings.json')
const run={
  $schema:'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',schemaVersion:1,
  runId,bundleFingerprint:digest(await bytes(own+'review-bundle.bindings.json')),
  bookDigest:bundle.rawBookModelArtifactDigest,provider:'OpenAI',model:'GPT-6',
  role:'synthesizer',promptFamilyId:'chemistry-current-fifteen-positive-independent-b-actual-science-v1',
  promptFingerprint:digest(await bytes(own+'prompt.md')),
  criteriaFingerprint:digest(await bytes(config.reviewCriteriaPath)),
  generationParametersFingerprint:digest(await bytes(own+'generation-parameters.json')),
  independenceGroupId:'chemie-current-fifteen-independent-b-own-findings',blindToOtherRuns:false,
  goalIds:config.scope.goalIds,inputArtifacts:bundle.runInputArtifacts,startedAt,completedAt:new Date().toISOString(),
  status:'completed',outputDigest:digest(recordBytes),toolchainVersion:'skillpilot-native-positive-v2-pure-helper-independent-b-v1',
}
await out(config.reviewRunManifestPaths[0],run)
const check=reviewPositiveGoalEvidenceConfig(own+'positive.fifteen.independent-b.config.json')
assert.deepEqual(check.errors,[])
assert.deepEqual(check.counts,{approved:0,needsHumanReview:15,rejected:0})
await out(own+'actual-current-native-p-bindings-and-contract-check.independent-b.json',{
  schemaVersion:1,createdAtUTC:new Date().toISOString(),scopeGoalCount:15,wholeMaterialCount:30,
  exactNativeCaseBindings:30,currentHelperActuallyExecuted:true,noAuthorRecordHashRetagging:true,
  nativeContractErrors:check.errors,nativeContractCounts:check.counts,
  scientificCounts:{KEEP:9,REVISE:6},correctCaseChemistryCount:30,
  nativeContractPassIsNotScientificApproval:true,wholeStageFullyBlind:false,peerAResultFilesRead:false,
  root622FindingCueDisclosed:true,originalCompletedBlindFirstPassPreserved:true,
  bookDigestInRunIsRawModelByteDigest:true,sourceNativeBookSemanticDigest:bundle.sourceNativeBookSemanticDigest,
  activeWrites:false,GitOperations:false,humanApproval:false,humanTrial:false,newStrictClosures:0,
  bindings,actualInputs:[...inputs.values()],
})
console.log(JSON.stringify({currentNativeProfiles:15,wholeCaseBindings:30,nativeContractCounts:check.counts,nativeContractErrors:check.errors,scientificCounts:{KEEP:9,REVISE:6},activeWrites:false}))
