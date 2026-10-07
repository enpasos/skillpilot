// SPDX-License-Identifier: Apache-2.0
// Targeted independent production-helper reproduction. Writes only this QA package.
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,join,dirname,relative} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../../../../../..')
const author=join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-seven-native-source-preparation-author-v3')
const bindings=new Map<string,unknown>()
const bind=(p:string)=>({path:relative(root,p),sha256:createHash('sha256').update(readFileSync(p)).digest('hex'),bytes:readFileSync(p).length})
const read=(p:string)=>{bindings.set(p,bind(p));return JSON.parse(readFileSync(p,'utf8'))}
const write=(name:string,v:unknown)=>writeFileSync(join(here,name),JSON.stringify(v,null,2)+'\n')
const imp=async(p:string)=>{bindings.set(join(root,p),bind(join(root,p)));return import(pathToFileURL(join(root,p)).href)}
const {prepareLandscapeEntries}=await imp('app/src/hooks/useLandscapes.ts')
const {loadGoalBookBuildInputs}=await imp('app/scripts/goalBookModel.ts')
const {normalizeCanonicalLandscape,validateCanonicalLandscape}=await imp('app/src/utils/authoring/canonicalAuthoring.ts')
const {compileCompositionView}=await imp('app/src/utils/authoring/compositionViewAuthoring.ts')
const guard=read(join(author,'current378-and-protected112-author-input-guard.actual.json'))
const canonPaths=[join(root,guard.baselineActiveCanon.path),join(author,'qa-artifacts/DE_DEU_S_GYM_CANONICAL_CHEMIE.native-author-candidate.json'),join(author,'qa-artifacts/DE_DEU_S_GYM_CANONICAL_CHEMIE.four-route-proposals.author-candidate.json')]
const raw=canonPaths.map(read)
const entries=raw.map(v=>prepareLandscapeEntries([v])[0].goals)
const maps=raw.map(v=>new Map(v.goals.map((g:any)=>[g.id,g])))
const effective=entries.map(v=>new Map(v.map((g:any)=>[g.id,g])))
const parents=raw.map(v=>{const m=new Map<string,string[]>();for(const g of v.goals)for(const ref of g.contains??[]){const id=ref.includes(':')?ref.split(':').at(-1):ref;m.set(id,[...(m.get(id)??[]),g.id])}return m})
const broad=['7be6f951-a614-52dc-94d3-2ce0d33765ff','53fd1bfd-facb-54ae-b2dc-f667ed1414fc']
const chain=(id:string,index:number,path:string[]=[]):any[]=>{if(path.includes(id))throw Error('contains cycle');return (parents[index].get(id)??[]).flatMap(pid=>{const p:any=maps[index].get(pid);const row={goalId:pid,title:p.title,directRequires:p.requires,containsChild:id};return [{chainFromGoalToAncestor:[id,pid],ancestors:[row]},...chain(pid,index,[...path,id]).map(c=>({chainFromGoalToAncestor:[id,...c.chainFromGoalToAncestor],ancestors:[row,...c.ancestors]}))]})}
const sorted=(v:string[])=>[...v].sort().join(',')
const stripPagination=(v:any):any=>Array.isArray(v)?v.map(stripPagination):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>!['pageNumber','navigationOrder','treeOrder','pageFingerprint'].includes(k)).map(([k,x])=>[k,stripPagination(x)])):v
const models=[]
for(const name of ['baseline','candidate','four-route-proposals']){
 const configPath=join(author,`qa-artifacts/${name}-native-book.config.json`),config=read(configPath)
 for(const key of ['landscapePath','compositionViewPath','semanticKindLedgerPath','goalVisualizationQaPath']) read(join(root,config[key]))
 const loaded=await loadGoalBookBuildInputs(relative(root,configPath),root)
 models.push(loaded.model)
 write(`${name}-native-pure-book-model.independent-b.actual.json`,loaded.model)
}
const pages=models.map(m=>new Map(m.pages.map((p:any)=>[p.goalId,p])))
const all112=guard.protectedStrictGoalIds.map((id:string)=>{
 const original:any=maps[0].get(id),base:any=maps[1].get(id),variant:any=maps[2].get(id)
 const states=effective.map(m=>m.get(id) as any)
 const nativePages=pages.map(m=>m.get(id) as any)
 return {goalId:id,title:original.title,directRequires:{baseline:states[0].requires,baseCandidate:states[1].requires,fourRouteVariant:states[2].requires},effectiveRequires:{baseline:states[0].effectiveRequires,baseCandidate:states[1].effectiveRequires,fourRouteVariant:states[2].effectiveRequires},inheritedRequires:{baseline:states[0].inheritedRequires,baseCandidate:states[1].inheritedRequires,fourRouteVariant:states[2].inheritedRequires},effectiveRequiresSetChangedInBase:sorted(states[0].effectiveRequires)!==sorted(states[1].effectiveRequires),effectiveRequiresSetChangedInFourRouteVariant:sorted(states[0].effectiveRequires)!==sorted(states[2].effectiveRequires),baseWholeGoalExact:JSON.stringify(original)===JSON.stringify(base),variantWholeGoalExact:JSON.stringify(original)===JSON.stringify(variant),baseGoalFingerprintExact:nativePages[0].goalFingerprint===nativePages[1].goalFingerprint,variantGoalFingerprintExact:nativePages[0].goalFingerprint===nativePages[2].goalFingerprint,basePageFingerprintExact:nativePages[0].pageFingerprint===nativePages[1].pageFingerprint,variantPageFingerprintExact:nativePages[0].pageFingerprint===nativePages[2].pageFingerprint,basePageContentIgnoringPaginationExact:JSON.stringify(stripPagination(nativePages[0]))===JSON.stringify(stripPagination(nativePages[1])),variantPageContentIgnoringPaginationExact:JSON.stringify(stripPagination(nativePages[0]))===JSON.stringify(stripPagination(nativePages[2])),effectiveSplitParentsInVariant:states[2].effectiveRequires.filter((r:string)=>broad.includes(r)),allNativeContainsAncestorChainsInVariant:chain(id,2)}
})
const reached=entries[2].filter((g:any)=>g.effectiveRequires.some((r:string)=>broad.includes(r))).map((g:any)=>({goalId:g.id,title:g.title,protectedStrict:guard.protectedStrictGoalIds.includes(g.id),directRequires:g.requires,effectiveRequires:g.effectiveRequires,inheritedRequires:g.inheritedRequires,directBroadPrerequisites:g.requires.filter((r:string)=>broad.includes(r)),ancestorChains:chain(g.id,2).filter(c=>c.ancestors.some((a:any)=>a.directRequires.some((r:string)=>broad.includes(r))))}))
const broadParents=broad.map(id=>{const g:any=maps[2].get(id);return {goalId:id,title:g.title,children:g.contains.map((cid:string)=>{const c:any=maps[2].get(cid);return{goalId:cid,title:c.title,core:c.core,tags:c.tags,isCoreForPrereqsAccordingToActualBackend:!c.tags?.length||c.tags.includes('GK')}})}})
const dags=raw.map(v=>{
 const m=new Map(v.goals.map((g:any)=>[g.id,g]));const result:any={}
 for(const field of ['requires','contains']){const visiting=new Set(),done=new Set();const walk=(id:string)=>{if(visiting.has(id))throw Error(field+' cycle '+id);if(done.has(id))return;visiting.add(id);const g:any=m.get(id);for(const ref of g[field]??[]){const local=ref.includes(':')?ref.split(':').at(-1):ref;if(!m.has(local))throw Error('missing '+ref);walk(local)}visiting.delete(id);done.add(id)};for(const id of m.keys())walk(id as string);result[field+'Dag']=true}
 return result
})
write('all112-native-effective-requires-and-exact-contexts.independent-b.actual.json',{schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'independent B actual unchanged native helper, all112 complete effective requires and inherited ancestor chains',nativeHelper:'prepareLandscapeEntries',all112,protected112Count:all112.length,baseEffectiveRequiresSetChangedGoalIds:all112.filter((r:any)=>r.effectiveRequiresSetChangedInBase).map((r:any)=>r.goalId),fourRouteVariantEffectiveRequiresSetChangedGoalIds:all112.filter((r:any)=>r.effectiveRequiresSetChangedInFourRouteVariant).map((r:any)=>r.goalId),baseRealPageContextChangedGoalIds:all112.filter((r:any)=>!r.basePageContentIgnoringPaginationExact).map((r:any)=>r.goalId),variantRealPageContextChangedGoalIds:all112.filter((r:any)=>!r.variantPageContentIgnoringPaginationExact).map((r:any)=>r.goalId),allVariantGoalsReachedBySplitParents:reached,splitParentsAndActualBackendSelectedChildObligations:broadParents,actualPages:models.map(m=>m.pages.length),canonicalDiagnostics:raw.map(v=>validateCanonicalLandscape(normalizeCanonicalLandscape(v))),dags,activeWrites:0,runtimeFrontierTestExecuted:false,scopeQualifier:'Actual structural requires and pure BookModel only. Backend composition may ignore an inherited prerequisite explicitly omitted from both target and prerequisiteOnly; no universal runtime blocker is claimed.'})
const kinds=[read(join(root,guard.baselineKinds.path)),read(join(author,'qa-artifacts/chemie.semantic-kinds.native-author-candidate.json'))]
const attach=(v:any,l:any)=>{const m=new Map(l.decisions.map((r:any)=>[r.goalId,r.semanticKind]));return normalizeCanonicalLandscape({...v,goals:v.goals.map((g:any)=>({...g,semanticKind:m.get(g.id)}))})}
const landscapes=[attach(raw[0],kinds[0]),attach(raw[1],kinds[1])]
const manifest=read(join(root,'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json')),affected=[]
for(const path of manifest.sourcePaths){const view=read(join(root,path));const refs:any[]=[];const visit=(nodes:any[])=>{for(const n of nodes){if(broad.includes(n.goalId))refs.push({kind:n.kind,goalId:n.goalId,projectionRole:n.projectionRole??'target'});if(n.children)visit(n.children)}};visit(view.rootNodes);if(!refs.length)continue;const before=compileCompositionView(view,landscapes[0]),after=compileCompositionView(view,landscapes[1]);affected.push({path,viewId:view.viewId,scope:view.scope,refs,beforeFindings:before.findings,afterFindings:after.findings,convertedBroadClusterGoalEntryErrors:after.findings.filter((f:any)=>f.code==='CPV-009'&&broad.includes(f.goalId))})}
const heview=read(join(author,'qa-artifacts/he8-seven-routines.prospective-source.view.json')),hecomp=compileCompositionView(heview,landscapes[1])
write('source40-native-compile-and-prospective-he8.independent-b.actual.json',{schemaVersion:1,createdAtUTC:new Date().toISOString(),configuredSourceViews:manifest.sourcePaths.length,affectedSourceViews:affected.length,convertedBroadClusterGoalEntryErrors:affected.reduce((n,v)=>n+v.convertedBroadClusterGoalEntryErrors.length,0),affectedViews:affected,prospectiveHE8CompilerFindings:hecomp.findings,wholeNationalSourceCoverageClaim:false,source403HoldsRemainOpen:true,activeWrites:0})
bindings.set(join(root,'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java'),bind(join(root,'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java')))
write('native-probe.actual-read-input-bindings.json',[...bindings.values()])
console.log(JSON.stringify({pages:models.map(m=>m.pages.length),protected112:all112.length,baseRealContextIds:all112.filter((r:any)=>!r.basePageContentIgnoringPaginationExact).map((r:any)=>r.goalId),variantRealContextIds:all112.filter((r:any)=>!r.variantPageContentIgnoringPaginationExact).map((r:any)=>r.goalId),protectedStillBroad:reached.filter((r:any)=>r.protectedStrict).map((r:any)=>r.goalId),allStillBroad:reached.map((r:any)=>r.goalId),sourceViews:affected.length,CPV009:affected.reduce((n,v)=>n+v.convertedBroadClusterGoalEntryErrors.length,0),heFindings:hecomp.findings}))
