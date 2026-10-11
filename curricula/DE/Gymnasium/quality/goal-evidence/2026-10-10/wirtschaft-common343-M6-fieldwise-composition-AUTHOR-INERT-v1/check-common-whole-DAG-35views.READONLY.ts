import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {normalizeCanonicalLandscape,buildCanonicalGraphIndex,validateCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
const out=dirname(fileURLToPath(import.meta.url))
const read=(p:string)=>JSON.parse(readFileSync(resolve(out,p),'utf8'))
const write=(p:string,x:unknown)=>writeFileSync(resolve(out,p),JSON.stringify(x,null,2)+'\n')
const raw=read('candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
const c=normalizeCanonicalLandscape(raw),index=buildCanonicalGraphIndex(c)
const canonicalFindings=validateCanonicalLandscape(c,index)
const by=new Map(raw.goals.map((g:any)=>[g.id,g])),active=new Set<string>(),done=new Set<string>(),cycles:string[][]=[],missing:string[]=[]
function visit(id:string,chain:string[]){if(active.has(id)){cycles.push([...chain,id]);return}if(done.has(id))return;const goal=by.get(id) as any;if(!goal){missing.push(id);return}active.add(id);for(const req of goal.requires??[])if(!req.includes(':'))visit(req,[...chain,id]);active.delete(id);done.add(id)}
for(const g of raw.goals)visit(g.id,[])
function ordinary(g:any):boolean {const tags=new Set<string>(g.tags??[]);return !(g.contains?.length)&&!tags.has('Practice')&&!tags.has('Assessment')&&!tags.has('Motivation')&&!tags.has('Orientation')&&g.nodeKind!=='memory'&&!tags.has('memorization')&&![...tags].some(t=>t.startsWith('srs-deck:'))&&!g.examData}
const ordinaryIDs=new Set<string>(raw.goals.filter(ordinary).map((g:any)=>g.id))
const oldViews=new Map(read('actual-current35-native-target-prerequisite-only-sets.READONLY.json').map((v:any)=>[v.name,v]))
function flatten(nodes:any[]):string[]{return nodes.flatMap(n=>[...(n.sourceGoalId?[n.sourceGoalId]:[]),...flatten(n.children??[])])}
const views=[]
for(const name of readdirSync(resolve(out,'candidate-views')).filter(n=>n.endsWith('.view.json')).sort()){
 const v=normalizeCompositionView(read('candidate-views/'+name)),compiled=compileCompositionView(v,c),roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,index.goalById),old=oldViews.get(name) as any
 const visible=flatten(compiled.compiledRootNodes)
 const lostOldTargets=old.targetGoalIds.filter((id:string)=>!roles.targetGoalIds.has(id))
 const addedTargets=[...roles.targetGoalIds].filter(id=>!old.targetGoalIds.includes(id))
 views.push({name,scope:v.scope,wholeTargetCount:roles.targetGoalIds.size,ordinaryTargetCount:[...roles.targetGoalIds].filter(id=>ordinaryIDs.has(id)).length,
  targetGoalIds:[...roles.targetGoalIds].sort(),prerequisiteOnlyGoalIds:[...roles.prerequisiteOnlyGoalIds].sort(),lostOldTargets,addedTargets,
  oldF08TargetPreserved:!old.targetGoalIds.includes('f08e0a97-bcdd-504d-a9d9-7b1d8e6d4f96')||roles.targetGoalIds.has('f08e0a97-bcdd-504d-a9d9-7b1d8e6d4f96'),
  old036eaTargetPreserved:!old.targetGoalIds.includes('036ea7f9-2a33-502f-8729-983fa8054694')||roles.targetGoalIds.has('036ea7f9-2a33-502f-8729-983fa8054694'),
  oldf6bcTargetPreserved:!old.targetGoalIds.includes('f6bc5493-e138-5717-a027-e0579c80d687')||roles.targetGoalIds.has('f6bc5493-e138-5717-a027-e0579c80d687'),
  old0b3dTargetPreserved:!old.targetGoalIds.includes('0b3dbe47-9b98-5540-92e5-a8edf1693b96')||roles.targetGoalIds.has('0b3dbe47-9b98-5540-92e5-a8edf1693b96'),
  findings:compiled.findings,duplicateVisibleGoalIds:visible.filter((id,i)=>visible.indexOf(id)!==i)})
}
write('actual-common689-DAG-and35-whole-view-native-check.READONLY.json',{canonicalFindings,requiresCycles:cycles,missingLocalRequires:missing,views})
const checks={wholeGoals:raw.goals.length,ordinary:ordinaryIDs.size,uniqueIDs:by.size===raw.goals.length,containsErrors:canonicalFindings.filter(x=>x.severity==='error').length,requiresCycles:cycles.length,missingRequires:missing.length,
 wholeViews:views.length,viewErrors:views.filter(v=>v.findings.some(f=>f.severity==='error')).length,duplicateVisibleGoals:views.reduce((n,v)=>n+v.duplicateVisibleGoalIds.length,0),
 allFourOldWholePracticeTargetUniversesRetained:views.every(v=>v.oldF08TargetPreserved&&v.old036eaTargetPreserved&&v.oldf6bcTargetPreserved&&v.old0b3dTargetPreserved),
 actualLostOldTargetRows:views.filter(v=>v.lostOldTargets.length).map(v=>({name:v.name,ids:v.lostOldTargets})),
 nativeFingerprintsOrReviewApprovalsMaterialized:false,sourceScopeScienceOrM6M7Approval:false}
write('actual-common689-DAG35-native-summary.READONLY.json',checks)
console.log(JSON.stringify(checks))
if(!checks.uniqueIDs||checks.containsErrors||checks.requiresCycles||checks.missingRequires||checks.viewErrors||checks.duplicateVisibleGoals||!checks.allFourOldWholePracticeTargetUniversesRetained)process.exitCode=1
