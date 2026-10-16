// SPDX-License-Identifier: Apache-2.0
// In-memory stock data/context checks; no rendering, host copy or scientific vote.
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createRequire} from 'node:module'
const repo=process.cwd(),own=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const at=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const get=(p:string)=>JSON.parse(readFileSync(resolve(own,p),'utf8'))
const write=(p:string,x:any)=>writeFileSync(resolve(own,p),JSON.stringify(x,null,2)+'\n')
const hash=(b:any)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>({path:p,sha256:hash(readFileSync(resolve(repo,p))),bytes:readFileSync(resolve(repo,p)).length})
const sel=get('INPUTS.physical-exact-selector.json'),before=at(sel.baseCanonical.path),after=at(sel.canonical.path)
const bg=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])),ag=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]))
const book=await import(pathToFileURL(resolve(repo,'app/scripts/goalBookModel.ts')).href)
const {prepareLandscapeEntries}=await import(pathToFileURL(resolve(repo,'app/src/hooks/useLandscapes.ts')).href)
const {buildGoalDescriptionCanonicalContext}=await import(pathToFileURL(resolve(repo,'app/scripts/validateGoalDescriptionReviewCampaign.ts')).href)
const {fingerprintGoalDescriptionReviewContext}=await import(pathToFileURL(resolve(repo,'app/scripts/validateGoalDescriptionDualRoundResolution.ts')).href)
const {normalizeCanonicalLandscape,validateCanonicalLandscape}=await import(pathToFileURL(resolve(repo,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const original=at(sel.baseSemanticLedger.path),semantic=structuredClone(original)
semantic.sourceLandscapePath=sel.canonical.path
const fips=[]
for(const d of semantic.decisions){const old=d.sourceFingerprint,newFP=book.fingerprintSemanticKindSourceGoal(ag.get(d.goalId));
 if(old!==newFP){fips.push({goalId:d.goalId,before:old,after:newFP,semanticKindPreserved:d.semanticKind});d.sourceFingerprint=newFP}}
if(fips.length!==4)throw new Error('Expected exactly four real semantic source-fingerprint changes')
write('candidate/semantic554.same-classifications-four-source-fingerprints.author.json',semantic)
sel.semanticLedger=bind(sel.semanticLedger.path);write('INPUTS.physical-exact-selector.json',sel)
write('CAS.semantic-companion.four-real-source-bindings-no-new-decisions.json',{
 before:sel.baseSemanticLedger,after:sel.semanticLedger,sourceLandscapePathBefore:original.sourceLandscapePath,sourceLandscapePathAfter:semantic.sourceLandscapePath,
 changedSourceFingerprints:fips,classificationChanges:[],newDecisions:0,claim:'Mechanical rebinding of existing classifications to four actually changed source objects; not an independent atomicity or semantics approval.'})

const req=createRequire(resolve(repo,'app/package.json')),Ajv=req('ajv/dist/2020').default,formats=req('ajv-formats')
const ajv=new Ajv({allErrors:true,strict:false});formats(ajv)
const runtimeSchema='docs/landscape-runtime.schema.json',validate=ajv.compile(at(runtimeSchema))
const schemaOK=validate(after),schemaErrors=schemaOK?[]:structuredClone(validate.errors)
const diagnostics=validateCanonicalLandscape(normalizeCanonicalLandscape(after))
const directDag=(field:string)=>{const done=new Set<string>(),busy=new Set<string>();const visit=(id:string)=>{if(busy.has(id))throw new Error(field+' cycle '+id);if(done.has(id))return;busy.add(id);for(const d of ag.get(id)[field]??[])visit(d);busy.delete(id);done.add(id)};for(const id of ag.keys())visit(id);return true}
directDag('requires');directDag('contains')
if(!schemaOK||diagnostics.some((d:any)=>d.severity==='error'))throw new Error(JSON.stringify({schemaErrors,diagnostics}))
write('checks/CHECK.runtime-schema-stock-contains-and-direct-DAG.actual.json',{
 pass:true,sourceSchema:bind(runtimeSchema),stockCanonicalDiagnostics:diagnostics,directRequiresDAG:true,directContainsDAG:true,
 wholeGoals:554,curricularAtomic:semantic.counts.curricularAtomic,newSemanticClassifications:0})

const be=new Map<string,any>(prepareLandscapeEntries([before])[0].goals.map((g:any)=>[g.id,g])),ae=new Map<string,any>(prepareLandscapeEntries([after])[0].goals.map((g:any)=>[g.id,g]))
const closure=(id:string,map:Map<string,any>)=>{const seen=new Set<string>(),todo=[...(map.get(id)?.effectiveRequires??[])];while(todo.length){const d=todo.pop()!;if(seen.has(d))continue;seen.add(d);todo.push(...(map.get(d)?.effectiveRequires??[]),...(map.get(d)?.contains??[]))}return [...seen].sort()}
const effRows=[]
for(const id of bg.keys()){
 const br=[...(be.get(id)?.effectiveRequires??[])].sort(),ar=[...(ae.get(id)?.effectiveRequires??[])].sort(),bc=closure(id,be),ac=closure(id,ae)
 if(JSON.stringify(br)!==JSON.stringify(ar)||JSON.stringify(bc)!==JSON.stringify(ac))effRows.push({goalId:id,title:ag.get(id).title,
  effectiveRequiresBefore:br,effectiveRequiresAfter:ar,closureBefore:bc,closureAfter:ac,
  removedEffectiveRequires:br.filter((x:string)=>!ar.includes(x)),addedEffectiveRequires:ar.filter((x:string)=>!br.includes(x)),
  selfReachableBefore:bc.includes(id),selfReachableAfter:ac.includes(id)})
}
write('checks/CHECK.all554-actual-effective-requirements-before-after.json',{
 role:'Actual stock prepareLandscapeEntries inheritance plus requires/contains reachability; no mastery or gate write',
 affectedGoalCount:effRows.length,directEffectiveRequirementChanges:effRows.filter(r=>JSON.stringify(r.effectiveRequiresBefore)!==JSON.stringify(r.effectiveRequiresAfter)).length,
 selfReachableBefore:[...bg.keys()].filter(id=>closure(id,be).includes(id)),selfReachableAfter:[...ag.keys()].filter(id=>closure(id,ae).includes(id)),
 rows:effRows,newScienceVotes:0})

// Stock BookModel comparison in memory, with identical retained QA/image byte bindings.
const prep='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-source3-six-contexts-current422-native-preparation-root-20261015-v1'
const qaPath=prep+'/candidate/QA438.existing435-plus-three-unapproved-image-bindings.json',qa=at(qaPath)
const physical=at(prep+'/checks/REBUILD.prospective422-nine.physical-map.json')
const assetDigests=Object.fromEntries(physical.selectedCurrentAssetRows.map((r:any)=>['/'+r.normalPublicDestination.replace(/^app\/public\//,''),r.physicalRepositorySource.sha256]))
for(const r of qa.records){if(r.visualizationState==='available'&&!assetDigests[r.imageUrl])throw new Error('Missing exact retained asset digest '+r.goalId)}
const configPath='curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-book-full.config.json',cfg=at(configPath),view=at(cfg.compositionViewPath)
const beforeSemantic=structuredClone(original);beforeSemantic.sourceLandscapePath=sel.baseCanonical.path
const build=(land:any,ledger:any,path:string)=>book.buildGoalBookModel({landscape:land,compositionView:view,
 semanticKindLedger:ledger,goalVisualizationQa:qa,goalVisualizationAssetDigests:assetDigests,evidenceReviewSources:[],
 config:{...cfg,landscapePath:path,semanticKindLedgerPath:sel.semanticLedger.path,goalVisualizationQaPath:qaPath}})
const bm=build(before,beforeSemantic,sel.baseCanonical.path),am=build(after,semantic,sel.canonical.path)
const bp=new Map<string,any>(bm.pages.map((p:any)=>[p.goalId,p])),ap=new Map<string,any>(am.pages.map((p:any)=>[p.goalId,p]))
const input=(g:any,p:any)=>({goalId:g.id,goalFingerprint:p.goalFingerprint,pageFingerprint:p.pageFingerprint,
 currentTitleDe:g.title,currentTitleEn:g.titleEn,currentDescriptionDe:g.description,currentDescriptionEn:g.descriptionEn,
 canonicalContext:buildGoalDescriptionCanonicalContext(g),reviewContext:{page:p,evidenceProfile:null}})
const ids=get('source-context/current315.exact-goal-ids.bound.json').goalIds
const audit=ids.map((id:string)=>{
 const b=input(bg.get(id),bp.get(id)),a=input(ag.get(id),ap.get(id))
 const bfp=fingerprintGoalDescriptionReviewContext(b),afp=fingerprintGoalDescriptionReviewContext(a)
 return {goalId:id,goalFingerprintBefore:b.goalFingerprint,goalFingerprintAfter:a.goalFingerprint,
  pageFingerprintBefore:b.pageFingerprint,pageFingerprintAfter:a.pageFingerprint,
  reviewContextFingerprintBefore:bfp,reviewContextFingerprintAfter:afp,changed:bfp!==afp,
  ...(bfp!==afp?{wholeBeforeInput:b,wholeAfterInput:a}:{}),
  policy:bfp===afp?'Do not rereview unchanged context solely because this author packet exists.':'Actual changed native page/context requires fresh exact review/binding; preserve historical votes unchanged.'}
})
const canonicalRows=[...ag.keys()].map(id=>({goalId:id,before:hash(book.stableGoalBookJson(buildGoalDescriptionCanonicalContext(bg.get(id)))),after:hash(book.stableGoalBookJson(buildGoalDescriptionCanonicalContext(ag.get(id))))})).filter(r=>r.before!==r.after)
write('checks/CHECK.actual-stock-book315-context-fingerprint-radius.json',{
 role:'Actual unrendered stock BookModels; production context fingerprints on identical review surfaces, no native PDF or independent D vote',
 wholeCanonicalBefore:sel.baseCanonical,wholeCanonicalAfter:sel.canonical,
 comparisonConfig:bind(configPath),view:bind(cfg.compositionViewPath),retainedQA:bind(qaPath),
 retainedAssetBindingSource:bind(prep+'/checks/REBUILD.prospective422-nine.physical-map.json'),
 assetPolicy:'Exact sealed declared image-byte digests reused identically; this context audit is not a fresh visual or asset publication approval.',
 beforeBookPageCount:bm.pages.length,afterBookPageCount:am.pages.length,
 canonicalContextChangedGoalIds:canonicalRows.map(r=>r.goalId),canonicalContextChanges:canonicalRows,
 current315Count:ids.length,changed315Count:audit.filter(r=>r.changed).length,changed315GoalIds:audit.filter(r=>r.changed).map(r=>r.goalId),
 unchanged315Count:audit.filter(r=>!r.changed).length,records:audit,
 newStrictClosures:0,restoredBindings:0,newReviewVotes:0,
 limitation:'This measures the full canonical review-book surface in memory. Later exact native bundles must recompute their actual bound page/context bytes; no blanket reapproval or reuse of changed native pages is claimed.'})
console.log(JSON.stringify({runtimeSchema:'pass',goals:554,changedSemanticSourceBindings:fips.length,
 actualEffectiveChanged:effRows.length,selfReachableBefore:[...bg.keys()].filter(id=>closure(id,be).includes(id)).length,
 selfReachableAfter:[...ag.keys()].filter(id=>closure(id,ae).includes(id)).length,
 inMemoryBookPages:am.pages.length,current315ContextsChanged:audit.filter(r=>r.changed).length,
 changed315GoalIds:audit.filter(r=>r.changed).map(r=>r.goalId),newVotes:0}))
