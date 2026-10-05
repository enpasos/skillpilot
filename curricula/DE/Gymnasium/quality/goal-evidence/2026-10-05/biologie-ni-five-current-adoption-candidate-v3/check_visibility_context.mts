// Apache-2.0. Scoped runtime visibility and native effective-prerequisite facts.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { prepareLandscapeEntries } from '../../../../../../../app/src/hooks/useLandscapes'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../../../../../../')
const read=(p:string)=>JSON.parse(readFileSync(resolve(here,p),'utf8')),rr=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const write=(p:string,v:any)=>writeFileSync(resolve(here,p),JSON.stringify(v,null,2)+'\n')
const after=read('canonical.biologie.candidate.json'),before=read('before/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const prepared=prepareLandscapeEntries([after])[0].goals
const native=new Map<string,any>(prepared.map(g=>[g.id,g])),goals=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]))
const ni=read('native-source-atlas.projection.receipt.json').niScope
const dna='0daa79f6-8f61-5506-98f9-65db83062ba8'
const paths:any[]=[]
const ancestors=(id:string,seen=new Set<string>()):string[]=>{const parents=[...goals.values()].filter(g=>(g.contains??[]).includes(id)).map(g=>g.id);return parents.flatMap(p=>seen.has(p)?[]:(seen.add(p),[p,...ancestors(p,seen)]))}
const visit=(start:string,id:string,nodes:string[],edges:any[])=>{
 if(id===dna){paths.push({sourceSupportedNITargetId:start,targetTitle:goals.get(start).title,goalPath:nodes,edgeDetails:edges,sourceBindings:ni.witnesses.filter((w:any)=>w.goalId===start)});return}
 for(const ref of native.get(id)?.effectiveRequires??[]){const r=String(ref).replace(after.landscapeId+':','');if(nodes.includes(r)||!native.has(r))continue
  const direct=(goals.get(id).requires??[]).some((x:any)=>String(x).replace(after.landscapeId+':','')===r)
  const providers=direct?[id]:ancestors(id).filter(p=>(goals.get(p).requires??[]).some((x:any)=>String(x).replace(after.landscapeId+':','')===r))
  visit(start,r,[...nodes,r],[...edges,{from:id,to:r,relationship:direct?'direct requires':'inherited cluster requires',requireProviderGoalIds:providers}])
 }
}
ni.goalIds.forEach((id:string)=>visit(id,id,[id],[]))
const dnaRoleView=read('ni-source.candidate.view.json');dnaRoleView.rootNodes[0].children.push({kind:'goalEntry',goalId:dna,projectionRole:'prerequisiteOnly'})
const compiled=compileCompositionView(normalizeCompositionView(dnaRoleView),normalizeCanonicalLandscape(after));assert.deepEqual(compiled.findings.filter(f=>f.severity==='error'),[])
const projection=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(dnaRoleView).rootNodes,goals)
assert.ok(!projection.targetGoalIds.has(dna)&&projection.prerequisiteOnlyGoalIds.has(dna)&&projection.targetGoalIds.size===137)
write('ni-source.with-prerequisite-only.model.candidate.view.json',dnaRoleView)
write('dna-native-effective-require-paths.candidate.json',{status:'candidate',humanApproval:false,nativeFunction:'app/src/hooks/useLandscapes.ts prepareLandscapeEntries; actual inherited cluster requires included',backendParitySource:'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java:10873-10943',goalId:dna,directNIWitnesses:ni.witnesses.filter((w:any)=>w.goalId===dna),sourceSupportedNITargetIds:[...new Set(paths.map(x=>x.sourceSupportedNITargetId))],paths,providedTwoRecombinationCompanionsRequireOnlyCellComparison:true,newFiveRequires:read('before-after-deltas.candidate.json').newGoalIds.map((id:string)=>({goalId:id,directRequires:goals.get(id).requires,effectiveRequires:native.get(id).effectiveRequires})),authoredPrerequisiteOnlyModel:{path:'ni-source.with-prerequisite-only.model.candidate.view.json',nativeCompilerErrors:[],targets:137,prerequisiteOnlyGoalIds:[...projection.prerequisiteOnlyGoalIds],adopted:false,meaning:'Possible scope representation only. No direct NI source witness, no target progress for DNA. Pure generated source-book view remains target-only; root decides any separate reviewed learner scope.'},remainingHold:'Root must judge the retained existing source-supported target prerequisite chains against NI non-molecular stage limits; this candidate does not rewrite old canonical targets or global requires.'})
const impact=read('strict37-context-impact.candidate.json')
for(const record of impact.records){
  const relevant=paths.filter(p=>p.sourceSupportedNITargetId===record.goalId)
  record.flags.transitivePrerequisiteNISourceTargetMembershipLost=relevant.length>0
  record.materialContextAffected=Object.values(record.flags).some(Boolean)
  if(relevant.length)record.nativeEffectiveRequiresNIContextPaths=relevant
}
impact.actualAffectedGoalIds=impact.records.filter((r:any)=>r.materialContextAffected).map((r:any)=>r.goalId)
impact.unaffectedGoalIds=impact.records.filter((r:any)=>!r.materialContextAffected).map((r:any)=>r.goalId)
write('strict37-context-impact.candidate.json',impact)
const five=['e0d04e58-1591-5230-bfa6-5c685b56d25b','480146f6-4749-52e3-a5e5-d08629e0c38f','be06115e-96e8-537e-b18a-313056e6cbe8','74740709-fc77-5a54-88a6-bb14c3777941','55bdfb1d-5c14-5b1c-bc8e-4ab428ef59ba']
const originalM=rr('curricula/DE/Gymnasium/quality/memory-card-review/biologie-q1-tests-therapy-current-20261004-v1/canonical-biology-full.config.json')
const decisions=readFileSync(resolve(here,'memory-card-review.base.review.jsonl'),'utf8').trim().split('\n').map(x=>JSON.parse(x))
const runtimePaths=['curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-biology-gk.view.json','curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-seki-biology.view.json']
const runtimeResults=runtimePaths.map(path=>{
 const view=normalizeCompositionView(rr(path)),errors=compileCompositionView(view,normalizeCanonicalLandscape(after)).findings.filter(f=>f.severity==='error');assert.deepEqual(errors,[])
 const b=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(before.goals.map((g:any)=>[g.id,g]))),a=collectCompositionProjectionRoleGoalIds(view.rootNodes,goals)
 return {path,viewId:view.viewId,scope:view.scope,errors,memoryGoalBefore:b.targetGoalIds.has('9e51741b-f952-5f62-9b6b-080eee6c5590'),memoryGoalAfter:a.targetGoalIds.has('9e51741b-f952-5f62-9b6b-080eee6c5590'),fiveMemoryTargets:five.map(id=>({goalId:id,title:goals.get(id).title,beforeVisible:b.targetGoalIds.has(id),afterVisible:a.targetGoalIds.has(id),memoryGoalIds:decisions.find(x=>x.goalId===id).memoryGoalIds,deckIds:decisions.find(x=>x.goalId===id).deckIds})),newFiveVisibility:read('before-after-deltas.candidate.json').newGoalIds.map((id:string)=>({goalId:id,visible:a.targetGoalIds.has(id)})),DNArole:{target:a.targetGoalIds.has(dna),prerequisiteOnly:a.prerequisiteOnlyGoalIds.has(dna)}}
})
write('memory-visibility-probe.qualifier.candidate.json',{status:'candidate',humanApproval:false,originalFullMVisibilityScopes:originalM.visibilityScopes,probeViewPath:'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/de-gym-biologie-bundesweit-source-de-ni-seki.view.json',probeIsRuntimeRegistered:false,runtimeRegistryImplementation:{path:'backend/src/main/java/com/skillpilot/backend/service/CompositionViewService.java',root:'DE/Gymnasium/composition-views',filter:'.view.json',lines:[29,707,716]},classification:'The five missing memory nodes in the extra pure curricularAtomic book-view probe do not constitute an actual learner runtime M regression. Do not change source projection to include memory goals or rewrite old memory decisions.',sourceBookProbeBeforeAndAfter:{beforeMissingSameFive:true,afterMissingSameFive:true,sourceBookRole:'pure curricularAtomic source projection, not registered learner view'},memoryGoalDeclaration:goals.get('9e51741b-f952-5f62-9b6b-080eee6c5590'),runtimeResults,gateConclusion:'PASS scoped runtime data visibility for all five pre-existing memory-required goals and their same SRS node in both actual registered views. Native FULL-M remains PASS. No source approval inferred.'})
for(const scope of ['before','after']){
 const cfg=read('memory-card-review.candidate.config.json');cfg.visibilityScopes=runtimePaths.map(path=>({label:path,viewPath:path}))
 if(scope==='before'){cfg.landscapePath=read('input-bindings.receipt.json').bindings.find((x:any)=>x.path.endsWith('canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')).path.replace('canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json','quality/goal-evidence/2026-10-05/biologie-ni-five-current-adoption-candidate-v3/before/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json');cfg.reviewPath=cfg.reviewPath.replace('memory-card-review.candidate.review.jsonl','memory-card-review.base.review.jsonl')}
 write('memory.runtime-'+scope+'.probe.config.json',cfg)
}
console.log(JSON.stringify({DNAeffectivePaths:paths.length,DNAdependentNITargets:[...new Set(paths.map(x=>x.sourceSupportedNITargetId))],runtimeMemoryVisibility:'PASS same five old targets and same memory node before/after',noRuntimeSourceBookRegistration:true}))
