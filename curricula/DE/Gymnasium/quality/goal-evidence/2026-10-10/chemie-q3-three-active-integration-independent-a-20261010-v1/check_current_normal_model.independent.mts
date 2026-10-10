import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { buildGoalBookModel, parseAndValidateGoalBookModel, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'

const own = dirname(fileURLToPath(import.meta.url))
const repo = resolve(own, '../../../../../../..')
const parse = (p:string) => JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const hash = (x:Buffer|string) => `sha256:${createHash('sha256').update(x).digest('hex')}`
const prior = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-source-adoption-technical-independent-a-20261010-v1'
const parent = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-reviewed-active-integration-technical-v1'
const checked = checkGoalBookSourceAtlasInputs('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json',repo)
const previousSource = parse(`${prior}/independent-normal-source-projection.full.actual.json`)
assert.deepEqual(checked.receipt.counts,previousSource.counts)
assert.deepEqual(checked.receipt.omittedGoals,previousSource.omittedGoals)
assert.deepEqual(checked.receipt.unresolvedSourceScopes,previousSource.unresolvedSourceScopes)
assert.deepEqual(checked.receipt.scopes.map((s:any)=>({key:s.key,goalIds:s.goalIds})),previousSource.scopes.map((s:any)=>({key:s.key,goalIds:s.goalIds})))
for(const binding of previousSource.outputBindings) assert.equal(hash(checked.outputs[binding.path]),binding.sha256,binding.path)
const config=parse('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json')
const manifest=parse(config.compositionViewManifestPath)
const qa=parse('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
const digests:Record<string,string>={}
const pngBindings=[]
const newIds=['d2d735de-bede-5310-8aeb-8bb7562c7b75','a0f6ba09-f072-5887-a797-fa369453c62a','7b39fa19-fec3-575e-9324-a3226b703358']
for(const row of qa.records) {
 if(row.visualizationState!=='available') continue
 const d=hash(readFileSync(resolve(repo,row.publicAssetPath)))
 assert.equal(d,row.assetSha256,row.goalId);digests[row.imageUrl]=d
 if(newIds.includes(row.goalId)) {
  assert.equal(hash(readFileSync(resolve(repo,row.canonicalAssetPath))),d)
  const backendPath=`backend/src/main/resources/static${row.imageUrl}`
  assert.equal(hash(readFileSync(resolve(repo,backendPath))),d)
  assert.equal(row.aiApproved,'yes');assert.equal(row.aiApprovedAssetSha256,d);assert.equal(row.humanApproved,'no')
  pngBindings.push({goalId:row.goalId,canonicalAssetPath:row.canonicalAssetPath,publicAssetPath:row.publicAssetPath,backendPath,sha256:d,existingMachineApprovalRetained:true,humanApproval:false,newVisualReviewClaim:false})
 }
}
const model=buildGoalBookModel({landscape:parse(config.landscapePath),compositionViewManifest:manifest,
 compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:parse(path)})),navigationView:parse(manifest.navigationViewPath),
 durationModelPolicy:parse(manifest.durationModelPolicyPath),semanticKindLedger:parse(config.semanticKindLedgerPath),goalVisualizationQa:qa,
 goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config})
parseAndValidateGoalBookModel(model)
const previousModel=parse(`${prior}/independent-normal-national-model.full.actual.json`)
const previousPages=new Map(previousModel.pages.map((p:any)=>[p.goalId,p]))
assert.equal(model.pages.length,362)
assert.equal(previousPages.size,362)
for(const page of model.pages) assert.deepEqual(page,previousPages.get(page.goalId),page.goalId)
const protectedInput=parse(`${parent}/before/national172-existing-page-bindings-and-five-omissions.actual.json`)
const protectedPages=protectedInput.protectedPublishedWholePageBindings.map((old:any)=>{
 const page=model.pages.find(p=>p.goalId===old.goalId)!
 assert.ok(page);assert.equal(page.pageFingerprint,old.pageFingerprint)
 assert.equal(hash(stableGoalBookJson(page)),old.wholePageSha256)
 return {goalId:page.goalId,pageFingerprint:page.pageFingerprint,wholePageSha256:hash(stableGoalBookJson(page))}
})
assert.equal(protectedPages.length,172)
for(const id of protectedInput.protectedPreviouslyOmittedGoalIds) assert.ok(!model.pages.some(p=>p.goalId===id))
const proof={schemaVersion:1,role:'Independent current active technical integration; normal model-only APIs, no full book render',actualExitCode:0,
 normalApis:['checkGoalBookSourceAtlasInputs','buildGoalBookModel','parseAndValidateGoalBookModel'],sourceCounts:checked.receipt.counts,
 actual50CurrentSourceOutputBytesExactToOwnPriorIndependentReconstruction:true,whole48ScopeGoalSetsExact:true,whole496UnresolvedAnd19OmissionsExact:true,
 currentFull362PagesExactToOwnPriorIndependentReconstruction:true,protected172WholeNationalPageBindings:protectedPages,
 protectedFivePreviouslyOmittedStrictGoals:protectedInput.protectedPreviouslyOmittedGoalIds,newThreePngBindings:pngBindings,
 canonicalNativeOnlyDescriptionReviewBoundaryRetained:true,nationalPageOrRouteApprovalClaim:false,newScienceReviewClaim:false,newVisualReviewClaim:false,
 humanApproval:false,humanTrial:false,actualLearnerExperimentClaim:false,activeWrites:0}
writeFileSync(resolve(own,'current-active-normal-model-and-projection.independent.actual.json'),`${JSON.stringify(proof,null,2)}\n`)
console.log(JSON.stringify({actualExitCode:0,counts:proof.sourceCounts,protectedPages:protectedPages.length,oldOmissions:5,currentFullPagesExact:362,pngCopiesExact:3,activeWrites:0}))
