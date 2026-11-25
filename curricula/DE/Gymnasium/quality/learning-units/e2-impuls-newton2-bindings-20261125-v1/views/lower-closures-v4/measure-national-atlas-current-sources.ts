// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'

async function main() {
const [repositoryArg,outputArg]=process.argv.slice(2)
if (!repositoryArg || !outputArg) throw Error('Usage: measure-national-atlas-current-sources.ts <repository> <fresh-output>')
const root=path.resolve(repositoryArg),output=path.resolve(outputArg)
const {normalizeCanonicalLandscape,resolveCanonicalNodeType}=await import(pathToFileURL(path.join(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const {compileCompositionView,normalizeCompositionView}=await import(pathToFileURL(path.join(root,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const capturedInputs=new Map<string,Buffer>()
const captured=(p:string)=>{if(!capturedInputs.has(p))capturedInputs.set(p,fs.readFileSync(path.join(root,p)));return capturedInputs.get(p)!}
const read=(p:string)=>JSON.parse(captured(p).toString('utf8'))
const digest=(p:string)=>createHash('sha256').update(captured(p)).digest('hex')
const predecessorPath='curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views/lower-closures-v1/national-atlas-current-sources.actual.json'
const predecessor=read(predecessorPath),manifestPath='app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json',manifest=read(manifestPath)
assert.equal(digest(predecessorPath),'db56e1e8232bae9dd20cec4b2249408b506d9e2b0732e8b7a380cbcc129382dc','historical K2-only a492 atlas input changed')
assert.equal(digest(manifestPath),'f9473b9434d7d90aab4ab5a78feec76e48ece25d7a6946475837cd79e445ecff','this bounded successor preserves the active source manifest')
assert(!fs.existsSync(output),'Refusing to overwrite a retained measurement; choose a fresh external output path')
assert.deepEqual(manifest.sourcePaths,predecessor.sourceViews.map(r=>r.path))
const canonicalPaths=['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json']
const ledgerPath='curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',ledger=read(ledgerPath),kinds=new Map(ledger.decisions.map(d=>[d.goalId,d.semanticKind]))
const [physics,math,chemistry]=canonicalPaths.map(p=>normalizeCanonicalLandscape(read(p)))
const subject={...physics,goals:physics.goals.map(g=>({...g,semanticKind:kinds.get(g.id)}))}
const universe={landscapeId:'de-gymnasium-physics-goal-book-goal-universe',title:'Canonical Physics goal-book goal universe',goals:[...subject.goals,...math.goals,...chemistry.goals]}
const byId=new Map(universe.goals.map(g=>[g.id,g]))
assert.equal(byId.size,universe.goals.length)
const profiles=['curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-gk.view.json','curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-lk.view.json']
const inputs=[predecessorPath,manifestPath,ledgerPath,...canonicalPaths,...manifest.sourcePaths,...profiles]
const pins=[...new Set(inputs)].map(p=>({path:p,sha256:digest(p)}))
const targetIds=(p:string)=>{
 const view=normalizeCompositionView(read(p)),compiled=compileCompositionView(view,subject,universe)
 assert.deepEqual(compiled.findings.filter(f=>f.severity==='error'),[],p)
 const ids=new Set<string>()
 const visit=(nodes:any[])=>{for(const n of nodes){if(n.kind==='goal'&&n.sourceGoalId){const g=byId.get(n.sourceGoalId);assert(g,n.sourceGoalId);if(resolveCanonicalNodeType(g)==='atomic'&&kinds.get(g.id)==='curricularAtomic')ids.add(g.id)}visit(n.children)}}
 visit(compiled.compiledRootNodes)
 return {view,ids}
}
const union=new Set<string>(),sourceViews=[]
for(const p of manifest.sourcePaths){
 const {view,ids}=targetIds(p);for(const id of ids)union.add(id)
 const before=predecessor.sourceViews.find(r=>r.path===p);assert(before,p)
 sourceViews.push({path:p,viewId:view.viewId,scope:view.scope,previousSha256:before.sha256,sha256:digest(p),changed:before.sha256!==digest(p),curricularTargetCount:ids.size})
}
const expectedChanged=new Set(['de-hh-gk.view.json','de-hh-lk.view.json','de-th-gk.view.json','de-th-lk.view.json']);assert.deepEqual(sourceViews.filter(r=>r.changed).map(r=>path.basename(r.path)).sort(),[...expectedChanged].sort());
const profileIds=new Set<string>();for(const p of profiles)for(const id of targetIds(p).ids)profileIds.add(id)
assert.equal(union.size,492);assert.equal(profileIds.size,424)
assert.deepEqual([...union].sort(),predecessor.currentUnionGoalIds)
assert.deepEqual([...profileIds].sort(),predecessor.canonicalProfileTargets.goalIds)
for(const pin of pins)assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,pin.path))).digest('hex'),pin.sha256,'concurrent input change '+pin.path)
const report={schemaVersion:1,contract:'e2-k1-v4-national-atlas-current-source-successor-v1',measuredAt:new Date().toISOString(),method:'Native normalizeCanonicalLandscape+compileCompositionView and target curricularAtomic collection, matching testPhysicsGoalBookInputs. Historical predecessor preserved; current raw source hashes are bound here, not rewritten there.',predecessor:{path:predecessorPath,sha256:digest(predecessorPath)},sourceViewCount:sourceViews.length,ordinarySourceViewCount:sourceViews.filter(r=>!r.scope.durationModel).length,durationSourceViewCount:sourceViews.filter(r=>r.scope.durationModel).length,sourcePathsUnchanged:true,sourceViews,changedSourceViews:sourceViews.filter(r=>r.changed),currentActualUnionCount:union.size,currentUnionGoalIds:[...union].sort(),addedCurricularTargetGoalIds:[],removedCurricularTargetGoalIds:[],canonicalProfileTargets:{count:profileIds.size,unchangedFromPredecessor:true,goalIds:[...profileIds].sort()},currentManifest:{path:manifestPath,sha256:digest(manifestPath),sourcePathsChangeNeeded:false,curricularCountChangeNeeded:false},inputs:pins}
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({output,sources:sourceViews.length,ordinary:report.ordinarySourceViewCount,duration:report.durationSourceViewCount,changed:report.changedSourceViews.length,atlas:union.size,profile:profileIds.size}))

}
main().catch(error=>{console.error(error);process.exit(1)})
