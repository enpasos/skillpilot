// SPDX-License-Identifier: Apache-2.0
// Reproduce from the repository root. No graph, learner state or QA binding is written.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {loadCurrentCurriculumCatalog} from '../../../../../../../app/scripts/currentCurriculumCatalog.ts'
import {liveVerificationInputs} from '../../../../../../../app/scripts/lib/verificationInputSnapshot.ts'
import {UnitGraph} from '../../../../../../../app/scripts/lib/learningUnitContracts.ts'
import {collectCompositionProjectionRoleGoalIds,compileCompositionView,normalizeCompositionView} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'

const base='curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/post-independent-review-v2'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const catalog=loadCurrentCurriculumCatalog(liveVerificationInputs,process.cwd()).entries.map(e=>e.landscape)
const graph=new UnitGraph(catalog)
const physics=catalog.find(l=>l.landscapeId==='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a')!
const math=catalog.find(l=>l.landscapeId==='68a8ac50-f5f5-4e24-8aa9-5e408ca01ced')!
const kinds=new Map(read('curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json').decisions.map((d:any)=>[d.goalId,d.semanticKind]))
const decorated={...physics,goals:physics.goals.map(g=>({...g,semanticKind:kinds.get(g.id)}))}
const np=normalizeCanonicalLandscape(decorated)
const nm=normalizeCanonicalLandscape(math)
const universe=normalizeCanonicalLandscape({...decorated,goals:[...math.goals,...decorated.goals]})
const goalById=new Map([...math.goals,...physics.goals].map(g=>[g.id,g]))
const roots=new Map([physics,math].map(l=>[l.landscapeId,l.goals.find(g=>g.tags?.includes('root'))!.id]))
const before=read(base+'/bw-unused-support-before.json')
const atoms=(ids:Set<string>)=>new Set([...ids].flatMap(id=>graph.atoms(graph.resolve(id,physics.landscapeId))))
const diff=(a:Set<string>,b:Set<string>)=>[...a].filter(x=>!b.has(x)).sort()
const ref=(key:string)=>({id:graph.goal(key).id,title:graph.goal(key).title})
const find=(nodes:any[],id:string):any=>nodes.find(n=>n.id===id)??nodes.map(n=>find(n.children??[],id)).find(Boolean)
const rows=[]
for(const [path,old] of Object.entries(before.beforeViews) as [string,any][]){
 const current=read(path)
 const scopes=[]
 for(const scope of ['whole-view','strict-SekI'] as const){
  const variants=[old.view,current].map(v=>{
   if(scope==='whole-view')return {view:normalizeCompositionView(v),support:[]}
   const root=find(v.rootNodes,'physics-root')
   const seki=find(v.rootNodes,'physics-bw-seki');assert(seki)
   return {view:normalizeCompositionView({...v,viewId:v.viewId+'-strict-seki-support-check',rootNodes:[seki]}),support:[...v.rootNodes,...root.children].filter(n=>n.kind!=='structure'&&n.kind!=='landscapeEntry'&&n.projectionRole==='prerequisiteOnly')}
  })
  const compiled=variants.map(v=>{
   const result=compileCompositionView(v.view,np,universe,new Map([[physics.landscapeId,np],[math.landscapeId,nm]]))
   assert.deepEqual(result.findings.filter(f=>f.severity==='error'),[],path+' '+scope)
   const roles=collectCompositionProjectionRoleGoalIds(v.view.rootNodes,goalById,roots)
   const extra=collectCompositionProjectionRoleGoalIds(v.support,goalById,roots)
   return {targets:atoms(roles.targetGoalIds),available:atoms(new Set([...roles.targetGoalIds,...roles.prerequisiteOnlyGoalIds,...extra.targetGoalIds,...extra.prerequisiteOnlyGoalIds]))}
  })
  assert.deepEqual(diff(compiled[0].targets,compiled[1].targets),[])
  assert.deepEqual(diff(compiled[1].targets,compiled[0].targets),[])
  const retainedFunctionalAndExperimentalIds=['dc55adac-91a5-5cc3-ab47-be008480616f','8670cff6-fe9c-5f7e-8cba-d170134965a6','3857891b-d328-585b-9936-85c7aff122ee','4ac5a07c-fff0-5eae-890d-89e13eaf69c3']
  for(const id of retainedFunctionalAndExperimentalIds)assert(compiled[1].targets.has(graph.resolve(id,physics.landscapeId)))
  const lost=diff(compiled[0].available,compiled[1].available)
  const missingNeeded=[]
  for(const target of compiled[1].targets){
   for(const required of graph.reach(target))if(lost.includes(required))missingNeeded.push({target:ref(target),required:ref(required)})
  }
  assert.deepEqual(missingNeeded,[],path+' '+scope+' retained target needs removed support')
  // Same explicit foreign handoff boundary as the strict Physics view regression:
  // require the foreign atom's projection, while its internal route belongs to that subject.
  const closureMissing=[]
  const walk=(key:string,seen=new Set<string>())=>{
   if(seen.has(key))return;seen.add(key)
   if(graph.landscapeId(key)!==physics.landscapeId)return
   for(const required of graph.directAtomicRequires(key)){
    if(!compiled[1].available.has(required))closureMissing.push({target:ref(key),required:ref(required)})
    walk(required,seen)
   }
  }
  if(scope==='strict-SekI'){
   for(const target of compiled[1].targets)walk(target)
   assert.deepEqual(closureMissing,[],path+' strict lower all-of closure')
  }
  scopes.push({scope,nativeCompilerErrors:[],targetAtomsBefore:compiled[0].targets.size,targetAtomsAfter:compiled[1].targets.size,addedTargets:[],removedTargets:[],retainedFunctionalAndExperimentalIds,lostSupportAtoms:lost.map(ref),retainedTargetsNeedingLostSupport:missingNeeded,strictAllOfClosure:scope==='strict-SekI'?{status:'pass',missingPrerequisites:closureMissing,foreignBoundary:'Foreign prerequisite atom must be projected; its internal acquisition route is owned by its canonical subject.'}:null})
 }
 rows.push({path,beforeSha256:old.sha256,afterSha256:sha(path),scopes})
}
writeFileSync(base+'/bw-unused-support-proof.json',JSON.stringify({schemaVersion:1,catalogRootCount:catalog.length,canonicalRawSha256:sha('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'),scope:'Actual native whole-view and isolated SekI compilation, unchanged atomic targets, lost-support/retained-target reachability intersection, isolated Physics all-of closure with explicit foreign handoff.',rows,exitCode:0,humanApproval:false,learnerStateChanged:false},null,2)+'\n')
console.log('BW unused support repair passed: two whole views and two strict SekI compilations; unchanged target sets, no retained target needs lost support, strict all-of closure complete.')
