// Authorized two-view completion of the existing BW assessment's direct support.
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
const taskId='a77138b8-3924-4a17-a22e-d2625ab19bd6',task=c.goals.find(g=>g.id===taskId)
if(task.examData.reviewStatus!=='released'||JSON.stringify(task.requires)!==JSON.stringify([ids.energy]))throw Error('Existing reviewed qualitative energy task changed')
const changes=[]
for(const suffix of ['gk','lk']){
 const file='curricula/DE/Gymnasium/composition-views/physik/de-bw-'+suffix+'.view.json',before=fs.readFileSync(file,'utf8'),v=JSON.parse(before),initial=render(compile(v));let support,practice
 function find(n){if(n.id==='physics-seki-route-prerequisites')support=n;if(n.id==='physics-seki-practice-assessments')practice=n;n.children?.forEach(find)}v.rootNodes.forEach(find)
 if(!support||!practice||support.children.some(n=>n.goalId===ids.energy)||initial.includes(taskId))throw Error('Expected exact missing BW support/task placement '+file)
 support.children.push({kind:'canonicalSubtree',goalId:ids.energy,projectionRole:'prerequisiteOnly'})
 practice.children.push({kind:'goalEntry',goalId:taskId})
 const r=compile(v),expected=[...initial,taskId].sort(),errors=r.findings.filter(f=>f.severity==='error')
 if(errors.length||JSON.stringify(render(r))!==JSON.stringify(expected))throw Error('Native exact target/CPV guard '+file+' '+JSON.stringify(errors))
 const after=JSON.stringify(v,null,2)+'\n';changes.push({file,after,receipt:{file,beforeSha256:hash(before),afterSha256:hash(after),addedPrerequisiteOnly:[ids.energy],addedTargets:[taskId],removedTargets:[],energyPromotedToTarget:false,reactorAdded:false,nativeCompilerErrors:[]}})
}
const receipt={schemaVersion:1,status:'applied-via-guarded-native-validated-patch',preparedAt:new Date().toISOString(),humanApproval:false,canonicalChanges:0,bodyChanges:0,newSourceCoverageClaims:0,reason:'BW already targets nuclear-energy evaluation and its a77e comparison/judgment assessment. Only the energy explanation prerequisite was missing after replacing the overly broad nuclear-cluster support. The existing qualitative a771 terminal is required for that support in the native SekI assessment catalog.',views:changes.map(x=>x.receipt)}
if(process.argv[2]==='--emit-patch'){const out=['*** Begin Patch'];for(const x of changes){const d=spawnSync('diff',['-u',x.file,'-'],{input:x.after,encoding:'utf8',maxBuffer:5000000});if(d.status!==1)throw Error('Expected scoped diff');out.push('*** Update File: '+x.file,...d.stdout.trimEnd().split('\n').slice(2).map(s=>/^@@ .* @@/u.test(s)?'@@':s))}const output=base+'/bw-energy-support-receipt-a-20260908.json';if(fs.existsSync(output))throw Error('Do not replay receipt');out.push('*** Add File: '+output,...JSON.stringify(receipt,null,2).split('\n').map(s=>'+'+s),'*** End Patch');console.log(out.join('\n'))}else console.log(JSON.stringify(receipt,null,2))
