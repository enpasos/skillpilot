import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import assert from 'node:assert/strict'
import {stableGoalBookJson} from '/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule/app/scripts/goalBookModel.ts'
import {buildGoalDescriptionCanonicalContext} from '/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule/app/scripts/validateGoalDescriptionReviewCampaign.ts'
const E='/mnt/e/skillpilot-chemie-L7-20261017',O=dirname(fileURLToPath(import.meta.url)),A=resolve(E,'current650-all-seven-current439-native-central-preparation-technical-a-v1'),F=resolve(A,'capsule'),B=resolve(E,'current650-selected-description-binding-field-diagnostic-technical-b-v1/FOLLOWUP.current-model-and-index-scoped-withdrawals-v1')
const read=(p:string):any=>JSON.parse(readFileSync(p,'utf8')),hash=(b:any)=>createHash('sha256').update(b).digest('hex'),pin=(p:string)=>{const b=readFileSync(p);return {path:p,sha256:hash(b),bytes:b.length}},eq=(a:any,b:any)=>stableGoalBookJson(a??null)===stableGoalBookJson(b??null)
const writes=(name:string,obj:any)=>{const p=resolve(O,name);assert(!existsSync(p));const s=JSON.stringify(obj,null,2)+'\n';JSON.parse(s);writeFileSync(p,s)}
function diff(a:any,b:any,p=''):any[]{if(eq(a,b))return [];if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b))return [...new Set([...Object.keys(a),...Object.keys(b)])].sort().flatMap(k=>diff(a[k],b[k],p?p+'.'+k:k));return [{field:p,before:a??null,current:b??null}]}
const selectorPath=resolve(B,'SELECTOR.additive-current-model-page-diff-and-withdrawal-successors.sealed.json');assert.equal(pin(selectorPath).sha256,'692d117a4378f80b41515369551e14f941f3439f08c97a52467ddd2329219861')
const selector=read(selectorPath),dp=selector.wholeCurrent403AndUnresolved36Diagnostic;assert.equal(pin(dp.path).sha256,dp.sha256)
const d=read(dp.path),model=read(d.currentModel.path);assert.equal(pin(d.currentModel.path).sha256,'a04d8156aaa9140a3498e83c71af113cc5a9faf47b3cfe2fbbcebde0a27aa26b')
const configRoot='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current650-all-seven-current439-native-central-preparation-technical-a-v1'
const basePath=configRoot+'/base.full439.current-all-seven-HB7f.private.config.json',base=read(resolve(F,basePath)),land=read(resolve(F,base.landscapePath)),goals=new Map(land.goals.map((g:any)=>[g.id,g]))
const PPath=resolve(F,base.evidenceReviewPaths[0]),profiles=new Map(readFileSync(PPath,'utf8').split(/\r?\n/).filter(Boolean).map(s=>{const p=JSON.parse(s);return[p.goalId,p]}))
const reportPath=resolve(A,'central-diagnostic-additive-v1/central.stock.stdout.json'),central=read(reportPath);assert.equal(central.blockingIssueCount,283)
const issues=central.subjects.find((s:any)=>s.subject==='chemie').issues
const exclude6=['9b56d01e-c2d7-51d8-b78e-237592c1ed20','6966df95-f125-5ecc-af8e-0442545d9f17','f0f67a7a-b06a-50b9-8edc-1f2a0d97520d','17ab1148-7383-5cab-8b91-73aff795f1e4','93b914d4-747d-5b22-90ff-ac6320514b44','e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f']
const excluded36=d.unresolvedOwnerRows.map((r:any)=>r.goalId);assert.equal(excluded36.length,36)
const positions=new Map(model.pages.map((p:any,i:number)=>[p.goalId,i]));assert.equal(positions.size,439)
const topoViolations=land.goals.flatMap((g:any)=>positions.has(g.id)?(g.requires??[]).filter((r:string)=>positions.has(r)&&positions.get(r)>=positions.get(g.id)).map((r:string)=>({goalId:g.id,prerequisiteId:r})):[]);assert.equal(topoViolations.length,0)
const pool:any[]=[]
for(const row of d.selectedRows){
 if(exclude6.includes(row.goalId)||excluded36.includes(row.goalId))continue
 if(!eq(row.canonicalContextDifferences.map((r:any)=>r.field),['applicability.jurisdiction'])||row.finalTextDifferences.length||(row.oldPProfilePresent&&row.PProfileDifferences.length)||row.assetChanged)continue
 const idx=read(resolve(F,row.ownerIndexPath)),issue='chemie:'+idx.artifactSetId+': '+row.goalId+': Current V3 context for '+row.goalId+' disagrees with the canonical goal'
 if(!issues.includes(issue))continue
 pool.push({goalId:row.goalId,titleDe:row.titleDe,full439Position:positions.get(row.goalId),ownerIndexPath:row.ownerIndexPath,exactOpenCentralIssue:issue,canonicalContextDifferences:row.canonicalContextDifferences,oldPProfilePresent:row.oldPProfilePresent,oldPNullIsNotSubstantivePChange:!row.oldPProfilePresent})
}
pool.sort((a,b)=>a.full439Position-b.full439Position);assert(pool.length>20)
const selected=pool.slice(0,20),sourcePins:any[]=[],assetPins:any[]=[],checks:any[]=[]
const oldQa=read(resolve(F,'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'))
for(const row of selected){
 const idxPath=resolve(F,row.ownerIndexPath),idx=read(idxPath),entry=idx.resolutions.find((e:any)=>e.goalId===row.goalId),group=idx.groups.find((g:any)=>g.groupId===entry.groupId),root=resolve(dirname(idxPath),group.artifactDirectory??group.groupId)
 const firstPath=resolve(root,'round-a/description-review-input.json'),secondPath=resolve(root,'round-b/description-review-input.json'),a=read(firstPath).goals.find((g:any)=>g.goalId===row.goalId),b=read(secondPath).goals.find((g:any)=>g.goalId===row.goalId),goal:any=goals.get(row.goalId),p:any=profiles.get(row.goalId)
 assert(eq(a,b));const context=buildGoalDescriptionCanonicalContext(goal),dc=diff(a.canonicalContext,context);assert(eq(dc.map((d:any)=>d.field),['applicability.jurisdiction']))
 assert(eq(a.canonicalContext.requires,goal.requires??[]))
 const resolutionPath=resolve(dirname(idxPath),entry.resolutionPath),res=read(resolutionPath)
 assert(eq(res.goal.finalText,{titleDe:goal.title,titleEn:goal.titleEn,descriptionDe:goal.description,descriptionEn:goal.descriptionEn}))
 const oldP=a.reviewContext.evidenceProfile?.profile??null;assert(!oldP||eq(oldP,p.profile))
 const vis=a.reviewContext.page.visualization,qa=oldQa.records.find((q:any)=>q.goalId===row.goalId);assert(vis)
 const pub=pin(resolve(F,'app/public'+vis.url)),can=pin(resolve(F,qa.canonicalAssetPath));assert.equal('sha256:'+pub.sha256,vis.originalDigest);assert.equal(pub.sha256,can.sha256)
 sourcePins.push(pin(idxPath),pin(resolutionPath),pin(firstPath),pin(secondPath));assetPins.push(pub,can)
 checks.push({...row,actualCurrentCanonicalContext:context,oldCanonicalContext:a.canonicalContext,actualWholeEmbeddedPUnchanged:oldP?eq(oldP,p.profile):null,oldPNullAnnotated:!oldP,DEENUnchanged:true,requiresUnchanged:true,assetBytesUnchanged:true,indexPin:pin(idxPath),resolutionPin:pin(resolutionPath),roundInputPins:[pin(firstPath),pin(secondPath)]})
}
const qaPath=resolve(E,'9b-current-angle-image-targeted-root-review-v1/chemie.qa.stock-order-current-angle-image-revalidation.candidate.json');assert.equal(pin(qaPath).sha256,'bc2e35e0db01b675e1e1ab13f29e1819f40a715a17a5a96763dffd5848fb780f')
const result={schemaVersion:1,role:'Technical selection only; current open context issues intersect unique selected owners and pure raw jurisdiction differences',atUTC:new Date().toISOString(),sourceRoot:F,sourceSelector:pin(selectorPath),sourceDiagnostic:pin(dp.path),actualCentralReport:pin(reportPath),currentModel:pin(d.currentModel.path),currentModelDigest:model.digest,baseConfigPath:basePath,baseConfigPin:pin(resolve(F,basePath)),canonicalPin:pin(resolve(F,base.landscapePath)),P439Pin:pin(PPath),SEMPin:pin(resolve(F,base.semanticKindLedgerPath)),QARequiredPin:pin(qaPath),full439TopoViolations:topoViolations,
 poolCount:pool.length,poolHistoricalPNullCount:pool.filter(r=>!r.oldPProfilePresent).length,selectedCount:selected.length,selectedHistoricalPNullCount:selected.filter(r=>!r.oldPProfilePresent).length,selectionStrategy:'First20 of actual larger pure-jurisdiction issue pool, ordered by exact full439 topological model pages',excludedNative6:exclude6,excludedAll36NewerOwners:excluded36,pool,selectedGoalIds:selected.map(r=>r.goalId),selected:checks,remainingPool:pool.slice(20),observedOriginalSourcePins:[...new Map(sourcePins.map(p=>[p.path,p])).values()],actualAssetPins:assetPins,
 ownershipPlan:'Archive exact old15 configs and ledger. In this new capsule alone, remove selected20 IDs only from old unmaterialized claim scopes; keep all other object fields and remaining ID order exact; register nonempty rest configs, explicitly retire only empty active references with exact history; append new20 config. Do not overwrite parallel6, whose union requires separate whole-ledger CAS and union removal from shared old configs.',
 limitations:['Historical P=null is annotated, not treated as substantive P change.','Page/navigation/global bindings need fresh current native evidence; historical science is retained.','Input model a04d is not modified. Stock prepare uses mandatory in-memory base loading with exact updated QA bc2e; any resulting source-QA digest change is recorded.'],newScienceVotes:0,reviewResultPredetermined:false,applied:false}
writes('SELECTION.actual-open-pure-jurisdiction-first20-and-ownership-plan.json',result)
console.log(JSON.stringify({pool:pool.length,poolHistoricalPNull:result.poolHistoricalPNullCount,selected20:result.selectedGoalIds,sourceFields:['applicability.jurisdiction'],selectedExistingPUnchanged:20,actualSourceChecks:checks.length,assetChecks:assetPins.length,topoViolations:0},null,2))
