import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {prepareLandscapeEntries} from '/home/enpasos/projects/skillpilot/app/src/hooks/useLandscapes.ts'
import {applyCompositionViewProjection,applyPersonalCurriculumProjection} from '/home/enpasos/projects/skillpilot/app/src/utils/compositionViewRuntime.ts'
import {normalizeLearnerProjectedEntries} from '/home/enpasos/projects/skillpilot/app/src/utils/learnerTreeProjection.ts'
const root='/home/enpasos/projects/skillpilot/'
const files=['app/src/utils/compositionViewRuntime.ts','app/src/utils/learnerTreeProjection.ts','app/src/hooks/useLandscapes.ts','app/scripts/testCompositionPreparationPlacements.ts','app/src/utils/authoring/compositionViewAuthoring.ts']
const hash=(path:string)=>createHash('sha256').update(readFileSync(root+path)).digest('hex')
const pins=files.map(path=>({path,sha256:hash(path)}))
const atom=(id:string)=>({id,title:id,description:id,requires:[],contains:[],tags:[],weight:1,core:true,dimensionTags:{phase:'GLOBAL',framework:'fixture',demandLevel:'AB2',processCompetencies:[],guidingIdeas:[]}})
const index=(entries:any[])=>new Map<string,any>(entries.flatMap(entry=>entry.goals.map((g:any)=>[g.id,g])))
const reachable=(entries:any[])=>{
 const goals=index(entries),seen=new Set<string>()
 const visit=(id:string)=>{if(seen.has(id))return;seen.add(id);goals.get(id)?.contains.forEach(visit)}
 for(const entry of entries)for(const g of entry.goals)if(g.tags.includes('root'))visit(g.id)
 return seen
}
let cases=0
for(const marked of [false,true])for(const anchored of [false,true])for(const foreign of [false,true])for(let mask=0;mask<16;mask++){
 const raw:any={landscapeId:'subject',title:'Fach',subject:'Fach',description:'',locale:'de-DE',goals:[{...atom('root'),title:'Fach',contains:['seed',...Array.from({length:4},(_,i)=>'a'+i)],tags:anchored?['root']:[]},atom('seed'),...Array.from({length:4},(_,i)=>atom('a'+i))]}
 const source=prepareLandscapeEntries([raw])
 const sourceForPresentation=foreign?source.map(e=>({...e,goals:e.goals.filter(g=>g.id!=='a3')})):source
 const targets=['seed',...Array.from({length:4},(_,i)=>'a'+i).filter((_,i)=>(mask&(1<<i))!==0)]
 const personal=source.map(e=>({...e,meta:{...e.meta,personalCurriculumProjection:{revision:'atomic-prerequisite-learning-v1',rootLandscapeId:'subject',scopeRevision:'fixture',seedAtomicGoalIds:targets,targetGoalIds:targets,requiredByPaths:{}}}}))
 const structure=(id:string,children:any[],order?:any)=>({kind:'structure',id,label:id,children,...(order?{childOrder:order}:{})})
 const view:any={viewId:'independent',viewFormatVersion:'1.2',landscapeId:'subject',scope:{schoolForm:'Gymnasium',stage:'CrossStage'},rootNodes:[{...structure('view-root',[structure('before',[structure('topic',[...Array.from({length:4},(_,i)=>({kind:'goalEntry',goalId:'a'+i,projectionRole:'prerequisiteOnly',...(marked?{acquisitionPlacement:true}:{})}))])],{after:[]}),structure('later',[{kind:'goalEntry',goalId:'seed'}])],{after:[{unit:'later',after:'before'}]}),label:'Fach'}]}
 const before=JSON.stringify({source,sourceForPresentation,personal,view})
 const authored=normalizeLearnerProjectedEntries(applyCompositionViewProjection(sourceForPresentation,view))
 assert.deepEqual([...reachable(authored)].filter(id=>/^a\d$/.test(id)),[])
 const actual=applyPersonalCurriculumProjection(authored,personal)
 const seen=reachable(actual)
 assert.deepEqual([...seen].filter(id=>id==='seed'||/^a\d$/.test(id)).sort(),[...targets].sort())
 const goals=index(actual),topic=goals.get('composition:independent:structure:topic')
 assert.deepEqual(goals.get(anchored?'root':'composition:independent:structure:view-root')?.extendedData?.compositionChildOrder,{after:[{unit:'later',after:'before'}]},'Root anchoring must preserve declared source order')
 if(mask&&marked){assert.deepEqual(topic.contains,[...targets].filter(id=>id!=='seed'));assert.deepEqual(goals.get(anchored?'root':'composition:independent:structure:view-root').contains,['composition:independent:structure:before','composition:independent:structure:later'])}
 else assert(!topic,'No necessary preparation means no visible support branch')
 assert.deepEqual(applyPersonalCurriculumProjection(actual,personal),actual)
 assert.equal(JSON.stringify({source,sourceForPresentation,personal,view}),before)
 assert.equal(actual.flatMap(e=>e.goals).some(g=>g.personalCurriculumProjection?.presentationOnly),!marked&&mask!==0,'Only explicit acquisition markers authorize templates; unmarked exclusions retain fallback')
 cases++
}
let ownershipCases=0
for(let ownDepth=1;ownDepth<=3;ownDepth++)for(let foreignDepth=1;foreignDepth<=5;foreignDepth++)for(const hasOwn of [false,true])for(const existingTarget of [false,true])for(const reverseEntries of [false,true])for(const reverseViews of [false,true]){
 const subject=(landscapeId:string,title:string,goals:any[])=>({landscapeId,title,subject:title,description:'',locale:'de-DE',goals})
 const rawOwn=subject('owner','Owner',[{...atom('owner-root'),title:'Owner',contains:['a','b'],tags:['root']},atom('a'),{...atom('b'),requires:['a']}])
 const rawForeign=subject('foreign','Foreign',[{...atom('foreign-root'),title:'Foreign',contains:['c'],tags:['root']},{...atom('c'),requires:['a']}])
 const source=prepareLandscapeEntries([rawOwn,rawForeign]as any)
 const metadata=source.map(entry=>({...entry,meta:{...entry.meta,personalCurriculumProjection:{revision:'atomic-prerequisite-learning-v1',rootLandscapeId:'combined-program',scopeRevision:'fixture',seedAtomicGoalIds:entry.meta.landscapeId==='owner'?['b']:['c'],targetGoalIds:entry.meta.landscapeId==='owner'?['a','b']:['c'],requiredByPaths:entry.meta.landscapeId==='owner'?{a:['b','a']}:{}}}}))
 const chain=(prefix:string,depth:number,marked:boolean):any=>({kind:'structure',id:prefix+depth,label:prefix+depth,children:depth>1?[chain(prefix,depth-1,marked)]:[{kind:'goalEntry',goalId:'a',projectionRole:'prerequisiteOnly',...(marked?{acquisitionPlacement:true}:{})}]})
 const view=(id:string,landscapeId:string,title:string,goalId:string,branch:any,extra:any[]=[])=>({viewId:id,viewFormatVersion:'1.2',landscapeId,scope:{schoolForm:'Gymnasium',stage:'CrossStage'},rootNodes:[{kind:'structure',id:id+'-root',label:title,children:[{kind:'goalEntry',goalId},branch,...extra]}]})
 const owner=view('own-preference','owner','Owner','b',chain('o',ownDepth,hasOwn))
 const foreign=view('foreign-preference','foreign','Foreign','c',chain('f',foreignDepth,true),existingTarget?[{kind:'structure',id:'target',label:'Target',children:[{kind:'goalEntry',goalId:'a'}]}]:[])
 const originals=JSON.stringify({source,metadata,owner,foreign})
 const inputs=reverseEntries?[...source].reverse():source,views=reverseViews?[foreign,owner]:[owner,foreign]
 const projected=views.reduce((entries,v)=>applyCompositionViewProjection(entries,v as any),inputs)
 const actual=applyPersonalCurriculumProjection(normalizeLearnerProjectedEntries(projected),metadata as any)
 const parent=existingTarget?'composition:foreign-preference:structure:target':hasOwn?'composition:own-preference:structure:o1':'composition:foreign-preference:structure:f1'
 assert.deepEqual(actual.flatMap(entry=>entry.goals.filter(g=>g.contains.includes('a')).map(g=>g.id)),[parent])
 assert.deepEqual([...reachable(actual)].filter(id=>['a','b','c'].includes(id)).sort(),['a','b','c'])
 assert.deepEqual(applyPersonalCurriculumProjection(actual,metadata as any),actual)
 assert.equal(JSON.stringify({source,metadata,owner,foreign}),originals)
 ownershipCases++
}
let referenceOrderCases=0
for(const referenceKind of ['goalEntry','canonicalSubtree'])for(const anchored of [false,true]){
 const a={...atom('a'),type:'atomic'},b={...atom('b'),type:'atomic',requires:['a']}
 const ref=referenceKind==='canonicalSubtree'?'bundle':'b'
 const raw:any={landscapeId:'s',title:'Fach',subject:'Fach',locale:'de-DE',goals:[{...atom('r'),type:'cluster',title:'Fach',tags:anchored?['root']:[],contains:['a',ref]},a,b,...(referenceKind==='canonicalSubtree'?[{...atom('bundle'),type:'cluster',contains:['b']}]:[])]}
 const source=prepareLandscapeEntries([raw]),metadata=source.map(entry=>({...entry,meta:{...entry.meta,personalCurriculumProjection:{revision:'atomic-prerequisite-learning-v1',rootLandscapeId:'s',scopeRevision:'fixture',seedAtomicGoalIds:['b'],targetGoalIds:['a','b'],requiredByPaths:{a:['b','a']}}}}))
 const view:any={viewId:'source-order',viewFormatVersion:'1.2',landscapeId:'s',scope:{schoolForm:'Gymnasium'},rootNodes:[{kind:'structure',id:'vroot',label:'Fach',childOrder:{after:[]},children:[{kind:'structure',id:'earlier',label:'Earlier',children:[{kind:'goalEntry',goalId:'a',projectionRole:'prerequisiteOnly',acquisitionPlacement:true}]},{kind:referenceKind,goalId:ref}]}]}
 const before=JSON.stringify({source,metadata,view})
 const projected=normalizeLearnerProjectedEntries(applyCompositionViewProjection(source,view))
 const actual=applyPersonalCurriculumProjection(projected,metadata as any),goals=index(actual)
 assert.deepEqual(goals.get(anchored?'r':'composition:source-order:structure:vroot').contains,['composition:source-order:structure:earlier',ref])
 assert.deepEqual(applyPersonalCurriculumProjection(actual,metadata as any),actual)
 assert.equal(JSON.stringify({source,metadata,view}),before)
 referenceOrderCases++
}

let phaseCases=0
for(const format of ['1.0','1.1','1.2'])for(const kind of ['goalEntry','canonicalSubtree'])for(const anchored of [false,true])for(const sourcePhase of ['E','Q1','Q2','Q3','Q4'])for(const canonicalPhase of ['E','Q1','Q2','Q3','Q4']){
 const phased=(id:string,contains:string[]=[])=>({...atom(id),type:contains.length?'cluster':'atomic',dimensionTags:{...atom(id).dimensionTags,phase:canonicalPhase},contains})
 const raw:any={landscapeId:'phase-subject',title:'Phase subject',subject:'Phase subject',locale:'de-DE',goals:[{...atom('phase-root'),title:'Phase subject',type:'cluster',tags:anchored?['root']:[],contains:['bundle','outside']},phased('a'),phased('b'),phased('bundle',['nested']),phased('nested',['b']),phased('outside')]}
 const source=prepareLandscapeEntries([raw])
 const v:any={viewId:'phase-independent',viewFormatVersion:format,landscapeId:'phase-subject',scope:{schoolForm:'Gymnasium'},rootNodes:[{kind:'structure',id:'root',label:'Phase subject',children:[{kind:'structure',id:'selected-phase',label:sourcePhase==='E'?'E-Phase':sourcePhase,children:[{kind,goalId:kind==='goalEntry'?'b':'bundle'}]}]}]}
 const before=JSON.stringify({source,v}),projected=applyCompositionViewProjection(source,v)
 assert.deepEqual([...reachable(projected)].filter(id=>['a','b','outside'].includes(id)),['b'])
 const normalized=normalizeLearnerProjectedEntries(projected),present=reachable(normalized)
 assert.equal(present.has('b'),format==='1.2'||sourcePhase===canonicalPhase,`${format}/${kind}/${anchored}/${sourcePhase}/${canonicalPhase}`)
 assert(!present.has('outside')&&!present.has('a'),'Canonical siblings and prerequisites must not become scope through normalization exemption')
 assert.deepEqual(normalizeLearnerProjectedEntries(normalized),normalized)
 const personal=source.map(entry=>({...entry,meta:{...entry.meta,personalCurriculumProjection:{revision:'atomic-prerequisite-learning-v1',rootLandscapeId:'phase-subject',scopeRevision:'fixture',seedAtomicGoalIds:['b'],targetGoalIds:['b'],requiredByPaths:{}}}}))
 const final=applyPersonalCurriculumProjection(normalized,personal as any)
 assert.deepEqual([...reachable(final)].filter(id=>['a','b','outside'].includes(id)),['b'],'Closed target authority stays singleton')
 assert.equal(JSON.stringify({source,v}),before)
 assert.deepEqual(index(projected).get('b').requires,[])
 phaseCases++
}
const mixed=prepareLandscapeEntries([{landscapeId:'mixed',title:'Mixed',subject:'Mixed',locale:'de-DE',goals:[{...atom('marked-root'),tags:['root'],title:'Q1',contains:['marked'],extendedData:{compositionViewFormatVersion:'1.2'}},{...atom('legacy-root'),tags:['root'],title:'Q1',contains:['legacy']},{...atom('marked'),dimensionTags:{...atom('marked').dimensionTags,phase:'Q2'}},{...atom('legacy'),dimensionTags:{...atom('legacy').dimensionTags,phase:'Q2'}}]}] as any)
const mixedNormalized=normalizeLearnerProjectedEntries(mixed)
assert.deepEqual(index(mixedNormalized).get('marked-root').contains,['marked'])
assert.deepEqual(index(mixedNormalized).get('legacy-root').contains,[])

assert(files.every((p,i)=>hash(p)===pins[i].sha256))
const report={at:new Date().toISOString(),decision:'PASS',pins,cases,ownershipCases,referenceOrderCases,phaseCases,checks:['300 phase-pair/format/reference/root combinations plus same-entry legacy isolation; closed target singleton preserved','own-subject authority across 15 depth combinations and all4input orders; foreign fallback and existing-target precedence','restored source order before goalEntry and real canonicalSubtree despite normalization','root order survives canonical anchoring','marked and unmarked references remain distinct','all16 preparation subsets','anchored and synthetic root','hydration from authoritative source','no acquisition-scope growth','no support branch without closed targets','exact authored path','idempotence','input/source immutability'],limitation:'Pure runtime-function review; chronological placement and real learner-map measurement remain separate.'}
writeFileSync(root+'tmp/pipeline/laender-stufen/gesamt/review/preparation-runtime/review-v6.actual.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report,null,2))
