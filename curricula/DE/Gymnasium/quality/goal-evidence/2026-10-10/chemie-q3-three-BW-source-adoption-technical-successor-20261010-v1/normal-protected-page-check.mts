import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookModel, parseAndValidateGoalBookModel, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'

const packageRoot=dirname(fileURLToPath(import.meta.url))
const repository=resolve(packageRoot,'../../../../../../..')
const executionRoot=resolve(process.argv[2]??'')
const preparedRoot=resolve(process.argv[3]??'')
assert.ok(process.argv[2]&&process.argv[3], 'Supply completed normal source capsule and unchanged prepared root')
const parse=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const digest=(b:Buffer|string)=>`sha256:${createHash('sha256').update(b).digest('hex')}`
const entry=parse(resolve(packageRoot,'neutral-three-BW-source-adoption.independent-review.entry.json'))
const configPath='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json'
const config=parse(resolve(repository,configPath))
const manifest=parse(resolve(executionRoot,config.compositionViewManifestPath))
const landscape=parse(resolve(repository,entry.frozenFuture484Canonical.path))
const qa=parse(resolve(packageRoot,'inputs/future-381-visual-qa.operative-path.exact.json'))
const digests:Record<string,string>={}
for(const row of qa.records) {
  if(row.visualizationState!=='available') continue
  const root=entry.newGoalIds.includes(row.goalId)?preparedRoot:repository
  const actual=digest(readFileSync(resolve(root,row.publicAssetPath)))
  assert.equal(actual,row.assetSha256)
  digests[row.imageUrl]=actual
}
const model=buildGoalBookModel({
  landscape,
  compositionViewManifest:manifest,
  compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:parse(resolve(executionRoot,path))})),
  navigationView:parse(resolve(executionRoot,manifest.navigationViewPath)),
  durationModelPolicy:parse(resolve(executionRoot,manifest.durationModelPolicyPath)),
  semanticKindLedger:parse(resolve(repository,entry.future381SemanticLedger.path)),
  goalVisualizationQa:qa,goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config,
})
parseAndValidateGoalBookModel(model)
const oldBytes=readFileSync(resolve(repository,'app/public/lernzielbuch/de-gym-chemie-bundesweit.book-model.json'))
const published=parse(resolve(repository,'app/public/lernzielbuch/de-gym-chemie-bundesweit.book-model.json'))
const old=new Map(published.pages.map((p:any)=>[p.goalId,p]))
const protectedIds:string[]=parse(resolve(repository,entry.protectedAllFiveGoalIdSets.path)).subjects.find((s:any)=>s.subject==='chemie').strictCompleteGoalIds
assert.equal(protectedIds.length,177)
const protectedBindings=[]
const absentProtected=protectedIds.filter(id=>!old.has(id))
assert.equal(absentProtected.length,5)
assert.deepEqual(protectedIds.filter(id=>!model.pages.some(p=>p.goalId===id)),absentProtected)
for(const id of protectedIds) {
  if(absentProtected.includes(id)) continue
  const p=model.pages.find(p=>p.goalId===id)
  assert.ok(p)
  assert.deepEqual(p,old.get(id),`Protected current page changed for ${id}`)
  protectedBindings.push({goalId:id,pageFingerprint:p.pageFingerprint})
}
const changed=model.pages.filter(p=>old.has(p.goalId)&&stableGoalBookJson(p)!==stableGoalBookJson(old.get(p.goalId)))
assert.equal(model.pages.length,362)
assert.ok(changed.every(p=>!protectedIds.includes(p.goalId)))
const receipt={schemaVersion:1,normalApis:['buildGoalBookModel','parseAndValidateGoalBookModel'],actualExitCode:0,
  normalModelDigest:model.digest,
  publishedBaseline:{path:'app/public/lernzielbuch/de-gym-chemie-bundesweit.book-model.json',sha256:digest(oldBytes),modelDigest:published.digest,pages:published.pages.length},
  candidatePages:model.pages.length,
  protected177CanonicalGoalBodiesExact:'separate normal-source-adoption.actual.json',
  protected172NationalFullPageBodiesAndFingerprintsExact:true,protectedBindings,
  protectedFivePreviouslyOmittedNationalGoalIdsExact:absentProtected,
  changedUnprotectedExistingPages:changed.map(p=>({goalId:p.goalId,changedFields:Object.keys(p).filter(k=>stableGoalBookJson((p as any)[k])!==stableGoalBookJson((old.get(p.goalId) as any)[k]))})),
  newPages:model.pages.filter(p=>entry.newGoalIds.includes(p.goalId)).map(p=>({goalId:p.goalId,pageFingerprint:p.pageFingerprint})),
  renderOrFreshVisualInspectionClaim:false,additionalScienceReviewClaim:false,humanApprovalClaim:false,strictGain:0,activeWrites:0,
}
writeFileSync(resolve(executionRoot,'normal-national-model.actual.json'),`${JSON.stringify(model,null,2)}\n`)
writeFileSync(resolve(packageRoot,'checks/normal-protected-pages.actual.json'),`${JSON.stringify(receipt,null,2)}\n`)
console.log(JSON.stringify({normalApis:receipt.normalApis,actualExitCode:0,protected172NationalFullPageBodiesExact:true,protectedFivePreviouslyOmittedNationalGoalIdsExact:absentProtected,normalModelDigest:model.digest,candidatePages:model.pages.length,changedUnprotectedExistingPages:receipt.changedUnprotectedExistingPages,strictGain:0,activeWrites:0},null,2))
