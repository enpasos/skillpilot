import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {normalizeCanonicalLandscape,buildCanonicalGraphIndex} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
const out=dirname(fileURLToPath(import.meta.url)),root=resolve(out,'../../../../../../..')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const base=resolve(out,'../wirtschaft-common343-M6-fieldwise-composition-AUTHOR-INERT-v1')
const canonicalRaw=read(resolve(base,'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'))
const canonical=normalizeCanonicalLandscape(canonicalRaw),idx=buildCanonicalGraphIndex(canonical)
const manifest=read(resolve(out,'actual-final32-reuse-and35-view-rest-guards.AUTHOR-INERT.json'))
const rows:any[]=[]
const oldRows=new Map(read(resolve(base,'actual-common689-DAG-and35-whole-view-native-check.READONLY.json')).views.map((v:any)=>[v.name,v]))
const practiceID='81dfe82c-508b-51ba-829e-3f9e4d4a27a1'
const goalByID=new Map<string,any>(canonicalRaw.goals.map((g:any)=>[g.id,g]))
const targets=['fab48742-756b-564d-87ef-cd6f3c75f348','912ab267-ee00-581b-a31c-dfc0b3587184']
function visible(ns:any[]):string[]{return ns.flatMap(n=>[...(n.sourceGoalId?[n.sourceGoalId]:[]),...visible(n.children??[])])}
for(const b of manifest.whole35ViewInputGuards){
  const name=b.path.split('/').at(-1)
  const p=name==='de-bb-gym-economics-lk.view.json'?resolve(out,'candidates/curricula/DE/Gymnasium/composition-views/wirtschaft/'+name):resolve(root,b.path)
  const v=normalizeCompositionView(read(p)),compiled=compileCompositionView(v,canonical),roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,idx.goalById)
  const old=oldRows.get(name) as any,vs=visible(compiled.compiledRootNodes)
  const lostOldTargets=old.targetGoalIds.filter((id:string)=>!roles.targetGoalIds.has(id))
  const addedTargets=[...roles.targetGoalIds].filter(id=>!old.targetGoalIds.includes(id))
  const duplicates=vs.filter((id,i)=>vs.indexOf(id)!==i)
  const closure:any[]=[]
  if(name==='de-bb-gym-economics-lk.view.json'){
    const seen=new Set<string>()
    function prereqs(id:string){if(seen.has(id))return;seen.add(id);const g=goalByID.get(id);for(const req of g.requires??[]){closure.push({dependent:id,requires:req,target:roles.targetGoalIds.has(req),prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(req)});prereqs(req)}}
    for(const id of [practiceID,'776457c2-8bb3-53b9-838b-a028319175fb'])prereqs(id)
  }
  rows.push({name,findings:compiled.findings,lostOldTargets,addedTargets,duplicateVisibleGoals:duplicates,
    wholePractice: name.startsWith('de-bb-')?{target:roles.targetGoalIds.has(practiceID),coveredGoalIds:(goalByID.get(practiceID).examData.coveredGoalIds??[]).map((id:string)=>({id,target:roles.targetGoalIds.has(id),prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(id)})),closure}:undefined,
    wholeTargets:roles.targetGoalIds.size,ordinaryTargets:[...roles.targetGoalIds].filter(id=>!(goalByID.get(id)?.contains?.length)&&!goalByID.get(id)?.examData&&!goalByID.get(id)?.tags?.some((t:string)=>['Practice','Assessment','Orientation','Motivation','memorization'].includes(t)||t.startsWith('srs-deck:'))).length})
}
const lk=rows.find(r=>r.name==='de-bb-gym-economics-lk.view.json'),gk=rows.find(r=>r.name==='de-bb-gym-economics-gk.view.json')
const summary={views:rows.length,viewErrors:rows.reduce((n,r)=>n+r.findings.filter((f:any)=>f.severity==='error').length,0),duplicates:rows.reduce((n,r)=>n+r.duplicateVisibleGoals.length,0),lostOldTargets:rows.reduce((n,r)=>n+r.lostOldTargets.length,0),exactAddedLKTargets:lk.addedTargets.length===2&&targets.every(id=>lk.addedTargets.includes(id)),wholeExistingLKPracticeTarget:lk.wholePractice.target,allExistingLKPracticeCoveredGoalsActualTargets:lk.wholePractice.coveredGoalIds.every((r:any)=>r.target),allPrerequisitesAvailable:lk.wholePractice.closure.every((r:any)=>r.target||r.prerequisiteOnly),GKRolesUnchanged:gk.addedTargets.length===0&&gk.lostOldTargets.length===0,other34RolesUnchanged:rows.filter(r=>r!==lk).every(r=>r.addedTargets.length===0&&r.lostOldTargets.length===0),coreOrPBodiesChanged:false,sourceOrScopeScientificSelfApproval:false}
writeFileSync(resolve(out,'actual-native35-views-and-full-BB-existing-practice-closure.READONLY.json'),JSON.stringify({summary,rows},null,2)+'\n')
console.log(JSON.stringify(summary))
if(summary.viewErrors||summary.duplicates||summary.lostOldTargets||!summary.exactAddedLKTargets||!summary.allExistingLKPracticeCoveredGoalsActualTargets||!summary.allPrerequisitesAvailable||!summary.other34RolesUnchanged)process.exitCode=1
