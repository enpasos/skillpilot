import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildApplicabilityCompilation } from './applicabilityCompiler.ts'
import { evaluateRouteProfile, evaluateGraphIntegrity, evaluateTypeConsistency, routeProfiles, buildAtomicDirectRequiresEdges, collectRenderedAtomicGoalIdsFromCompositionView } from './actual-all-route-quality-original-body-export-probe.ts'

const parentBase = '/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1'
const base = parentBase+'/final-thirteen-released-current311-P311-native-preparation-v10'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (b: string | Buffer) => createHash('sha256').update(b).digest('hex')
const iso = read(parentBase+'/actual-own-combined-route-isolate.prepare.receipt.json').physicalIsolate
const before = read(parentBase+'/inputs/root300.CAN389.before.json')
const after = read(base+'/whole-current300-plus-Generic11-and-thirteen-root-material-released-terminals.inert.candidate.json')
const new5 = read(parentBase+'/whole-five-new-terminal-DRAFT-assessments.author.candidate.json')
const old4 = read(parentBase+'/two-orientation-requires-bounded-sequence-successor-v4/selective-current-Generic11-nine-route-overlay-with-root-releases.inert.candidate.json').newWholeGoals.slice(0,4)
const new4 = read(base+'/whole-four-final-material-image-bound-root-machine-released.inert.candidate.json')
const allTerminals = [...old4,...new5,...new4].map((g: any) => g.id)
const sourceIds = [...new Set([...old4,...new5,...new4].flatMap((g: any) => g.examData.coveredGoalIds))]
const targetFile = iso+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const profile = routeProfiles.find((p: any)=>p.profileId==='canonical-economics-crossstage')!
const results: any[] = []
for (const [label, landscape] of [['beforeRoot300',before],['allThirteenAuthorCandidate',after]] as const) {
 writeFileSync(targetFile,JSON.stringify(landscape,null,2)+'\n')
 for (const course of ['GK','LK']) {
  const path = iso+'/curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-'+course.toLowerCase()+'.view.json'
  const input = label==='beforeRoot300' ? 'inputs/national-'+course+'.before.json' : 'national-'+course+'.bounded-route-author.candidate.view.json'
  writeFileSync(path,readFileSync((label==='beforeRoot300'?parentBase:base)+'/'+input))
 }
 // Original native evaluator receives a fresh real applicability compilation.
 // Only the new supplementary practice-cluster ID is added to its Economics list.
 const compilation = buildApplicabilityCompilation()
 const route = evaluateRouteProfile(landscape,profile,compilation)
 const local: any[] = []
 for (const course of ['GK','LK']) {
  const file=iso+'/curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-'+course.toLowerCase()+'.view.json'
  const targets=collectRenderedAtomicGoalIdsFromCompositionView(landscape,file,[course],false)
  const withPrerequisites=collectRenderedAtomicGoalIdsFromCompositionView(landscape,file,[course],true)
  const edges=buildAtomicDirectRequiresEdges(landscape)
  const reverse=new Map<string,string[]>()
  for(const [id, requires] of edges){if(!targets.has(id))continue;for(const req of requires){if(targets.has(req))reverse.set(req,[...(reverse.get(req)??[]),id]);}}
  const find=(start:string,ends:Set<string>):string[]|null=>{const q:Array<[string,string[]]>=[[start,[start]]];const seen=new Set<string>();while(q.length){const [i,path]=q.shift()!;if(seen.has(i))continue;seen.add(i);if(ends.has(i))return path;for(const next of reverse.get(i)??[])q.push([next,[...path,next]]);}return null;}
  const ends=new Set<string>(profile.terminalAutonomyClusterIds.flatMap((id:string)=>landscape.goals.find((g:any)=>g.id===id)?.contains??[]).filter((id:string)=>targets.has(id)))
  const selected=landscape.goals.filter((g:any)=>targets.has(g.id)&&profile.goalSelector(g))
  const missing=selected.filter((g:any)=>!find(g.id,ends)).map((g:any)=>({goalId:g.id,title:g.title}))
  local.push({courseProfile:course,viewSha256:sha(readFileSync(file)),actualTargetAtomicIds:[...targets].sort(),actualPrerequisiteOnlyAtomicIds:[...withPrerequisites].filter(x=>!targets.has(x)).sort(),wholeSelectedTargetCount:selected.length,wholeVisibleOnlyMissingTerminal:missing,
    actualCoveredGoalPaths:sourceIds.map((id:string)=>({goalId:id,targetVisible:targets.has(id),includedAsPrerequisiteOnly:withPrerequisites.has(id)&&!targets.has(id),visibleOnlyTerminalPath:targets.has(id)?find(id,ends):null})),
    newTerminals:allTerminals.map((id:string)=>({goalId:id,targetVisible:targets.has(id),prerequisiteOnly:withPrerequisites.has(id)&&!targets.has(id)})),
    note:'Actual native target projection with explicit role handling and directed atomic paths entirely inside targets; no claim is based on disabled CQR104 projection-local checks.'})
 }
 const globalEdges=buildAtomicDirectRequiresEdges(landscape)
 const reverse=new Map<string,string[]>()
 for(const [id, reqs] of globalEdges)for(const req of reqs)reverse.set(req,[...(reverse.get(req)??[]),id])
 const globalFind=(start:string):string[]|null=>{const q:Array<[string,string[]]>=[[start,[start]]];const seen=new Set<string>();while(q.length){const [i,p]=q.shift()!;if(seen.has(i))continue;seen.add(i);if(allTerminals.includes(i))return p;for(const n of reverse.get(i)??[])q.push([n,[...p,n]]);}return null;}
 results.push({label,canonicalWholeSha256:sha(readFileSync(targetFile)),route,
  graph:evaluateGraphIntegrity(landscape,new Set(landscape.goals.map((g:any)=>g.id))),type:evaluateTypeConsistency(landscape),
  allNewTerminalActualDerivedApplicability:compilation.reports.find((r:any)=>r.landscapeId===landscape.landscapeId)?.goals.filter((g:any)=>allTerminals.includes(g.goalId)),
  assignedGlobalDirectAtomicPaths:sourceIds.map((id:string)=>({goalId:id,path:globalFind(id)})),local})
}
writeFileSync(base+'/actual-native-all-thirteen-before-after-global-local-graph-and-type.report.json',JSON.stringify({schemaVersion:1,kind:'actual-original-native-route-body-author-check',physicalIsolate:iso,
  additiveEconomicsClusterRegistrationOnly:true,liveWrites:[],strictNewClosures:0,qualityApproval:false,sourceOrCourseApproval:false,
  expectedOpenMediaDraftAssessment:new4.filter((g:any)=>g.examData.reviewStatus==='draft').map((g:any)=>g.id),allThirteenMaterialReleasesByIndependentRoot:true,mediaWholeMaterialApproval:true,actualMediaImageForeignKEEP:true,ENorientationIndependentRootReviewKEEP:true,results},null,2)+'\n')
console.log(JSON.stringify(results.map(x=>({label:x.label,route:x.route.rules.map((r:any)=>({id:r.id,status:r.status,metrics:r.metrics})),graph:x.graph.status,type:x.type.status,local:x.local.map((l:any)=>({course:l.courseProfile,count:l.wholeSelectedTargetCount,missing:l.wholeVisibleOnlyMissingTerminal,terminals:l.newTerminals}))})),null,2))
