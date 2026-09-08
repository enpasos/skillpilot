// Exact stage placement only. No canonical/role/target/content mutation.
import fs from 'node:fs'
import {createHash} from 'node:crypto'
import {spawnSync} from 'node:child_process'
import {pathToFileURL} from 'node:url'
import {ids,paths,newGoals,clusters} from './authoring-spec.mjs'
import {assessmentGoals} from './assessment-spec.mjs'
import {additionalAssessmentGoals} from './additional-assessment-spec.mjs'
const base='curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-four-goal-completion-v1',repo=process.cwd(),read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=s=>'sha256:'+createHash('sha256').update(s).digest('hex'),mod=p=>import(pathToFileURL(repo+'/'+p))
const comp=await mod('app/src/utils/authoring/compositionViewAuthoring.ts'),canon=await mod('app/src/utils/authoring/canonicalAuthoring.ts')
const c=read(paths.canonical),k=read(paths.kinds),kinds=new Map(k.decisions.map(d=>[d.goalId,d.semanticKind])),math=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
const decorated={...c,goals:c.goals.map(g=>({...g,semanticKind:kinds.get(g.id)}))},nc=canon.normalizeCanonicalLandscape(decorated),nm=canon.normalizeCanonicalLandscape(math),universe=canon.normalizeCanonicalLandscape({...decorated,goals:[...math.goals,...decorated.goals]})
const compile=v=>comp.compileCompositionView(comp.normalizeCompositionView(v),nc,universe,new Map([[c.landscapeId,nc],[math.landscapeId,nm]]))
const render=r=>{const a=[];function walk(n){if(n.sourceGoalId)a.push(n.sourceGoalId);n.children?.forEach(walk)}r.compiledRootNodes.forEach(walk);return a.sort()}
const refs=v=>{const a=[];function walk(n){if(n.goalId)a.push(JSON.stringify({kind:n.kind,goalId:n.goalId,projectionRole:n.projectionRole??'target'}));n.children?.forEach(walk)}v.rootNodes.forEach(walk);return a.sort()}
const tasks=[...assessmentGoals,...additionalAssessmentGoals],taskToGoal=new Map(tasks.map(g=>[g.id,g.requires[0]]));taskToGoal.set(ids.switchAssessment,ids.switch)
const guards=new Set([...newGoals.map(g=>g.id),...clusters.map(g=>g.id),...tasks.map(g=>g.id),ids.switchAssessment,ids.amplifier,'c64820e1-c0ee-4342-9225-f981650f0c52'])
function stage(n){if(n.kind!=='structure')return null;const l=n.label.toUpperCase();if(/^SEKUNDARSTUFE II(?:$|[\s(:\-–])/u.test(l)||l==='KURSSTUFE'||l.startsWith('KURSSTUFE '))return 'SekII';if(/^SEKUNDARSTUFE I(?:$|[\s(:\-–])/u.test(l))return 'SekI';return null}
const changes=[]
for(const f of fs.readdirSync('curricula/DE/Gymnasium/composition-views/physik').filter(f=>f.endsWith('.json'))){
 const file='curricula/DE/Gymnasium/composition-views/physik/'+f,before=fs.readFileSync(file,'utf8'),v=JSON.parse(before),originalRefs=refs(v),initial=render(compile(v)),stages={}
 function find(n){const s=stage(n);if(s){if(stages[s])throw Error('Ambiguous existing stage '+file);stages[s]=n}n.children?.forEach(find)}v.rootNodes.forEach(find)
 if(!stages.SekI&&!stages.SekII)continue // Pure SekII views already carry their explicit resolved stage; no synthetic extra stage.
 const lowerId=id=>{const goal=taskToGoal.get(id)??id;if(goal===ids.comparison)return true;return [ids.switch,ids.reactor].includes(goal)&&(!v.scope.jurisdiction||v.scope.jurisdiction==='DE-BY')}
 const moves=[],keep=[]
 for(const n of v.rootNodes){
  if(n.kind!=='structure'&&guards.has(n.goalId)&&n.projectionRole==='prerequisiteOnly'&&stages.SekII){stages.SekII.children.push(n);moves.push({goalId:n.goalId,role:n.projectionRole,stage:'SekII',reason:'Upper-stage exclusion/support reference must not leak into SekI course authority'});continue}
  if(n.kind!=='structure'&&guards.has(n.goalId)&&(n.projectionRole??'target')==='target'&&stages.SekII){const s=lowerId(n.goalId)&&stages.SekI?'SekI':'SekII';stages[s].children.push(n);moves.push({goalId:n.goalId,role:'target',stage:s,reason:'Concrete endpoint follows its source-staged competence'});continue}
  if(n.kind==='structure'&&n.id.startsWith('physics-b034-')){
   const buckets={SekI:[],SekII:[]};let canMove=true
   for(const child of n.children){const s=lowerId(child.goalId)&&stages.SekI?'SekI':'SekII';if(!stages[s]){canMove=false;break}buckets[s].push(child)}
   if(canMove){const used=Object.keys(buckets).filter(s=>buckets[s].length);for(const s of used){stages[s].children.push({...n,id:used.length===1?n.id:n.id+'-'+s.toLowerCase(),children:buckets[s]});for(const child of buckets[s])moves.push({goalId:child.goalId,role:child.projectionRole??'target',stage:s,reason:child.goalId===ids.comparison?'Restore the already existing lower-stage nuclear comparison placement':lowerId(child.goalId)?'BY Ph10 / corresponding earliest source stage':'Checked upper-secondary original clause'})}continue}
  }
  keep.push(n)
 }
 v.rootNodes=keep
 if(!moves.length)continue
 if(JSON.stringify(refs(v))!==JSON.stringify(originalRefs))throw Error('Goal reference or role changed '+file)
 const result=compile(v),errors=result.findings.filter(x=>x.severity==='error')
 if(errors.length||JSON.stringify(render(result))!==JSON.stringify(initial))throw Error('Native compiler or exact targetset failure '+file+' '+JSON.stringify(errors))
 const after=JSON.stringify(v,null,2)+'\n';changes.push({file,before,after,moves})
}
const receipt={schemaVersion:1,status:'native-compiler-and-exact-reference-target-identity-PASS',preparedAt:new Date().toISOString(),humanApproval:false,bodyChanges:0,roleChanges:0,targetSetChanges:0,views:changes.map(x=>({file:x.file,beforeSha256:hash(x.before),afterSha256:hash(x.after),moves:x.moves})),pending:'Native stage GK/LK and CQR104 recheck follows operative placement'}
if(process.argv[2]==='--emit-patch'){
 const out=['*** Begin Patch'];for(const x of changes){const d=spawnSync('diff',['-u',x.file,'-'],{input:x.after,encoding:'utf8',maxBuffer:5000000});if(d.status!==1)throw Error('Expected scoped diff');out.push('*** Update File: '+x.file,...d.stdout.trimEnd().split('\n').slice(2).map(s=>/^@@ .* @@/u.test(s)?'@@':s))}
 const output=base+'/stage-placement-receipt-a-20260908.json';if(fs.existsSync(output))throw Error('Existing stage receipt; do not replay')
 out.push('*** Add File: '+output,...JSON.stringify(receipt,null,2).split('\n').map(s=>'+'+s),'*** End Patch');console.log(out.join('\n'))
}else console.log(JSON.stringify({status:receipt.status,views:changes.length,bodyChanges:0,roleChanges:0,targetSetChanges:0,files:changes.map(x=>x.file)},null,2))

