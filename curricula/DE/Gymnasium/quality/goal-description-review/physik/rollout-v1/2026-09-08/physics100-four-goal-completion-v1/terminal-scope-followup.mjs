// Narrow CQR104 correction; no canonical goals/tasks/resources are changed.
import fs from 'node:fs'
import {createHash} from 'node:crypto'
import {spawnSync} from 'node:child_process'
import {pathToFileURL} from 'node:url'
import {paths,ids} from './authoring-spec.mjs'
const repo=process.cwd(),base='curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-four-goal-completion-v1',read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=s=>'sha256:'+createHash('sha256').update(s).digest('hex'),mod=p=>import(pathToFileURL(repo+'/'+p))
const comp=await mod('app/src/utils/authoring/compositionViewAuthoring.ts'),canon=await mod('app/src/utils/authoring/canonicalAuthoring.ts')
const c=read(paths.canonical),kinds=new Map(read(paths.kinds).decisions.map(d=>[d.goalId,d.semanticKind])),math=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'),decorated={...c,goals:c.goals.map(g=>({...g,semanticKind:kinds.get(g.id)}))},nc=canon.normalizeCanonicalLandscape(decorated),nm=canon.normalizeCanonicalLandscape(math),universe=canon.normalizeCanonicalLandscape({...decorated,goals:[...math.goals,...decorated.goals]})
const compile=v=>comp.compileCompositionView(comp.normalizeCompositionView(v),nc,universe,new Map([[c.landscapeId,nc],[math.landscapeId,nm]]))
const render=r=>{const out=[];function w(n){if(n.sourceGoalId)out.push(n.sourceGoalId);n.children?.forEach(w)}r.compiledRootNodes.forEach(w);return out.sort()}
const supports=['7f0798cb-5966-5dcb-beb3-84f637ab6139','7badac4d-2874-5b3a-87e8-bf8f4440b2a6','70b358bf-da6d-53ba-8393-51d5c2365b04'],comparisonTask='ca13e9cd-6377-540e-88c8-0308cddc8a7e'
const configs=[...['bw','rp'].flatMap(s=>['gk','lk'].map(p=>({file:'de-'+s+'-'+p+'.view.json',action:'move-nuclear-guard'}))),...['gk','lk'].map(p=>({file:'de-by-'+p+'.view.json',action:'reuse-comparison-task'})),...['de-de-gym-physics-gk.view.json','de-de-gym-physics-lk.view.json','de-de-gym-seki-physics.view.json'].map(file=>({file,action:'explicit-national-switch-support'}))]
const changes=[]
for(const config of configs){
 const file='curricula/DE/Gymnasium/composition-views/physik/'+config.file,before=fs.readFileSync(file,'utf8'),v=JSON.parse(before),initial=render(compile(v));let lower,upper,support,practice
 function find(n){if(n.kind==='structure'){if(/^Sekundarstufe II/u.test(n.label))upper=n;else if(/^Sekundarstufe I/u.test(n.label))lower=n;if(n.id==='physics-seki-route-prerequisites')support=n;if(n.id==='physics-seki-practice-assessments')practice=n}n.children?.forEach(find)}v.rootNodes.forEach(find)
 if(!lower)throw Error('Missing existing SekI stage '+file)
 if(config.action==='move-nuclear-guard'){
  if(!upper)throw Error('Missing existing SekII stage '+file)
  const moved=[];function walk(n){if(!n.children)return;n.children=n.children.filter(x=>{if(x.goalId===ids.nuclear&&x.projectionRole==='prerequisiteOnly'){moved.push(x);return false}walk(x);return true})}walk(lower)
  if(!moved.length)throw Error('Expected exact lower old nuclear guard '+file)
  upper.children.push(...moved)
 }else if(config.action==='reuse-comparison-task'){
  if(!practice||initial.includes(comparisonTask))throw Error('Unexpected comparison-task placement '+file)
  const t=c.goals.find(g=>g.id===comparisonTask);if(t.examData.reviewStatus!=='released'||JSON.stringify(t.requires)!==JSON.stringify([ids.comparison]))throw Error('Reviewed existing task changed')
  practice.children.push({kind:'goalEntry',goalId:comparisonTask})
 }else{
  if(!support)throw Error('Missing existing national SekI support anchor '+file)
  for(const goalId of supports){if(support.children.some(n=>n.goalId===goalId))throw Error('Support already present '+goalId);support.children.push({kind:'canonicalSubtree',goalId,projectionRole:'prerequisiteOnly'})}
 }
 function prune(nodes){return nodes.flatMap(n=>{if(n.kind!=='structure')return[n];n.children=prune(n.children);return n.children.length?[n]:[]})}v.rootNodes=prune(v.rootNodes)
 const r=compile(v),afterTargets=render(r),expected=[...initial,...(config.action==='reuse-comparison-task'?[comparisonTask]:[])].sort(),errors=r.findings.filter(f=>f.severity==='error')
 if(errors.length||JSON.stringify(afterTargets)!==JSON.stringify(expected))throw Error('Native exact target/CPV failure '+file+' '+JSON.stringify({errors,removed:initial.filter(id=>!afterTargets.includes(id)),added:afterTargets.filter(id=>!initial.includes(id))}))
 changes.push({file,after:JSON.stringify(v,null,2)+'\n',receipt:{file,action:config.action,beforeSha256:hash(before),afterSha256:hash(JSON.stringify(v,null,2)+'\n'),removedTargets:[],addedTargets:config.action==='reuse-comparison-task'?[comparisonTask]:[],addedPrerequisiteOnly:config.action==='explicit-national-switch-support'?supports:[]}})
}
const receipt={schemaVersion:1,status:'applied-via-guarded-native-validated-patch',preparedAt:new Date().toISOString(),humanApproval:false,canonicalChanges:0,bodyChanges:0,newSourceCoverageClaims:0,views:changes.map(x=>x.receipt)}
if(process.argv[2]==='--emit-patch'){const out=['*** Begin Patch'];for(const x of changes){const d=spawnSync('diff',['-u',x.file,'-'],{input:x.after,encoding:'utf8',maxBuffer:5000000});if(d.status!==1)throw Error('Expected scoped diff');out.push('*** Update File: '+x.file,...d.stdout.trimEnd().split('\n').slice(2).map(s=>/^@@ .* @@/u.test(s)?'@@':s))}const output=base+'/terminal-scope-followup-receipt-a-20260908.json';if(fs.existsSync(output))throw Error('Do not replay receipt');out.push('*** Add File: '+output,...JSON.stringify(receipt,null,2).split('\n').map(s=>'+'+s),'*** End Patch');console.log(out.join('\n'))}else console.log(JSON.stringify(receipt,null,2))

