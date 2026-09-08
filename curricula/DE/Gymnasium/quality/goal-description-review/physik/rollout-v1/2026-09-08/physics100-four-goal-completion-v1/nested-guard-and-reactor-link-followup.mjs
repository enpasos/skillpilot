// Final narrowly authorized nested guard move and a second local folder link for the same reactor task.
import fs from 'node:fs'
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
import {ids,paths} from './authoring-spec.mjs'
const base='curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-four-goal-completion-v1',repo=process.cwd(),read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=s=>'sha256:'+createHash('sha256').update(s).digest('hex'),mod=p=>import(pathToFileURL(repo+'/'+p))
const comp=await mod('app/src/utils/authoring/compositionViewAuthoring.ts'),canon=await mod('app/src/utils/authoring/canonicalAuthoring.ts'),{fingerprintSemanticKindSourceGoal}=await mod('app/scripts/goalBookModel.ts')
const cText=fs.readFileSync(paths.canonical,'utf8'),c=JSON.parse(cText),kText=fs.readFileSync(paths.kinds,'utf8'),k=JSON.parse(kText),math=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
const kinds=new Map(k.decisions.map(d=>[d.goalId,d.semanticKind])),decorated={...c,goals:c.goals.map(g=>({...g,semanticKind:kinds.get(g.id)}))},nc=canon.normalizeCanonicalLandscape(decorated),nm=canon.normalizeCanonicalLandscape(math),universe=canon.normalizeCanonicalLandscape({...decorated,goals:[...math.goals,...decorated.goals]})
const compile=v=>comp.compileCompositionView(comp.normalizeCompositionView(v),nc,universe,new Map([[c.landscapeId,nc],[math.landscapeId,nm]]))
const render=r=>{const a=[];function w(n){if(n.sourceGoalId)a.push(n.sourceGoalId);n.children?.forEach(w)}r.compiledRootNodes.forEach(w);return a.sort()}
const refs=v=>{const a=[];function w(n){if(n.goalId)a.push(JSON.stringify({kind:n.kind,goalId:n.goalId,role:n.projectionRole??'target'}));n.children?.forEach(w)}v.rootNodes.forEach(w);return a.sort()}
const changes=[],viewReceipts=[]
for(const state of ['by','rp'])for(const course of ['gk','lk']){
 const file='curricula/DE/Gymnasium/composition-views/physik/de-'+state+'-'+course+'.view.json',before=fs.readFileSync(file,'utf8'),v=JSON.parse(before),initial=render(compile(v)),initialRefs=refs(v)
 let lower,upper;function stages(n){if(n.kind==='structure'){if(/^Sekundarstufe II/u.test(n.label))upper=n;else if(/^Sekundarstufe I/u.test(n.label))lower=n}n.children?.forEach(stages)}v.rootNodes.forEach(stages)
 if(!lower||!upper)throw Error('Expected existing stages '+file)
 const moved=[];function relocate(n){if(!n.children)return;n.children=n.children.filter(child=>{if(child.goalId===ids.transistor&&child.projectionRole==='prerequisiteOnly'){moved.push(child);return false}relocate(child);return true})}relocate(lower)
 if(!moved.length)throw Error('Expected inspected lower historical transistor guard '+file)
 upper.children.push(...moved)
 function prune(nodes){return nodes.flatMap(n=>{if(n.kind!=='structure')return[n];n.children=prune(n.children);return n.children.length?[n]:[]})}v.rootNodes=prune(v.rootNodes)
 const r=compile(v);if(r.findings.some(f=>f.severity==='error')||JSON.stringify(render(r))!==JSON.stringify(initial)||JSON.stringify(refs(v))!==JSON.stringify(initialRefs))throw Error('Native/ref/role/target preservation failed '+file)
 const after=JSON.stringify(v,null,2)+'\n';changes.push({file,after});viewReceipts.push({file,beforeSha256:hash(before),afterSha256:hash(after),movedGuardIds:moved.map(n=>n.goalId),targetAndRoleChanges:0})
}
const folder=c.goals.find(g=>g.id.startsWith('21ab')),task=c.goals.find(g=>g.id==='74a32716-2b46-5d96-8b57-3f6edb90e088')
if(!folder||!folder.title.includes('Sek')||!task||task.examData.reviewStatus!=='released'||task.requires.length!==1||task.requires[0]!==ids.reactor||folder.contains.includes(task.id))throw Error('Unexpected exact reviewed folder/task')
const d=k.decisions.find(d=>d.goalId===folder.id);if(d.sourceFingerprint!==fingerprintSemanticKindSourceGoal(folder))throw Error('Stale folder before own link')
const beforeChildren=[...folder.contains],beforeK=d.sourceFingerprint
folder.contains.push(task.id);d.sourceFingerprint=fingerprintSemanticKindSourceGoal(folder)
const cAfter=JSON.stringify(c,null,2)+'\n',kAfter=JSON.stringify(k,null,2)+'\n';changes.push({file:paths.canonical,after:cAfter},{file:paths.kinds,after:kAfter})
const receipt={schemaVersion:1,status:'applied-via-exact-guarded-patch',preparedAt:new Date().toISOString(),humanApproval:false,views:viewReceipts,folder:{goalId:folder.id,title:folder.title,beforeChildren,afterChildren:folder.contains,beforeK,afterK:d.sourceFingerprint,addedExistingTaskId:task.id},taskBodyChanged:false,canonicalChangedFields:['21ab folder contains only'],kChangedFields:['21ab sourceFingerprint only'],canonicalBeforeSha256:hash(cText),canonicalAfterSha256:hash(cAfter)}
const out=['*** Begin Patch'];for(const x of changes){const diff=spawnSync('diff',['-u',x.file,'-'],{input:x.after,encoding:'utf8',maxBuffer:5000000});if(diff.status!==1)throw Error('Expected exact diff');out.push('*** Update File: '+x.file,...diff.stdout.trimEnd().split('\n').slice(2).map(s=>/^@@ .* @@/u.test(s)?'@@':s))}
const output=base+'/nested-guard-and-reactor-link-receipt-a-20260908.json';if(fs.existsSync(output))throw Error('Do not replay receipt')
out.push('*** Add File: '+output,...JSON.stringify(receipt,null,2).split('\n').map(s=>'+'+s),'*** End Patch')
if(process.argv[2]==='--emit-patch')console.log(out.join('\n'));else console.log(JSON.stringify(receipt,null,2))

