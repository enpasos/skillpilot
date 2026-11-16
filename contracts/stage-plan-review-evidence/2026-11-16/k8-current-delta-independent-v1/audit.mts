import {readFileSync,readdirSync,writeFileSync,mkdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {gunzipSync} from 'node:zlib'
import assert from 'node:assert/strict'
import {KnowledgeContextIndex} from '../../app/scripts/lib/knowledgeContext.ts'
import {normalizeCanonicalLandscape} from '../../app/src/utils/authoring/canonicalAuthoring.ts'
import {normalizeCompositionView,compileCompositionView} from '../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {hasVisibleMaterializedAssessmentCollection} from '../../app/scripts/lib/canonicalMathSek1ReviewedExamRoutes.ts'

const OUT='tmp/pr159-k8-current-delta-independent-20261116/'
mkdirSync(OUT,{recursive:true})
const BASE='069fd6cf4fa5c9c8c8108bd367f986e94c29da12'
const oldReceipt=JSON.parse(gunzipSync(readFileSync('contracts/stage-plan-review-evidence/2026-11-16/current-scope-review-v1/current-input-and-placement.actual.json.gz')).toString())
const pins:any[]=[]
const digest=(v:Uint8Array|string)=>createHash('sha256').update(v).digest('hex')
const read=(path:string)=>{const raw=readFileSync(path);pins.push({path,bytes:raw.length,sha256:digest(raw)});return JSON.parse(raw.toString())}
const catalog=readdirSync('curricula/DE/Gymnasium/canonical').filter(p=>p.endsWith('.json')).sort().map(p=>read('curricula/DE/Gymnasium/canonical/'+p))
assert.equal(catalog.length,21)
const context=new KnowledgeContextIndex(catalog),math=catalog.find(x=>x.subject==='Mathematik'),mid=math.landscapeId
const byId=new Map<string,any>(),normalized=new Map<string,any>()
for(const l of catalog){normalized.set(l.landscapeId,normalizeCanonicalLandscape(l));for(const g of l.goals){byId.set(g.id,g);byId.set(l.landscapeId+':'+g.id,g)}}
const bare=(id:string)=>{assert(byId.has(id),'missing '+id);return byId.get(id).id as string}
const universe=normalizeCanonicalLandscape({landscapeId:'k8-current-complete21',title:'Current catalog',goals:catalog.flatMap(l=>l.goals.map((g:any)=>({...g,contains:(g.contains??[]).map(bare),requires:(g.requires??[]).map(bare)})))})
const ids=(prefixes:string[])=>prefixes.map(p=>math.goals.find((g:any)=>g.id.startsWith(p)).id as string)
const early=ids(['9023226b','39fa30f2','efc3506a','17c9e061']),late=ids(['5518ceb3','632a3837']),added=ids(['96c55cb6','74dc4b0d','f17935b0','959cc50b'])
const focus=new Set([...early,...late,...added]);const pathPrefix='curricula/DE/Gymnasium/composition-views/mathematik/'
const changed=oldReceipt.pins.map((x:any)=>({...x,current:readFileSync(x.path)})).filter((x:any)=>digest(x.current)!==x.sha256).map(({current,...x}:any)=>({...x,currentSha256:digest(current)}))
assert.equal(changed.length,11)
const files=changed.map((x:any)=>x.path).filter((p:string)=>p.startsWith(pathPrefix)).sort()
assert.equal(files.length,10)
assert.equal(files.filter((p:string)=>p.includes('/de-sh')).length,8)
assert.equal(files.filter((p:string)=>p.includes('/de-hb')).length,2)
const refs=(ns:any[]):any[]=>ns.map(n=>n.kind==='structure'?{...n,children:refs(n.children)}:n.goalId?{...n,goalId:bare(n.goalId)}:n)
const stage=(path:any[],scope:any)=>{
 const labels=path.map(x=>String(x.label??''))
 if(labels.some(x=>/^Sekundarstufe II\b/.test(x)))return 'SekII'
 if(labels.some(x=>/^Sekundarstufe I\b/.test(x)))return 'SekI'
 return ['SekI','SekII'].includes(scope.stage)?scope.stage:'unassigned'
}
function inspect(raw:any){
 const v=normalizeCompositionView(raw),compiled=compileCompositionView({...v,rootNodes:refs(v.rootNodes)},normalized.get(mid),universe,normalized)
 assert.deepEqual(compiled.findings.filter(f=>f.severity==='error'),[],raw.viewId)
 const seeds=new Set<string>(),positions=new Map<string,any[]>(),allNodes:any[]=[]
 function walk(ns:any[],path:any[]){for(const n of ns){allNodes.push(n);if(n.sourceGoalId){const id=bare(n.sourceGoalId);const key=context.graph.resolve(id,mid);if(context.graph.isAtomic(key))seeds.add(id);if(focus.has(id))positions.set(id,[...(positions.get(id)??[]),{stage:stage(path,raw.scope),path:path.map(x=>({id:x.runtimeId,label:x.label}))}])};walk(n.children??[],[...path,n])}}
 walk(compiled.compiledRootNodes,[])
 const learning=new Set(seeds)
 for(const id of seeds)for(const key of context.graph.reach(context.graph.resolve(id,mid)))learning.add(context.graph.goal(key).id)
 const metadata:any[]=[]
 function scan(ns:any[],path:string){ns.forEach((n,i)=>{const p=path+'/'+i;if(n.canonicalSourceGoalId){const source=byId.get(n.canonicalSourceGoalId);assert(source,'unknown source binding');assert(source.contains?.length,'source binding is not nonempty cluster');const tasks=new Set<string>(source.contains);assert(hasVisibleMaterializedAssessmentCollection(v,compiled.compiledRootNodes,n.canonicalSourceGoalId,tasks),'invalid materialization '+p);metadata.push({path:p,id:n.id,canonicalSourceGoalId:n.canonicalSourceGoalId})};if(n.children)scan(n.children,p+'/children')})}
 scan(raw.rootNodes,'/rootNodes')
 return {seeds,learning,positions,metadata,findings:compiled.findings}
}
const rows:any[]=[]
for(const path of files){
 const raw=read(path),old=JSON.parse(execFileSync('git',['show',BASE+':'+path],{maxBuffer:5_000_000}).toString())
 const before=inspect(old),now=inspect(raw),seedAdded=[...now.seeds].filter(x=>!before.seeds.has(x)),seedRemoved=[...before.seeds].filter(x=>!now.seeds.has(x)),learningAdded=[...now.learning].filter(x=>!before.learning.has(x)),learningRemoved=[...before.learning].filter(x=>!now.learning.has(x))
 assert.deepEqual(seedRemoved,[]);assert.deepEqual(learningAdded,[]);assert.deepEqual(learningRemoved,[])
 assert(seedAdded.every(x=>added.includes(x)))
 if(raw.scope.jurisdiction==='DE-SH'){
  for(const id of early){assert(now.seeds.has(id));assert(now.positions.get(id)?.every(x=>x.stage==='SekI'))}
  for(const id of late){if(raw.scope.stage==='SekI'){assert(!now.seeds.has(id));assert(!now.learning.has(id))}else{assert(now.seeds.has(id));assert(now.positions.get(id)?.every(x=>x.stage==='SekII'))}}
 }else{for(const id of late){assert(now.seeds.has(id));assert(now.positions.get(id)?.every(x=>x.stage==='SekII'))}}
 for(const id of late)if(now.seeds.has(id)&&id===late[1])assert(now.positions.get(id)?.every(p=>p.path.some((n:any)=>/^E(?:\s|$)|Einführungsphase/i.test(String(n.label??'')))))
 const removedMetadata:any[]=[]
 function normalizeDelta(n:any):any{
  if(Array.isArray(n))return n.filter(x=>!(x.kind==='structure'&&String(x.id).startsWith('math-sh-algebra-preparation-'))).map(normalizeDelta)
  if(n&&typeof n==='object'){const result:any={};for(const[k,v]of Object.entries(n)){if(k==='canonicalSourceGoalId'){removedMetadata.push(v);continue}result[k]=normalizeDelta(v)}return result}
  return n
 }
 const a=normalizeDelta(old),b=normalizeDelta(raw)
 // The malformed old structure IDs were replaced; labels, roles, existing nodes,
 // child order and all K8 goal positions must otherwise remain equal.
 function unifyIds(x:any,y:any){if(Array.isArray(x)&&Array.isArray(y)){assert.equal(x.length,y.length);for(let i=0;i<x.length;i++)unifyIds(x[i],y[i])}else if(x&&y&&typeof x==='object'&&typeof y==='object'){if(x.kind==='structure'&&y.kind==='structure'&&x.id!==y.id){assert(String(x.id).startsWith('math-stage-v2-placement-')||String(x.id).startsWith('math-v3-actual-assessment-routes-under-math-stage-v2-placement-'));x.id=y.id};for(const k of Object.keys(x))if(k in y)unifyIds(x[k],y[k])}}
 unifyIds(a,b);assert.deepEqual(b,a,'unexplained view delta '+path)
 rows.push({path,scope:raw.scope,beforeSha256:digest(execFileSync('git',['show',BASE+':'+path],{maxBuffer:5_000_000})),currentSha256:digest(readFileSync(path)),compiledErrors:0,seedCounts:[before.seeds.size,now.seeds.size],learningCounts:[before.learning.size,now.learning.size],seedAdded,seedRemoved,learningAdded,learningRemoved,materializedCollectionBindings:now.metadata,focus:[...focus].map(id=>({id,title:byId.get(id).title,isTarget:now.seeds.has(id),inLearning:now.learning.has(id),positions:now.positions.get(id)??[]}))})
}
const goals=[...focus].map(id=>byId.get(id))
const beforeMath=JSON.parse(execFileSync('git',['show',BASE+':curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'],{maxBuffer:10_000_000}).toString())
for(const g of goals)assert.deepEqual(g,beforeMath.goals.find((x:any)=>x.id===g.id))
const closures=goals.map(g=>({id:g.id,title:g.title,requires:g.requires,closure:[...context.graph.reach(context.graph.resolve(g.id,mid))].map(k=>({id:context.graph.goal(k).id,title:context.graph.goal(k).title,landscapeId:context.graph.landscapeId(k)}))}))
for(const p of pins)assert.equal(digest(readFileSync(p.path)),p.sha256,'input drift '+p.path)
const result={at:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD']).toString().trim(),scope:'Fresh independent K8 delta on eight changed SH and two changed HB views. Complete21 resolution is context machinery, not a new 54-input subject acceptance.',baseCommit:BASE,priorReceiptChangedPinCount:changed.length,changedPriorPins:changed,catalogRoots:21,compiledViews:rows.length,compiledErrors:0,currentGoals:goals,focusClosures:closures,pins,views:rows,oldReviewUntouched:true,sourceMutation:false,fullQaOrActualUiReplay:false}
writeFileSync(OUT+'current-k8-native-delta.actual.json',JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({head:result.head,changedPriorPins:changed.length,compiledViews:rows.length,errors:0,allCurrentK8StageChecks:true,wholeLearningBasisInvariant:true,seedDeltas:rows.map(x=>({view:x.path.split('/').at(-1),added:x.seedAdded}))},null,2))
