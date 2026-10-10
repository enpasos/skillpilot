import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildApplicabilityCompilation } from './applicabilityCompiler.ts'
import { evaluateRouteProfile, evaluateGraphIntegrity, evaluateTypeConsistency, routeProfiles, buildEffectiveRequiresEdges, buildAtomicDirectRequiresEdges, collectRenderedAtomicGoalIdsFromCompositionView } from './actual-six-route-quality-original-body-export-probe.ts'
const base = "/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-six-terminal-route-bounded-author-20261009-v1/current300-rebase-successor-v2";
const iso = "/tmp/skillpilot-wirtschaft-six-route-author-_hgb3hb2";
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const sha = (b: string | Buffer) => createHash('sha256').update(b).digest('hex');
const before = read(base+'/inputs/01-DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');
const after = read(base+'/whole-current389-plus-four-DRAFT-terminals-and-only-two-Generic-v3.inert.candidate.json');
const targetFile=iso+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';
const profile=routeProfiles.find((p: any)=>p.profileId==='canonical-economics-crossstage')!;
const six=read(base+'/actual-six-whole-current-goals-and-all-direct-public-contexts.before.json').goals.map((g:any)=>g.id);
const terminals=read(base+'/whole-four-new-terminal-DRAFT-assessments.author.candidate.json').map((g:any)=>g.id);
const allGoalIds=new Set(after.goals.map((g:any)=>g.id));
const results:any[]=[];
for (const [label, landscape] of [['before',before],['candidate',after]] as const){
 writeFileSync(targetFile,JSON.stringify(landscape,null,2)+'\n');
 const compilation=buildApplicabilityCompilation();
 const route=evaluateRouteProfile(landscape,profile,compilation);
 const econ=compilation.reports.find((r:any)=>r.landscapeId===landscape.landscapeId)!;
 const newApplicability=econ.goals.filter((g:any)=>terminals.includes(g.goalId));
 const local:any[]=[];
 for(const course of ['gk','lk']){
  const file=iso+'/curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-'+course+'.view.json';
  const targetIds=collectRenderedAtomicGoalIdsFromCompositionView(landscape,file,[course.toUpperCase()],false);
  const edges=buildAtomicDirectRequiresEdges(landscape);
  const reverse=new Map<string,string[]>();
  for(const [id, requires] of edges){if(!targetIds.has(id))continue;for(const req of requires){if(!targetIds.has(req))continue;reverse.set(req,[...(reverse.get(req)??[]),id]);}}
  const find=(start:string, ends:Set<string>):string[]|null=>{const q:[[string,string[]]]|any=[[start,[start]]];const seen=new Set<string>();while(q.length){const [i,path]=q.shift();if(seen.has(i))continue;seen.add(i);if(ends.has(i))return path;for(const next of reverse.get(i)??[])q.push([next,[...path,next]]);}return null;};
  const visibleExistingTerminals=new Set(profile.terminalAutonomyClusterIds.flatMap((id:string)=>landscape.goals.find((g:any)=>g.id===id)?.contains??[]).filter((id:string)=>targetIds.has(id)));
  const sixPaths=six.map((id:string)=>({goalId:id,targetVisible:targetIds.has(id),terminalPath:find(id,visibleExistingTerminals)}));
  const wholeTargets=landscape.goals.filter((g:any)=>targetIds.has(g.id)&&profile.goalSelector(g));
  const wholeMissing=wholeTargets.filter((g:any)=>!find(g.id,visibleExistingTerminals)).map((g:any)=>({goalId:g.id,title:g.title}));
  local.push({courseProfile:course.toUpperCase(),viewPath:file,viewSha256:sha(readFileSync(file)),actualTargetAtomicIds:[...targetIds].sort(),visibleNewTerminalGoalIds:terminals.filter((id:string)=>targetIds.has(id)),sixActualVisibleOnlyPaths:sixPaths,wholeSelectedTargetCount:wholeTargets.length,wholeVisibleOnlyMissingTerminal:wholeMissing,note:'Explicit actual target-only native projection plus directed visible-atomic path check. No satisfaction inferred from the normal CQR104 disabled local-route flag.'});
 }
 results.push({label,canonicalWholeSha256:sha(readFileSync(targetFile)),route,graph:evaluateGraphIntegrity(landscape,allGoalIds),type:evaluateTypeConsistency(landscape),newActualDerivedApplicability:newApplicability,local});
}
const result={schemaVersion:1,kind:'actual-original-native-route-body-targeted-author-check',physicalIsolate:iso,liveIntegration:false,results,qualityApproval:false,sourceFullApproval:false,courseFullApproval:false,strictNewClosures:0};
writeFileSync(base+'/actual-native-before-after-global-and-local-six-route-report.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(results.map(x=>({label:x.label,route:x.route.rules.map((r:any)=>({id:r.id,status:r.status,metrics:r.metrics,details:r.id==='CQR-203'?r.details:undefined})),graph:x.graph.status,type:x.type.status,local:x.local.map((l:any)=>({course:l.courseProfile,six:l.sixActualVisibleOnlyPaths,wholeMissing:l.wholeVisibleOnlyMissingTerminal}))})),null,2));
