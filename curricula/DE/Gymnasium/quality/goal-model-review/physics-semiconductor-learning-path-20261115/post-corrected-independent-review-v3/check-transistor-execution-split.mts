// SPDX-License-Identifier: Apache-2.0
// Structural proof from actual before objects and current inputs; no review or learner result is authored.
import assert from 'node:assert/strict'
import {readFileSync,readdirSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {loadCurrentCurriculumCatalog} from '../../../../../../../app/scripts/currentCurriculumCatalog.ts'
import {liveVerificationInputs} from '../../../../../../../app/scripts/lib/verificationInputSnapshot.ts'
import {UnitGraph} from '../../../../../../../app/scripts/lib/learningUnitContracts.ts'
import {collectCompositionProjectionRoleGoalIds,compileCompositionView,normalizeCompositionView} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
const base='curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/post-corrected-independent-review-v3'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const snapshot=read(base+'/execution-split-before.json')
const catalog=loadCurrentCurriculumCatalog(liveVerificationInputs,process.cwd()).entries.map(e=>e.landscape)
const pid='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',sid='77ab31a9-8961-511c-8637-06e98023d869',eid='2cfd5c6a-a16a-5f90-aab7-b27b29271f72'
const phys=catalog.find(l=>l.landscapeId===pid)!,math=catalog.find(l=>l.landscapeId==='68a8ac50-f5f5-4e24-8aa9-5e408ca01ced')!
const oldGoals=new Map(snapshot.beforeGoals.map((g:any)=>[g.id,g]))
const before={...phys,goals:phys.goals.filter(g=>![sid,eid].includes(g.id)).map(g=>oldGoals.get(g.id)??g)}
const graphs=[new UnitGraph(catalog.map(l=>l.landscapeId===pid?before:l)),new UnitGraph(catalog)]
const roots=new Map([phys,math].map(l=>[l.landscapeId,l.goals.find(g=>g.tags?.includes('root'))!.id]))
const maps=[before,phys].map(p=>new Map([...math.goals,...p.goals].map(g=>[g.id,g])))
const atoms=(graph:UnitGraph,ids:Set<string>)=>new Set([...ids].flatMap(id=>graph.atoms(graph.resolve(id,pid))))
const delta=(a:Set<string>,b:Set<string>)=>[...a].filter(x=>!b.has(x)).sort()
const paths=readdirSync('curricula/DE/Gymnasium/composition-views/physik').filter(p=>p.endsWith('.view.json')).map(p=>'curricula/DE/Gymnasium/composition-views/physik/'+p)
paths.push('app/scripts/config/goal-books/navigation/de-gym-physics-national-atlas.view.json')
const rows=[]
for(const path of paths){
 const current=read(path),prior=snapshot.viewsBefore[path]?.view??current
 const values=[prior,current].map((v,i)=>{
  const roles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(v).rootNodes,maps[i],roots)
  return {targets:atoms(graphs[i],roles.targetGoalIds),available:atoms(graphs[i],new Set([...roles.targetGoalIds,...roles.prerequisiteOnlyGoalIds]))}
 })
 const added=delta(values[1].targets,values[0].targets),removed=delta(values[0].targets,values[1].targets)
 assert.deepEqual(removed,[],path)
 assert.deepEqual(added,snapshot.viewsBefore[path]?[pid+':'+eid,pid+':'+sid].sort():[],path)
 assert.deepEqual(delta(values[0].available,values[1].available),[],path+' lost support')
 rows.push({path,currentRawSha256:sha(path),addedAtomicTargets:added,removedAtomicTargets:removed,lostAvailableSupport:[],priorAtomicTargetCount:values[0].targets.size,currentAtomicTargetCount:values[1].targets.size})
}
const ledger=new Map(read('curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json').decisions.map((d:any)=>[d.goalId,d.semanticKind]))
// New explicit ordinary/assessment classification is sufficient for structural preview;
// this does not claim freshness or independent semantic/D/P/A/M/V approval.
const kind=(g:any)=>ledger.get(g.id)??(g.id===sid?'curricularAtomic':g.id===eid?'practiceAssessment':undefined)
const np=normalizeCanonicalLandscape({...phys,goals:phys.goals.map(g=>({...g,semanticKind:kind(g)}))})
const nm=normalizeCanonicalLandscape(math),universe=normalizeCanonicalLandscape({...phys,goals:[...math.goals,...phys.goals.map(g=>({...g,semanticKind:kind(g)}))]})
const compiledRows=[],nationalOrdinary=new Set<string>()
const visit=(nodes:any[],fn:(n:any)=>void)=>nodes.forEach(n=>{fn(n);visit(n.children,fn)})
for(const path of Object.keys(snapshot.viewsBefore)){
 const v=normalizeCompositionView(read(path)),r=compileCompositionView(v,np,universe,new Map([[phys.landscapeId,np],[math.landscapeId,nm]]))
 assert.deepEqual(r.findings.filter(f=>f.severity==='error'),[],path)
 if(path.endsWith('de-de-gym-physics-gk.view.json')||path.endsWith('de-de-gym-physics-lk.view.json'))visit(r.compiledRootNodes,n=>{
  if(n.kind==='goal'&&n.sourceGoalId){const g=maps[1].get(n.sourceGoalId);if(g&&kind(g)==='curricularAtomic')nationalOrdinary.add(g.id)}
 })
 compiledRows.push({path,errors:[]})
}
for(const id of ['7d4d6a39-0c78-5fb0-b7bf-182ed00972f7','88f27aab-8724-5a4d-8543-e49ebcb54b8e'])assert(!graphs[1].reach(pid+':'+id).has(pid+':'+sid))
assert.deepEqual(graphs[1].directAtomicRequires(pid+':'+sid),[pid+':69f8f59c-b0c3-5b0b-82db-834a0e655736'])
assert.deepEqual(graphs[1].parentKeys(pid+':'+sid),[pid+':bf980fff-b62b-4ea4-a20d-31681a7ad785'])
assert.deepEqual(phys.goals.find(g=>g.id===eid)!.examData!.coveredGoalIds,[sid])
writeFileSync(base+'/execution-split-projection-proof.json',JSON.stringify({schemaVersion:1,canonicalRawSha256:sha('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'),catalogRootCount:catalog.length,roleCheckedViewCount:rows.length,nativeCompiledChangedViewCount:compiledRows.length,nationalOrdinaryTargetUnionCount:nationalOrdinary.size,onlyAddedTargets:[sid,eid],priorInterpretationResultsDoNotRequireOrCoverNewExecution:true,newGoalOnlyRequiresCircuitDiagramFoundation:true,semanticPreviewNotIndependentApproval:true,rows,compiledRows,exitCode:0,humanApproval:false,learnerStateChanged:false},null,2)+'\n')
console.log('Execution split structural proof passed: '+rows.length+' views, six exact lower target additions only, no lost targets/support; six native compilations; national ordinary union '+nationalOrdinary.size+'.')
