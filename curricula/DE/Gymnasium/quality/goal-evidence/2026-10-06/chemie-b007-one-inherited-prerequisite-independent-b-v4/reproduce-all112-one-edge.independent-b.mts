// SPDX-License-Identifier: Apache-2.0
// Actual unchanged native helpers; all writes stay inside this new B QA package.
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,join,dirname,relative} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../../../../../..'),date=join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06')
const author=join(date,'chemie-b007-one-inherited-prerequisite-targeted-author-v4'),previousAuthor=join(date,'chemie-b007-seven-native-source-preparation-author-v3'),previousB=join(date,'chemie-b007-seven-native-source-independent-b-v3')
const inputs=new Map<string,unknown>()
const bind=(p:string)=>({path:relative(root,p),sha256:createHash('sha256').update(readFileSync(p)).digest('hex'),bytes:readFileSync(p).length})
const read=(p:string)=>{inputs.set(p,bind(p));return JSON.parse(readFileSync(p,'utf8'))}
const write=(n:string,v:unknown)=>writeFileSync(join(here,n),JSON.stringify(v,null,2)+'\n')
const imp=async(p:string)=>{inputs.set(join(root,p),bind(join(root,p)));return import(pathToFileURL(join(root,p)).href)}
const {prepareLandscapeEntries}=await imp('app/src/hooks/useLandscapes.ts')
const {loadGoalBookBuildInputs,fingerprintSemanticKindSourceGoal}=await imp('app/scripts/goalBookModel.ts')
const {normalizeCanonicalLandscape,validateCanonicalLandscape}=await imp('app/src/utils/authoring/canonicalAuthoring.ts')
const {compileCompositionView}=await imp('app/src/utils/authoring/compositionViewAuthoring.ts')
const guard=read(join(previousAuthor,'current378-and-protected112-author-input-guard.actual.json'))
const path0=join(root,guard.baselineActiveCanon.path),path3=join(previousAuthor,'qa-artifacts/DE_DEU_S_GYM_CANONICAL_CHEMIE.four-route-proposals.author-candidate.json'),path4=join(author,'qa-artifacts/DE_DEU_S_GYM_CANONICAL_CHEMIE.one-inherited-prerequisite.author-candidate.json')
const raw=[path0,path3,path4].map(read),maps=raw.map(v=>new Map(v.goals.map((g:any)=>[g.id,g]))),entries=raw.map(v=>prepareLandscapeEntries([v])[0].goals),effective=entries.map(v=>new Map(v.map((g:any)=>[g.id,g])))
const broad='53fd1bfd-facb-54ae-b2dc-f667ed1414fc',states='326d45bf-9f77-57d5-a054-93e76b034dd5',cluster='10ce2814-8796-5633-9bed-f6990d039b91'
const changed=raw[2].goals.filter((g:any)=>JSON.stringify(g)!==JSON.stringify(maps[1].get(g.id)))
if(changed.length!==1||changed[0].id!==cluster)throw Error('Not exactly one changed cluster')
const stripReq=(v:any)=>Object.fromEntries(Object.entries(v).filter(([k])=>k!=='requires'))
if(JSON.stringify(stripReq(changed[0]))!==JSON.stringify(stripReq(maps[1].get(cluster))))throw Error('Fields outside requires changed')
if(JSON.stringify((maps[1].get(cluster) as any).requires)!==JSON.stringify([states,broad])||JSON.stringify(changed[0].requires)!==JSON.stringify([states]))throw Error('Unexpected single edge')
const beforeKind=read(join(previousAuthor,'qa-artifacts/chemie.semantic-kinds.four-route-proposals.author-candidate.json')),afterKind=read(join(author,'qa-artifacts/chemie.semantic-kinds.one-inherited-prerequisite.author-candidate.json'))
const oldKindMap=new Map(beforeKind.decisions.map((r:any)=>[r.goalId,r]));const kindDeltas=afterKind.decisions.filter((r:any)=>JSON.stringify(r)!==JSON.stringify(oldKindMap.get(r.goalId)))
if(kindDeltas.length!==1||kindDeltas[0].goalId!==cluster||kindDeltas[0].sourceFingerprint!==fingerprintSemanticKindSourceGoal(changed[0]))throw Error('Unexpected kind delta')
const oldModel=read(join(previousB,'four-route-proposals-native-pure-book-model.independent-b.actual.json')),baselineModel=read(join(previousB,'baseline-native-pure-book-model.independent-b.actual.json'))
const configPath=join(author,'qa-artifacts/one-inherited-prerequisite-native-book.config.json'),config=read(configPath)
for(const key of ['landscapePath','compositionViewPath','semanticKindLedgerPath','goalVisualizationQaPath'])read(join(root,config[key]))
const loaded=await loadGoalBookBuildInputs(relative(root,configPath),root),model=loaded.model
if(model.pages.length!==382||raw[2].goals.length!==485)throw Error('Unexpected denominator')
write('native-v4-pure-book-model.independent-b.actual.json',model)
const pageMaps=[baselineModel,oldModel,model].map(v=>new Map(v.pages.map((p:any)=>[p.goalId,p])))
const parents=raw.map(v=>{const m=new Map<string,string[]>();for(const g of v.goals)for(const ref of g.contains??[]){const id=ref.includes(':')?ref.split(':').at(-1):ref;m.set(id,[...(m.get(id)??[]),g.id])}return m})
const chains=(id:string,index:number,path:string[]=[]):any[]=>{if(path.includes(id))throw Error('Contains cycle');const pids=parents[index].get(id)??[];if(!pids.length)return [[{goalId:id,title:(maps[index].get(id) as any).title,directRequires:(maps[index].get(id) as any).requires}]];return pids.flatMap(pid=>chains(pid,index,[...path,id]).map(c=>[{goalId:id,title:(maps[index].get(id) as any).title,directRequires:(maps[index].get(id) as any).requires},...c]))}
const sorted=(v:string[])=>[...v].sort().join(',')
const stripPagination=(v:any):any=>Array.isArray(v)?v.map(stripPagination):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>!['pageNumber','navigationOrder','treeOrder','pageFingerprint'].includes(k)).map(([k,x])=>[k,stripPagination(x)])):v
const all112=guard.protectedStrictGoalIds.map((id:string)=>{const g:any[]=maps.map(m=>m.get(id)),e:any[]=effective.map(m=>m.get(id)),p:any[]=pageMaps.map(m=>m.get(id));return{goalId:id,title:g[2].title,baselineWholeGoal:g[0],priorV3WholeGoal:g[1],candidateV4WholeGoal:g[2],wholeGoalExactV3ToV4:JSON.stringify(g[1])===JSON.stringify(g[2]),wholeGoalExactBaselineToV4:JSON.stringify(g[0])===JSON.stringify(g[2]),completeDirectRequires:{baseline:e[0].requires,v3:e[1].requires,v4:e[2].requires},completeEffectiveRequires:{baseline:e[0].effectiveRequires,v3:e[1].effectiveRequires,v4:e[2].effectiveRequires},completeInheritedRequires:{baseline:e[0].inheritedRequires,v3:e[1].inheritedRequires,v4:e[2].inheritedRequires},effectiveRequiresSetChanged:sorted(e[1].effectiveRequires)!==sorted(e[2].effectiveRequires),fullContainingParentChains:{v3:chains(id,1),v4:chains(id,2)},nativeFingerprintAndActualPageBindings:{baselineGoalFingerprint:p[0].goalFingerprint,v3GoalFingerprint:p[1].goalFingerprint,v4GoalFingerprint:p[2].goalFingerprint,baselinePageFingerprint:p[0].pageFingerprint,v3PageFingerprint:p[1].pageFingerprint,v4PageFingerprint:p[2].pageFingerprint,wholePageExactV3ToV4:JSON.stringify(p[1])===JSON.stringify(p[2]),pageContextIgnoringPaginationExactBaselineToV4:JSON.stringify(stripPagination(p[0]))===JSON.stringify(stripPagination(p[2]))}}})
const actualAllGraphEffectiveDeltas=entries[2].filter((g:any)=>sorted(g.effectiveRequires)!==sorted((effective[1].get(g.id) as any).effectiveRequires)).map((g:any)=>({goalId:g.id,title:g.title,protectedStrict:guard.protectedStrictGoalIds.includes(g.id),v3Effective:(effective[1].get(g.id) as any).effectiveRequires,v4Effective:g.effectiveRequires}))
const beforeInherited=all112.filter((r:any)=>r.completeInheritedRequires.v3.includes(broad)).map((r:any)=>r.goalId),afterInherited=all112.filter((r:any)=>r.completeInheritedRequires.v4.includes(broad)).map((r:any)=>r.goalId)
const realRenderedDeltas=all112.filter((r:any)=>!r.nativeFingerprintAndActualPageBindings.pageContextIgnoringPaginationExactBaselineToV4).map((r:any)=>r.goalId),reviewUnion=[...new Set([...realRenderedDeltas,...beforeInherited])]
if(beforeInherited.length!==4||afterInherited.length||reviewUnion.length!==9||!all112.every((r:any)=>r.wholeGoalExactV3ToV4))throw Error('Protected delta unexpected')
const dag:any={};const by=maps[2]
for(const field of ['contains','requires']){const active=new Set(),done=new Set();const walk=(id:string)=>{if(active.has(id))throw Error(field+' cycle');if(done.has(id))return;active.add(id);const g:any=by.get(id);for(const r of g[field]??[]){const local=r.includes(':')?r.split(':').at(-1):r;if(!by.has(local))throw Error('Missing '+r);walk(local)}active.delete(id);done.add(id)};for(const id of by.keys())walk(id as string);dag[field]=true}
const heview=read(join(previousAuthor,'qa-artifacts/he8-seven-routines.prospective-source.view.json')),diag=validateCanonicalLandscape(normalizeCanonicalLandscape(raw[2])),hecomp=compileCompositionView(heview,normalizeCanonicalLandscape(raw[2]))
const remaining=raw[2].goals.filter((g:any)=>g.requires.includes(broad)).map((g:any)=>({goalId:g.id,title:g.title,protectedStrict:guard.protectedStrictGoalIds.includes(g.id),wholeGoal:g}))
write('all112-native-one-edge-effective-and-full-chains.independent-b.actual.json',{schemaVersion:1,createdAtUTC:new Date().toISOString(),actualProductionHelpersExecuted:['prepareLandscapeEntries','loadGoalBookBuildInputs','validateCanonicalLandscape','compileCompositionView'],actualWholeCanonicalChangedFields:[{goalId:cluster,beforeRequires:(maps[1].get(cluster) as any).requires,afterRequires:changed[0].requires,allOtherFieldsExact:true}],all112,actualWholeGraphEffectiveRequiresDeltas:actualAllGraphEffectiveDeltas,protectedInheritedBroadBefore:beforeInherited,protectedInheritedBroadAfter:afterInherited,sixActualRenderedContextDeltasAgainstBaseline:realRenderedDeltas,nineProtectedContextReviewUnion:reviewUnion,all382WholeNativePagesExactAgainstV3:JSON.stringify(oldModel.pages)===JSON.stringify(model.pages),actualNativeCounts:{wholeGoals:485,pages:382,kinds:afterKind.counts},canonicalDiagnostics:diag,requiresContainsDags:dag,prospectiveHE8CompilerFindings:hecomp.findings,remainingUnprotectedDirectBroadConsumers:remaining,semanticKindSourceFingerprintDelta:kindDeltas,executedRuntimeFrontierTest:false,nativeGateRecordsAdded:0,activeWrites:0})
write('native-v4.actual-read-input-bindings.json',[...inputs.values()])
console.log(JSON.stringify({pages:382,wholeGoals:485,exactWholeGoalDelta:cluster,protected112WholeGoalsV3Exact:all112.filter((r:any)=>r.wholeGoalExactV3ToV4).length,inheritedBefore:beforeInherited,inheritedAfter:afterInherited,allGraphNativeEffectiveChangedIds:actualAllGraphEffectiveDeltas.map((r:any)=>r.goalId),sixRealContextIds:realRenderedDeltas,nineReviewUnion:reviewUnion,all382WholePagesV3Exact:JSON.stringify(oldModel.pages)===JSON.stringify(model.pages),remainingDirectHolds:remaining.map((r:any)=>r.goalId)}))
