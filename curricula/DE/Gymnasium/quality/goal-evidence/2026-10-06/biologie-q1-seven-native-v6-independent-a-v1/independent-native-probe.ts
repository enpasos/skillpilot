import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, symlinkSync, existsSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { buildGoalBookModel } from '../../../../../../../app/scripts/goalBookModel'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { compileCompositionView, normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const repo = resolve('.')
const author = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-component-native-source-preparation-author-v6')
const own = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-native-v6-independent-a-v1')
if (existsSync(resolve(own, 'independent-a.final.freeze.json'))) throw new Error('Review is frozen')
const read = (p:string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (p:string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const write = (p:string, value:unknown) => { mkdirSync(dirname(p), {recursive:true}); writeFileSync(p, JSON.stringify(value,null,2)+'\n') }
const sparse = mkdtempSync(resolve(tmpdir(),'skillpilot-bio-seven-independent-a-'))
const config = read(resolve(repo,'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'))
const originalConfig = structuredClone(config)
const linked = new Set<string>()
const link = (p:string) => { if(linked.has(p))return; if(!existsSync(resolve(repo,p)))throw new Error('Input missing '+p); const dest=resolve(sparse,p);mkdirSync(dirname(dest),{recursive:true});symlinkSync(resolve(repo,p),dest);linked.add(p) }
link(config.durationModelPolicyPath)
for(const snap of config.sourceDocumentSnapshots??[])link(snap.path)
for(const p of config.mappingPaths){link(p);const mapping=read(resolve(repo,p));link(mapping.sourceExtractionPath);const source=read(resolve(repo,mapping.sourceExtractionPath));for(const doc of source.sourceDocuments?.length?source.sourceDocuments:[source.sourceDocument])if(doc?.path)link(doc.path)}
const envelope = read(resolve(author,'canonical-390.component-first.author-candidate.inert-envelope.json'))
const candidate = JSON.parse(envelope.candidateCanonicalUTF8)
const semantic = read(resolve(author,'semantic-kind-native-input.component-first.author-candidate.inert-envelope.json')).candidatePayload
write(resolve(sparse,config.landscapePath),candidate)
write(resolve(sparse,config.semanticKindLedgerPath),semantic)
config.expectedCurricularAtomicGoalCount=390
for(const region of ['BE','BB','SN','TH','MV','ST'])for(const suffix of ['source-components','source-component-mappings']){
 const artifact=read(resolve(author,`${region}.${suffix}.author-candidate.inert-envelope.json`))
 write(resolve(sparse,artifact.prospectivePath),artifact.candidatePayload)
 if(suffix==='source-component-mappings')config.mappingPaths.push(artifact.prospectivePath)
}
const original=buildGoalBookSourceAtlasInputs(originalConfig,repo)
const proposed=buildGoalBookSourceAtlasInputs(config,sparse)
const originalIds=new Set<string>(original.receipt.scopes.flatMap((s:any)=>s.goalIds))
const proposedIds=new Set<string>(proposed.receipt.scopes.flatMap((s:any)=>s.goalIds))
const newIds=Object.values(envelope.newCanonicalGoalIDs)as string[]
if(originalIds.size!==383||proposedIds.size!==390||proposed.receipt.omittedGoals.length||[...originalIds].some(id=>!proposedIds.has(id)))throw new Error('SourceAtlas universe or preservation failure')
const current=read(resolve(repo,originalConfig.landscapePath))
const currentKind=read(resolve(repo,originalConfig.semanticKindLedgerPath))
const goals=new Map(candidate.goals.map((g:any)=>[g.id,g]))as Map<string,any>
const dfs=(field:string)=>{const active=new Set<string>(),done=new Set<string>();let edges=0;function visit(id:string){if(active.has(id))throw new Error(field+' cycle '+id);if(done.has(id))return;const goal=goals.get(id);if(!goal)throw new Error(field+' missing '+id);active.add(id);for(const child of goal[field]??[]){edges++;visit(child.replace(candidate.landscapeId+':',''))}active.delete(id);done.add(id)}for(const id of goals.keys())visit(id);return{nodes:done.size,edges,acyclic:true,allReferencesResolved:true}}
const dag={requires:dfs('requires'),contains:dfs('contains')}
const bookConfig=read(resolve(repo,'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'))
const qa=read(resolve(repo,bookConfig.goalVisualizationQaPath))
const assetDigests:Record<string,string>={}
for(const record of qa.records)if(record.visualizationState==='available')assetDigests[record.imageUrl]='sha256:'+sha(resolve(repo,record.publicAssetPath))
const model=(landscape:any,ledger:any,atlas:any)=>{
 const manifest=JSON.parse(atlas.outputs[bookConfig.compositionViewManifestPath])
 return buildGoalBookModel({landscape,semanticKindLedger:ledger,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:JSON.parse(atlas.outputs[path])})),navigationView:JSON.parse(atlas.outputs[manifest.navigationViewPath]),durationModelPolicy:read(resolve(repo,config.durationModelPolicyPath)),goalVisualizationQa:qa,goalVisualizationAssetDigests:assetDigests,evidenceReviewSources:[],config:bookConfig})
}
const before=model(current,currentKind,original),after=model(candidate,semantic,proposed)
if(before.pages.length!==383||after.pages.length!==390)throw new Error('Native page universe wrong')
const afterPages=new Map(after.pages.map((p:any)=>[p.goalId,p]))as Map<string,any>
const oldGoals=new Map(current.goals.map((g:any)=>[g.id,g]))as Map<string,any>
const strictPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-active-integration-verification-v1/final-current-central.stage-1.actual.stdout.json'
const strict=read(resolve(repo,strictPath)).subjects.find((s:any)=>s.subject.toLowerCase()==='biologie')
if(strict.strictComplete!==67||strict.denominator!==383)throw new Error('Protected current universe changed')
const scopeKeys=(atlas:any,id:string)=>atlas.receipt.scopes.filter((s:any)=>s.goalIds.includes(id)).map((s:any)=>s.key)
const pageRows=before.pages.map((p:any)=>{
 const q=afterPages.get(p.goalId);if(!q)throw new Error('Old page lost '+p.goalId)
 return{goalId:p.goalId,wholeGoalExact:JSON.stringify(oldGoals.get(p.goalId))===JSON.stringify(goals.get(p.goalId)),pageFingerprintExact:p.pageFingerprint===q.pageFingerprint,goalFingerprintExact:p.goalFingerprint===q.goalFingerprint,sourceMembershipLosses:scopeKeys(original,p.goalId).filter((k:string)=>!scopeKeys(proposed,p.goalId).includes(k)),beforePageFingerprint:p.pageFingerprint,afterPageFingerprint:q.pageFingerprint}
})
if(pageRows.some((r:any)=>!r.wholeGoalExact||!r.pageFingerprintExact||r.sourceMembershipLosses.length))throw new Error('Existing383 page/goal/scope changed')
const oldWholeDeltas=current.goals.map((g:any)=>({id:g.id,fields:[...new Set([...Object.keys(g),...Object.keys(goals.get(g.id))])].filter(k=>JSON.stringify(g[k])!==JSON.stringify(goals.get(g.id)[k]))})).filter((r:any)=>r.fields.length)
if(oldWholeDeltas.length!==1||oldWholeDeltas[0].fields.join(',')!=='contains')throw new Error('Only old root.contains may change')
const proposals=read(resolve(author,'source-view-route-and-prerequisite-only.author-candidate.json'))
const canonical=normalizeCanonicalLandscape(candidate)
const routeChecks=proposals.views.map((r:any)=>{
 const view=normalizeCompositionView(r.view),compiled=compileCompositionView(view,canonical)
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(canonical.goals.map(g=>[g.id,g])))
 const sourceScope=proposed.receipt.scopes.find((s:any)=>s.key===r.scope)
 const roleIds=[...roles.targetGoalIds].sort(),sourceIds=[...sourceScope.goalIds].sort()
 if(compiled.findings.some(f=>f.severity==='error')||JSON.stringify(roleIds)!==JSON.stringify(sourceIds))throw new Error('Bad target/prerequisite source composition '+r.scope)
 return{scope:r.scope,targetCount:roles.targetGoalIds.size,prerequisiteOnlyGoalIds:[...roles.prerequisiteOnlyGoalIds],findings:compiled.findings,targetsExactlySourceScope:true,isRegisteredGUILevel2View:false,existingGUISupersetMergeRequired:true}
})
const files=['app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/goalBookModel.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/src/utils/authoring/canonicalAuthoring.ts','app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json','app/scripts/config/goal-books/de-gym-biology-national-atlas.json',bookConfig.goalVisualizationQaPath]
write(resolve(own,'independent-native-source-book-dag.actual.json'),{
 schemaVersion:1,role:'fresh independent A actual native component-first reproduction; no author assertions substituted for tests',
 sourceAtlas:{originalCurricularAtomic:originalIds.size,candidateCurricularAtomic:proposedIds.size,expected390NormalContract:'PASS',omittedGoals:proposed.receipt.omittedGoals,scopeCount:proposed.receipt.scopes.length,sourceCounts:proposed.receipt.counts,newGoalIds:newIds,allOriginal383Retained:true},
 nativeBookModel:{originalPages:before.pages.length,candidatePages:after.pages.length,currentDigest:before.digest,candidateDigest:after.digest,allOld383WholeGoalsAndPageFingerprintsExact:true,protected67WholeGoalsAndPagesExact:true,allOldScopeMembershipsRetained:true},
 pageRows,protected67Rows:pageRows.filter((r:any)=>strict.strictCompleteGoalIds.includes(r.goalId)),oldWholeDeltas,dag,sourceRouteChecks:routeChecks,
 actualCodeAndContractInputs:files.map(path=>({path,sha256:sha(resolve(repo,path))})),readOnlyOriginalInputSymlinks:[...linked].map(path=>({path,sha256:sha(resolve(repo,path))})),
 nativeSourceWitnesses:proposed.receipt.scopes.map((s:any)=>({key:s.key,newGoalIds:s.goalIds.filter((id:string)=>newIds.includes(id)),newWitnesses:s.witnesses.filter((w:any)=>newIds.includes(w.goalId))})).filter((s:any)=>s.newGoalIds.length),
 actualTemporaryIsolate:relative(repo,sparse),candidateBookPagesNotEvidenceApproval:true,existingGUIScopeRegistrationPending:true,newImagesNotExamined:true,noD_P_A_M_VNativeApprovalClaim:true,activeWrites:false,strictGain:0,restoredActiveBindings:0,humanApproval:false,humanTrial:false,publication:false
})
console.log(JSON.stringify({sourceAtlas:'PASS390',bookPages:[before.pages.length,after.pages.length],old383Exact:true,protected67Exact:true,oldWholeDeltas,dag,routeChecks:routeChecks.length,strictGain:0}))
