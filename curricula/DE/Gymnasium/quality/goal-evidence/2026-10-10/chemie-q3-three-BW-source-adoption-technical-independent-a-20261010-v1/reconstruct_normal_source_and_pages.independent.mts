import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs, checkGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { buildGoalBookModel, parseAndValidateGoalBookModel, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'

const own = dirname(fileURLToPath(import.meta.url))
const repo = resolve(own, '../../../../../../..')
const authorRel = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-source-adoption-technical-successor-20261010-v1'
const author = resolve(repo, authorRel)
const parse = (path:string) => JSON.parse(readFileSync(path, 'utf8'))
const digest = (data:Buffer|string) => `sha256:${createHash('sha256').update(data).digest('hex')}`
const entry = parse(resolve(author,'neutral-three-BW-source-adoption.independent-review.entry.json'))
const scratch = resolve(process.argv[2] ?? '')
assert.ok(process.argv[2] && scratch.startsWith(`${repo}/tmp/`), 'Use a new ignored capsule under repository tmp')
assert.ok(!existsSync(scratch), 'Never overwrite any previous capsule')
const candidate = parse(resolve(repo, entry.normalSourceCandidateConfig.path))
const transportBindings = parse(resolve(author,'checks/normal-source-adoption.actual.json')).copiedInputs
const substitutions:Record<string,string> = {
  [candidate.landscapePath]: entry.frozenFuture484Canonical.path,
  [candidate.semanticKindLedgerPath]: entry.future381SemanticLedger.path,
  ['curricula/DE/Gymnasium/input/BW/upper-secondary/source-extraction/DE_BW_CHEMIE_SEKII_BP2016_V2.source-extraction.json']: entry.whole126SourceExtraction.path,
  ['curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json']: entry.preparedRehearsal220MappingExactSnapshot.path,
}
const actualInputs=[]
for (const expected of transportBindings) {
  const source=resolve(repo,substitutions[expected.path] ?? expected.path)
  const bytes=readFileSync(source)
  assert.equal(digest(bytes),expected.sha256,expected.path)
  assert.equal(bytes.length,expected.bytes,expected.path)
  const destination=resolve(scratch,expected.path)
  assert.ok(destination.startsWith(`${scratch}/`))
  mkdirSync(dirname(destination),{recursive:true})
  writeFileSync(destination,bytes)
  actualInputs.push({path:expected.path,sourcePath:substitutions[expected.path]??expected.path,sha256:digest(bytes),bytes:bytes.length})
}
const source=buildGoalBookSourceAtlasInputs(candidate,scratch)
for (const [path,bytes] of Object.entries(source.outputs)) {
  const destination=resolve(scratch,path)
  assert.ok(destination.startsWith(`${scratch}/`))
  mkdirSync(dirname(destination),{recursive:true})
  writeFileSync(destination,bytes)
}
const checked=checkGoalBookSourceAtlasInputs(entry.normalSourceCandidateConfig.path,scratch)
assert.deepEqual(checked.outputs,source.outputs)
const before=parse(resolve(author,'inputs/normal-prepared-source-projection.selected-fields.snapshot.json'))
assert.deepEqual(source.receipt.counts,before.counts)
assert.deepEqual(source.receipt.omittedGoals,before.omittedGoals)
assert.deepEqual(source.receipt.unresolvedSourceScopes,before.unresolvedSourceScopes)
const normalizeScopes=(receipt:any)=>receipt.scopes.map((s:any)=>({key:s.key,goalIds:s.goalIds}))
assert.deepEqual(normalizeScopes(source.receipt),normalizeScopes(before))
for (const expected of before.outputBindings) {
  assert.equal(digest(source.outputs[expected.path]),expected.sha256,expected.path)
}
assert.deepEqual(source.receipt.counts, {canonicalCurricularAtomicGoals:381,publishedCurricularAtomicGoals:362,sourceViews:48,unresolvedSourceScopeDecisions:496,omittedGoals:19})
const newGoalIds:string[]=entry.newGoalIds
const bwNewRoles=source.receipt.scopes.filter((s:any)=>s.jurisdiction==='DE-BW').map((s:any)=>({key:s.key,newGoalIds:s.goalIds.filter((id:string)=>newGoalIds.includes(id))}))
assert.deepEqual(bwNewRoles.find((s:any)=>s.key==='DE-BW/SekII/GK')?.newGoalIds,[newGoalIds[0]])
assert.deepEqual([...bwNewRoles.find((s:any)=>s.key==='DE-BW/SekII/LK')!.newGoalIds].sort(),[...newGoalIds].sort())
assert.deepEqual(bwNewRoles.filter((s:any)=>s.key.startsWith('DE-BW/SekI/')).flatMap((s:any)=>s.newGoalIds),[])

const configPath='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json'
const configBytes=readFileSync(resolve(repo,configPath))
const config=JSON.parse(configBytes.toString('utf8'))
const manifest=parse(resolve(scratch,config.compositionViewManifestPath))
const qaPath=`${authorRel}/inputs/future-381-visual-qa.operative-path.exact.json`
const qa=parse(resolve(repo,qaPath))
const imageDigests:Record<string,string>={}
const actualImages=[]
for (const row of qa.records) {
  if (row.visualizationState!=='available') continue
  const imageBytes=readFileSync(resolve(repo,row.publicAssetPath))
  const current=digest(imageBytes)
  assert.equal(current,row.assetSha256,row.goalId)
  imageDigests[row.imageUrl]=current
  if(newGoalIds.includes(row.goalId)) {
    assert.equal(digest(readFileSync(resolve(repo,row.canonicalAssetPath))),current)
    assert.equal(row.aiApproved,'yes')
    assert.equal(row.aiApprovedAssetSha256,current)
    assert.equal(row.humanApproved,'no')
    actualImages.push({goalId:row.goalId,canonicalAssetPath:row.canonicalAssetPath,publicAssetPath:row.publicAssetPath,sha256:current,machineApproval:'existing sealed actual Native A/B pixel reviews technically adopted',humanApproval:false,newVisualInspection:false})
  }
}
const model=buildGoalBookModel({landscape:parse(resolve(repo,entry.frozenFuture484Canonical.path)),
  compositionViewManifest:manifest,
  compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:parse(resolve(scratch,path))})),
  navigationView:parse(resolve(scratch,manifest.navigationViewPath)),
  durationModelPolicy:parse(resolve(scratch,manifest.durationModelPolicyPath)),
  semanticKindLedger:parse(resolve(repo,entry.future381SemanticLedger.path)),
  goalVisualizationQa:qa,goalVisualizationAssetDigests:imageDigests,evidenceReviewSources:[],config})
parseAndValidateGoalBookModel(model)
const baselinePath='app/public/lernzielbuch/de-gym-chemie-bundesweit.book-model.json'
const baselineBytes=readFileSync(resolve(repo,baselinePath))
const published=JSON.parse(baselineBytes.toString('utf8'))
const oldPages=new Map(published.pages.map((p:any)=>[p.goalId,p]))
const protectedIds:string[]=parse(resolve(repo,entry.protectedAllFiveGoalIdSets.path)).subjects.find((s:any)=>s.subject==='chemie').strictCompleteGoalIds
assert.equal(protectedIds.length,177)
const absent=protectedIds.filter(id=>!oldPages.has(id))
assert.deepEqual([...absent].sort(),[...entry.protectedPublicationBoundary.previouslyOmittedStrictGoals].sort())
assert.deepEqual(protectedIds.filter(id=>!model.pages.some(p=>p.goalId===id)),absent)
const protectedPages=[]
for (const id of protectedIds.filter(id=>oldPages.has(id))) {
  const current=model.pages.find(p=>p.goalId===id)
  assert.ok(current)
  assert.deepEqual(current,oldPages.get(id),id)
  protectedPages.push({goalId:id,pageFingerprint:current.pageFingerprint})
}
assert.equal(protectedPages.length,172)
const changed=model.pages.filter(p=>oldPages.has(p.goalId)&&stableGoalBookJson(p)!==stableGoalBookJson(oldPages.get(p.goalId)))
assert.equal(changed.length,5)
assert.ok(changed.every(p=>!protectedIds.includes(p.goalId)))
const oldContextChanges=changed.map(p=>({goalId:p.goalId,fields:Object.keys(p).filter(k=>stableGoalBookJson((p as any)[k])!==stableGoalBookJson((oldPages.get(p.goalId) as any)[k]))}))
const oldTheoryPairs:Record<string,string>={
  '5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c':newGoalIds[0],
  '81373fb7-2a4a-5b2c-acd0-b4e775acaa65':newGoalIds[1],
  '8be14f15-2258-58e6-ae4e-38953f5d0570':newGoalIds[2],
}
const oldGenericIds=new Set(['91238ba1-5c63-50c7-a4fd-9bbe492c6b61','49b13b33-34b7-5e4e-861c-b21082cb9922'])
for(const change of oldContextChanges) {
  const expected=oldGenericIds.has(change.goalId)?['applicability','pageFingerprint']:['reverseRequires','pageFingerprint']
  assert.deepEqual([...change.fields].sort(),expected.sort())
  if(!oldGenericIds.has(change.goalId)) {
    assert.ok(oldTheoryPairs[change.goalId])
    const old:any=oldPages.get(change.goalId)
    const current=model.pages.find(p=>p.goalId===change.goalId)!
    assert.equal(current.reverseRequires.length,old.reverseRequires.length+1)
    for(const prior of old.reverseRequires) assert.deepEqual(current.reverseRequires.find(r=>r.goalId===prior.goalId),prior)
    assert.equal(current.reverseRequires.filter(r=>r.goalId===oldTheoryPairs[change.goalId]).length,1)
  }
}
assert.equal(model.pages.length,362)
writeFileSync(resolve(own,'independent-normal-source-projection.full.actual.json'),`${JSON.stringify(source.receipt,null,2)}\n`)
writeFileSync(resolve(own,'independent-normal-national-model.full.actual.json'),`${JSON.stringify(model,null,2)}\n`)
const proof={schemaVersion:1,normalApis:['buildGoalBookSourceAtlasInputs','checkGoalBookSourceAtlasInputs','buildGoalBookModel','parseAndValidateGoalBookModel'],
 actualExitCode:0,execution:'independent fresh detached capsule; actual normal APIs; no active writes',actualInputs,
 normalSourceProjectionCounts:source.receipt.counts,bwNewRoles,originalPrepared50ViewNavigationManifestBytesExact:true,
 whole496UnresolvedSourceScopesExact:true,whole19OmissionsExact:true,normalFreshnessPass:true,
 normalModelDigest:model.digest,configBinding:{path:configPath,sha256:digest(configBytes),bytes:configBytes.length},
 publishedBaseline:{path:baselinePath,sha256:digest(baselineBytes),bytes:baselineBytes.length,modelDigest:published.digest},
 protected172FullNationalPagesAndFingerprintsExact:protectedPages,protectedFivePreviousNationalOmissionsExact:absent,
 changedFiveUnprotectedPriorContexts:oldContextChanges,changedPriorContextApprovalClaim:false,
 currentThreeImageBindings:actualImages,
 newNationalPages:model.pages.filter(p=>newGoalIds.includes(p.goalId)).map(p=>({goalId:p.goalId,pageFingerprint:p.pageFingerprint})),
 newNationalPageOrRouteReviewClaim:false,additionalScienceReviewClaim:false,newVisualInspectionClaim:false,
 humanApprovalClaim:false,humanTrialClaim:false,actualLearnerExperimentClaim:false,activeWrites:0,strictGain:0}
writeFileSync(resolve(own,'independent-normal-source-pages-protection.actual.json'),`${JSON.stringify(proof,null,2)}\n`)
console.log(JSON.stringify({actualExitCode:0,normalApis:proof.normalApis,counts:source.receipt.counts,bwNewRoles,
 protectedFullPages:protectedPages.length,protectedPreviousOmissions:absent,changedPriorContexts:oldContextChanges,
 currentPngPairs:actualImages.length,activeWrites:0,strictGain:0},null,2))
