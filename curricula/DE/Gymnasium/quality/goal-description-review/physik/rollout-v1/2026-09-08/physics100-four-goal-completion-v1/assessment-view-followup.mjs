// Scoped follow-up: real amplifier endpoint follows actual amplifier target visibility;
// HE/RP switch task leaves the inherited Sek-I folder. No task-body change.
import fs from 'node:fs'
import {createHash} from 'node:crypto'
import {spawnSync} from 'node:child_process'
import {pathToFileURL} from 'node:url'
import {ids,paths} from './authoring-spec.mjs'
import {additionalAssessmentGoals} from './additional-assessment-spec.mjs'
const repo=process.cwd(),read=p=>JSON.parse(fs.readFileSync(p,'utf8')),mod=p=>import(pathToFileURL(repo+'/'+p))
const comp=await mod('app/src/utils/authoring/compositionViewAuthoring.ts'),canon=await mod('app/src/utils/authoring/canonicalAuthoring.ts')
const c=read(paths.canonical),k=read(paths.kinds),kinds=new Map(k.decisions.map(d=>[d.goalId,d.semanticKind])),m=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
const decorated={...c,goals:c.goals.map(g=>({...g,semanticKind:kinds.get(g.id)}))},nc=canon.normalizeCanonicalLandscape(decorated),nm=canon.normalizeCanonicalLandscape(m),universe=canon.normalizeCanonicalLandscape({...decorated,goals:[...m.goals,...decorated.goals]})
const compile=v=>comp.compileCompositionView(comp.normalizeCompositionView(v),nc,universe,new Map([[c.landscapeId,nc],[m.landscapeId,nm]]))
const render=r=>{const out=new Map();function walk(n){if(n.sourceGoalId)out.set(n.sourceGoalId,(out.get(n.sourceGoalId)??0)+1);n.children?.forEach(walk)}r.compiledRootNodes.forEach(walk);return out}
const taskId=additionalAssessmentGoals.find(g=>g.requires[0]===ids.amplifier).id
const pathsToChange=fs.readdirSync('curricula/DE/Gymnasium/composition-views/physik').filter(x=>x.endsWith('.json')).map(x=>'curricula/DE/Gymnasium/composition-views/physik/'+x)
const changes=[]
const receipts=[]
const hash=x=>'sha256:'+createHash('sha256').update(x).digest('hex')
for(const p of pathsToChange){const before=fs.readFileSync(p,'utf8'),v=JSON.parse(before),initial=render(compile(v)),refs=[];function walk(n){if(n.goalId===taskId||n.goalId===ids.switchAssessment)refs.push(n);n.children?.forEach(walk)}v.rootNodes.forEach(walk)
 if(initial.has(ids.amplifier)&&!initial.has(taskId)){const n=refs.find(n=>n.goalId===taskId);if(n)n.projectionRole='target';else v.rootNodes.push({kind:'goalEntry',goalId:taskId})}
 if(['DE-HE','DE-RP'].includes(v.scope?.jurisdiction)&&initial.has(ids.switchAssessment)){for(const n of refs.filter(n=>n.goalId===ids.switchAssessment))n.projectionRole='prerequisiteOnly';let group=v.rootNodes.find(n=>n.kind==='structure'&&n.id==='physics-b034-assessments');if(!group){group={kind:'structure',id:'physics-b034-assessments',label:'Materialgestützte Prüfungsaufgaben',children:[]};v.rootNodes.push(group)}let n=group.children.find(n=>n.goalId===ids.switchAssessment);if(n)n.projectionRole='target';else group.children.push({kind:'goalEntry',goalId:ids.switchAssessment})}
 const after=JSON.stringify(v,null,2)+'\n';if(after===before)continue
 const result=compile(v),counts=render(result),errors=result.findings.filter(f=>f.severity==='error')
 if(errors.length)throw Error(p+' '+JSON.stringify(errors))
 if(initial.has(ids.amplifier)&&counts.get(taskId)!==1)throw Error('Missing unique amplifier task '+p)
 if(initial.has(ids.switchAssessment)&&counts.get(ids.switchAssessment)!==1)throw Error('Switch placement duplicate '+p)
 if([...initial.keys()].filter(id=>id!==taskId).some(id=>!counts.has(id)))throw Error('Unrelated target lost '+p)
 changes.push({file:p,before,after})
 receipts.push({file:p,beforeSha256:hash(before),afterSha256:hash(after),nativeCompilerErrors:0,oldTargetsRemoved:[...initial.keys()].filter(id=>!counts.has(id)),addedTargetGoalIds:[...counts.keys()].filter(id=>!initial.has(id)),amplifierWasTarget:initial.has(ids.amplifier),amplifierTaskTargetCount:counts.get(taskId)??0,switchTaskTargetCount:counts.get(ids.switchAssessment)??0})
}
if(process.argv[2]==='--emit-patch'){const out=['*** Begin Patch'];for(const x of changes){const d=spawnSync('diff',['-u',x.file,'-'],{input:x.after,encoding:'utf8',maxBuffer:5000000});if(d.status!==1)throw Error('Expected own scoped view diff');out.push('*** Update File: '+x.file,...d.stdout.trimEnd().split('\n').slice(2).map(s=>/^@@ .* @@/u.test(s)?'@@':s))}const output=new URL('./assessment-view-followup-receipt-a-20260908.json',import.meta.url).pathname.slice(repo.length+1);if(fs.existsSync(output))throw Error('Existing receipt; do not replay');const receipt={schemaVersion:1,status:'applied-via-guarded-minimal-patch',preparedAt:new Date().toISOString(),reviewMode:'informed-AI-author-scope-verification',humanApproval:false,taskBodiesChanged:0,views:receipts};out.push('*** Add File: '+output,...JSON.stringify(receipt,null,2).split('\n').map(s=>'+'+s),'*** End Patch');console.log(out.join('\n'))}else console.log(JSON.stringify({status:'PASS',changedViews:changes.map(x=>x.file),amplifierTaskId:taskId,taskBodiesUnchanged:true,receipts},null,2))
