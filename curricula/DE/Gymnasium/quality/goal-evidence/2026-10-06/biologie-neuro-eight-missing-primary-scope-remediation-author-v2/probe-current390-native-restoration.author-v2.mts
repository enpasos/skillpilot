// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { buildGoalBookModel, fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'

const own = dirname(fileURLToPath(import.meta.url)), root = resolve(own,'../../../../../../..')
const old = resolve(own,'../biologie-neuro-th-hh-forty-reviewed-components-native-overlay-preparation-v1')
const tracked = new Map<string, any>()
const digest = (v: string | Buffer) => 'sha256:'+createHash('sha256').update(v).digest('hex')
const rel = (p: string) => relative(root,p)
const serial = (v: any) => JSON.stringify(v,null,2)+'\n'
const bytes = (p: string) => { const abs=resolve(root,p), b=readFileSync(abs);tracked.set(rel(abs),{path:rel(abs),sha256:digest(b),bytes:b.length});return b }
const read = (p: string) => JSON.parse(bytes(p).toString())
const write = (name: string,v:any) => {const p=resolve(own,name);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,serial(v));return rel(p)}
const equal = (a:any,b:any) => JSON.stringify(a)===JSON.stringify(b)
for(const p of ['app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/goalBookModel.ts','app/src/utils/authoring/canonicalAuthoring.ts','app/src/utils/authoring/compositionViewAuthoring.ts']) bytes(p)
const config = read('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
const bookConfig = read('app/scripts/config/goal-books/de-gym-biology-national-atlas.json')
assert.equal(config.expectedCurricularAtomicGoalCount,390)
const current = read(config.landscapePath), kinds = read(config.semanticKindLedgerPath)
const qa = read(bookConfig.goalVisualizationQaPath)
assert.equal(current.goals.length,472)
const atoms=kinds.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId).sort()
assert.equal(atoms.length,390)
const oldCurrent=read(rel(resolve(old,'baseline-current390-source-atlas.actual.book-model.json')))
const oldOverlay=read(rel(resolve(old,'current472-neuro21-overlay.canonical.candidate.json')))
const oldDelta=read(rel(resolve(old,'current-kind-fingerprint-technical-deltas.json')))
const selected=new Set(oldDelta.map((r:any)=>r.goalId))
assert.equal(selected.size,21)
const eight = read(rel(resolve(own,'current472-eight-only.author-v2.canonical.candidate.json')))
const eightRows=read(rel(resolve(own,'eight-current-goals.actual-primary-scope-and-DEEN-candidates.author-v2.json'))).records
const eightIds=new Set(eightRows.map((r:any)=>r.goalId))
const currentGoals=new Map(current.goals.map((g:any)=>[g.id,g]))
const oldGoals=new Map(oldOverlay.goals.map((g:any)=>[g.id,g]))
const eightGoals=new Map(eight.goals.map((g:any)=>[g.id,g]))
const future=structuredClone(current)
future.goals=future.goals.map((g:any)=>eightIds.has(g.id)?structuredClone(eightGoals.get(g.id)):selected.has(g.id)?structuredClone(oldGoals.get(g.id)):g)
assert.equal(future.goals.length,472)
for(const g of future.goals){const before:any=currentGoals.get(g.id);assert.deepEqual(g.requires,before.requires);assert.deepEqual(g.contains,before.contains);if(!selected.has(g.id))assert.deepEqual(g,before)}
const futureGoals=new Map(future.goals.map((g:any)=>[g.id,g]))
const futureKinds=structuredClone(kinds), kindDeltas:any[]=[]
for(const d of futureKinds.decisions){const fp=fingerprintSemanticKindSourceGoal(futureGoals.get(d.goalId));if(fp!==d.sourceFingerprint){assert.ok(selected.has(d.goalId));kindDeltas.push({goalId:d.goalId,before:d.sourceFingerprint,after:fp,semanticKind:d.semanticKind,classificationPreserved:true,D_PApproval:false});d.sourceFingerprint=fp}}
write('native.current472.neuro21-plus-eight-text.canonical.candidate.json',future)
write('native.current390.semantic-kinds.fingerprint-only.candidate.json',futureKinds)
write('native.semantic-kind-fingerprint-only-deltas.actual.json',kindDeltas)
const gate=read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-fifteen-reviewed-active-integration-v1/current-central-five-gate.actual.report.json')
const expected:any={biologie:74,chemie:127,mathematik:807,physik:478}
const protectedSubjects=gate.subjects.map((s:any)=>{
 assert.equal(s.strictCompleteGoalIds.length,expected[s.subject]);assert.deepEqual(s.issues,[])
 const landscape=read(s.landscapePath), goals=new Map(landscape.goals.map((g:any)=>[g.id,g]))
 return {subject:s.subject,landscapePath:s.landscapePath,strictGoalIds:s.strictCompleteGoalIds,actualCurrentLandscapeBinding:tracked.get(s.landscapePath),wholeStrictGoals:s.strictCompleteGoalIds.map((id:string)=>({goalId:id,wholeGoal:goals.get(id)}))}
})
const protectedBio=protectedSubjects.find((s:any)=>s.subject==='biologie')
assert.ok(protectedBio.strictGoalIds.every((id:string)=>!selected.has(id)))
for(const r of protectedBio.wholeStrictGoals)assert.deepEqual(futureGoals.get(r.goalId),r.wholeGoal)
const rolloutPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const rollout=read(rolloutPath)
for(const subject of rollout.subjects)for(const [key,value]of Object.entries(subject)){
 if(key.endsWith('Path')&&typeof value==='string'&&existsSync(resolve(root,value)))bytes(value)
 if(key.endsWith('Paths')&&Array.isArray(value))for(const p of value)if(typeof p==='string'&&existsSync(resolve(root,p)))bytes(p)
}
const baseline=buildGoalBookSourceAtlasInputs(config,root)
assert.equal(baseline.receipt.counts.publishedCurricularAtomicGoals,390)
assert.deepEqual(baseline.receipt.scopes.flatMap((s:any)=>s.goalIds).filter((x:any,i:any,a:any)=>a.indexOf(x)===i).sort(),atoms)
for(const b of baseline.receipt.inputBindings)if(existsSync(resolve(root,b.path)))assert.equal(digest(bytes(b.path)),b.sha256)
write('baseline-current390.source-atlas.actual.receipt.json',baseline.receipt)
const shadow=resolve(own,'.native-shadow-inputs');if(existsSync(shadow))rmSync(shadow,{recursive:true});mkdirSync(shadow)
const seed=(p:string,b:Buffer|string)=>{const dest=resolve(shadow,p);assert.ok(dest.startsWith(shadow+'/'));mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,b)}
const snapshots=new Set(config.sourceDocumentSnapshots.map((s:any)=>s.path))
for(const b of baseline.receipt.inputBindings)if(!snapshots.has(b.path))seed(b.path,bytes(b.path))
seed(config.landscapePath,serial(future));seed(config.semanticKindLedgerPath,serial(futureKinds))
const overrides=read(rel(resolve(old,'effective-original-neuro21-source-overrides.json')))
for(const r of overrides){assert.equal(digest(bytes(r.originalPath)),r.currentOriginalSha256);assert.equal(digest(bytes(r.effectiveCandidatePath)),r.effectiveCandidateSha256);seed(r.originalPath,bytes(r.effectiveCandidatePath))}
const thhhPaths=['DE-TH.forty-component-reviewed.technical-mapping.candidate.json','DE-HH.forty-component-reviewed.technical-mapping.candidate.json'].map(f=>rel(resolve(old,f)))
for(const p of thhhPaths){const m=read(p);seed(p,bytes(p));seed(m.sourceExtractionPath,bytes(m.sourceExtractionPath))}
const routing=read(rel(resolve(own,'native-input-candidate-routing.author-v2.json')))
const policy=read(routing.NWDurationPolicyCandidatePath)
seed(config.durationModelPolicyPath,serial(policy))
for(const r of routing.entries){seed(r.plannedExtractionPath,bytes(r.candidateExtractionPath));seed(r.candidateMappingPath,bytes(r.candidateMappingPath));if(!snapshots.has(r.documentPath))seed(r.documentPath,bytes(r.documentPath))}
const nwEntries=routing.entries.filter((r:any)=>r.jurisdiction==='DE-NW')
const extraSnapshots=routing.entries.filter((r:any)=>r.jurisdiction==='DE-BY').map((r:any)=>({path:r.documentPath,url:r.documentURL,sha256:r.documentSha256}))
assert.equal(new Set(extraSnapshots.map((r:any)=>r.path)).size,2)
const nwConfig={...config,mappingPaths:[...config.mappingPaths,...thhhPaths,...nwEntries.map((r:any)=>r.candidateMappingPath)]}
let nwOnly:any
try{buildGoalBookSourceAtlasInputs(nwConfig,shadow);assert.fail('Eight original whole-HOLD goals must remain absent without conditional new routes')}
catch(error:any){assert.ok(error.message.includes('Source-supported atlas goal count changed'));assert.equal(error.expected,390);assert.equal(error.actual,382);write('NW-only-restoration.original390-contract.actual.failure.json',{expected:390,actual:382,message:error.message,eightWholeHOLDsRetained:true,sourceWholeApproval:false});nwOnly=buildGoalBookSourceAtlasInputs({...nwConfig,expectedCurricularAtomicGoalCount:382},shadow)}
write('NW-only-restoration.diagnostic382.source-atlas.actual.receipt.json',nwOnly.receipt)
// HTML is always read and hash-bound from actual bytes; PDF-only snapshots stay unchanged.
const futureConfig={...config,mappingPaths:[...config.mappingPaths,...thhhPaths,...routing.entries.map((r:any)=>r.candidateMappingPath)]}
const combined=buildGoalBookSourceAtlasInputs(futureConfig,shadow)
assert.equal(combined.receipt.counts.publishedCurricularAtomicGoals,390)
assert.equal(combined.receipt.counts.omittedGoals,0)
assert.deepEqual([...new Set(combined.receipt.scopes.flatMap((s:any)=>s.goalIds))].sort(),atoms)
write('conditional-current390-restoration.source-atlas.actual.receipt.json',combined.receipt)
write('conditional-current390-native-input-config.candidate.json',futureConfig)
const assets:any={}
for(const r of qa.records)if(r.visualizationState==='available'){assert.equal(r.publicAssetPath,'app/public'+r.imageUrl);assets[r.imageUrl]=digest(bytes(r.publicAssetPath))}
const models=new Map<string,any>()
function model(name:string,result:any,landscape:any,ledger:any,atlas=true){
 const get=(p:string)=>JSON.parse(result.outputs[p]),manifest=get(config.manifestPath)
 const input:any={landscape,semanticKindLedger:ledger,goalVisualizationQa:qa,goalVisualizationAssetDigests:assets,evidenceReviewSources:[],config:{...bookConfig,...(!atlas?{compositionViewManifestPath:undefined,compositionViewPath:'app/scripts/config/goal-books/technical-current390-author-v2-full.view.json'}:{})}}
 const m=buildGoalBookModel(atlas?{...input,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((p:string)=>({path:p,view:get(p)})),navigationView:get(config.navigationViewPath),durationModelPolicy:name.startsWith('baseline')?read(config.durationModelPolicyPath):policy}:{...input,compositionView:{viewFormatVersion:'1.0',viewId:'technical-current390-author-v2-full',landscapeId:landscape.landscapeId,language:'de-DE',title:'Inactive current390 full catalogue author-v2',scope:{schoolForm:'Gymnasium',stage:'CrossStage'},rootNodes:[{kind:'canonicalSubtree',goalId:landscape.goals.find((g:any)=>g.tags?.includes('root')).id}]}})
 assert.equal(m.pages.length,390);write(name+'.actual.book-model.json',m);models.set(name,m);return m
}
const bm=model('baseline-current390-source-atlas',baseline,current,kinds)
const fm=model('conditional-current390-source-atlas',combined,future,futureKinds)
const bf=model('baseline-current390-full-catalogue',baseline,current,kinds,false)
const ff=model('conditional-current390-full-catalogue',combined,future,futureKinds,false)
const pages=(m:any)=>new Map(m.pages.map((p:any)=>[p.goalId,p]))
const bp=pages(bm),fp=pages(fm),bfp=pages(bf),ffp=pages(ff)
const pageDeltas:any[]=[]
for(const[id,before]of bp){const after:any=fp.get(id);assert.ok(after);if(!equal(before,after))pageDeltas.push({goalId:id,protectedStrict74:protectedBio.strictGoalIds.includes(id),changedFields:Object.keys(before as any).filter(k=>!equal((before as any)[k],after[k])),before,after,wholeSourceOrDPApproval:false})}
const protectedChecks=protectedBio.strictGoalIds.map((id:string)=>({goalId:id,wholeCanonicalExact:equal(currentGoals.get(id),futureGoals.get(id)),fullCataloguePageExact:equal(bfp.get(id),ffp.get(id)),sourceAtlasPageExact:equal(bp.get(id),fp.get(id)),before:bp.get(id),after:fp.get(id)}))
assert.ok(protectedChecks.every((r:any)=>r.wholeCanonicalExact&&r.fullCataloguePageExact))
write('protected-current74.actual-full-page-and-source-context-checks.json',protectedChecks)
write('all-current390.actual-source-atlas-page-deltas.json',pageDeltas)
const byScope=(result:any)=>new Map<string,any>(result.receipt.scopes.map((s:any)=>[s.key,s]))
const bs=byScope(baseline),ns=byScope(nwOnly),fs=byScope(combined)
assert.deepEqual([...bs.keys()],[...fs.keys()]);assert.equal(fs.size,22)
const scopeDeltas:any[]=[];const residual:any[]=[]
for(const[key,before]of bs){const n=ns.get(key),after=fs.get(key);const lost=before.goalIds.filter((id:string)=>!after.goalIds.includes(id));for(const id of lost)residual.push({scopeKey:key,goalId:id,wholeSourceAndTargetRoutineHOLD:true});scopeDeltas.push({key,beforeOrderedGoalIds:before.goalIds,NWOnlyDiagnosticOrderedGoalIds:n.goalIds,conditionalRestorationOrderedGoalIds:after.goalIds,lostVsCurrent:lost,addedVsCurrent:after.goalIds.filter((id:string)=>!before.goalIds.includes(id)),newConditionalEightRoutes:after.witnesses.filter((w:any)=>eightIds.has(w.goalId)&&routing.entries.some((e:any)=>e.candidateMappingPath===w.mappingPath)),wholeSourceApproval:false})}
write('all22-actual-ordered-targets-and-residual-whole-HOLDs.json',{scopes:scopeDeltas,residualLostGoalScopePairs:residual,all390UnionExact:true,originalWholeHOLDsRetained:true})
const newWitnesses=combined.receipt.scopes.flatMap((s:any)=>s.witnesses.filter((w:any)=>routing.entries.some((r:any)=>r.candidateMappingPath===w.mappingPath)).map((w:any)=>({scopeKey:s.key,...w})))
assert.ok(newWitnesses.every((w:any)=>w.coverage==='direct'&&w.goalId===w.mappedTargetGoalId&&w.profileBasis==='source-metadata'))
const nwWitnesses=newWitnesses.filter((w:any)=>w.scopeKey==='DE-NW/SekI/')
assert.equal(nwWitnesses.length,2)
for(const id of ['5b2571d9-f079-52b2-b21b-8f389c7409f4','49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd']){
 assert.ok(ns.get('DE-NW/SekI/').goalIds.includes(id));assert.ok(nwWitnesses.some((w:any)=>w.goalId===id))
 const page:any=fp.get(id);assert.ok(page.applicability.some((a:any)=>a.jurisdiction==='DE-NW'&&a.scopes.some((c:any)=>c.stage==='SekI'&&c.durationModel==='G9'&&c.courseProfile===null)),JSON.stringify(page.applicability))
}
write('new-direct-component-witnesses-and-NW-G9.actual.json',{newWitnesses,nwWitnesses,falseClusterInheritanceUsed:false,NWWholeIF7AndViralHOLDRetained:true,sourceKindRoutes:routing.neuroRoutes,productionCompilerDoesNotValidateSourceKind:true,threeSpecialisationRoleAndDPReviewPending:true})
const oldBoundaries=read(rel(resolve(old,'adopted40-reviewed-component-boundaries-and-whole-holds.json')))
write('unchanged-TH19-HH21-and-HH22-HH29-bounded-decisions.preserved.json',oldBoundaries)
for(const[p,b]of tracked){const v=readFileSync(resolve(root,p));assert.equal(digest(v),b.sha256,'Concurrent live input drift: '+p)}
write('native-run.actual-current-inputs-and-protected-subjects.guard.json',{createdAtUTC:new Date().toISOString(),inputBindings:[...tracked.values()],protectedSubjects,allCurrentInputsExactAfterRun:true,canonical472Atomic390:true,all21IdsAndEdgesPreserved:true,all451OutsideNeuro21WholeGoalsExact:true,all74ProtectedFullCataloguePagesExact:true,sourceAtlasProtectedContextChanges:protectedChecks.filter((r:any)=>!r.sourceAtlasPageExact).map((r:any)=>r.goalId),centralRun:false,globalBuild:false,activeWrites:false})
const result={createdAtUTC:new Date().toISOString(),status:'INERT_CONDITIONAL_390_NATIVE_REACHABILITY_PREPARED_NOT_WHOLE_SOURCE_CLEARANCE',baselineCounts:baseline.receipt.counts,NWOnlyCounts:nwOnly.receipt.counts,conditionalCounts:combined.receipt.counts,full472NodesPreserved:true,current390GoalSetExact:true,all22OrderedScopesMeasured:true,newDirectWitnesses:newWitnesses.length,newNWDirectG9Witnesses:nwWitnesses.length,newNeuroConditionalDirectWitnesses:newWitnesses.length-2,declaredModelSpecialisations:3,compilerValidatesDocumentAndScopeButNotSourceKind:true,actualModels:[...models].map(([name,m])=>({name,pages:m.pages.length})),all74ProtectedWholeCanonicalAndFullCataloguePagesExact:true,protectedSourceAtlasChangedContexts:protectedChecks.filter((r:any)=>!r.sourceAtlasPageExact).map((r:any)=>r.goalId),changedSourceAtlasPages:pageDeltas.length,residualLostCountryGoalPairs:residual.length,oldTH19HH21AndHH22HH29HOLDsRetained:true,eightOriginalWholeSourceHOLDsRetained:true,NWWholeIF7ViralHOLDRetained:true,newTextCorrectionsRequireTargetedReview:true,nativeD_PReview:'candidate pending',activeBindingsRestored:0,newStrictCompletions:0,strictNetGain:0,activeWrites:false,integrationApproved:false,wholeSourceGatePassed:false,humanApproval:false,humanTrial:false,globalPDFBuilds:0,centralRuns:0}
write('native-current390-restoration.actual-result.author-v2.json',result)
rmSync(shadow,{recursive:true})
console.log(JSON.stringify(result))
