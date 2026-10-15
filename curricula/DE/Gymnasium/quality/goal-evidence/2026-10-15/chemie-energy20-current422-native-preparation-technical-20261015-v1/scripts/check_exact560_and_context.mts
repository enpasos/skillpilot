// SPDX-License-Identifier: Apache-2.0
// Unchanged stock helpers; mechanical transport/context check, no scientific vote.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve,relative,dirname} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
const root=process.cwd(),own=resolve(dirname(fileURLToPath(import.meta.url)),'..'),rel=relative(root,own)
assert.ok(!existsSync(resolve(own,'FILES.finite-native-preparation.seal.json')))
const at=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8')),get=(p:string)=>JSON.parse(readFileSync(resolve(own,p),'utf8'))
const hash=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>({path:p,sha256:hash(readFileSync(resolve(root,p))),bytes:readFileSync(resolve(root,p)).length})
const write=(p:string,d:any)=>writeFileSync(resolve(own,p),JSON.stringify(d,null,2)+'\n')
const book=await import(pathToFileURL(resolve(root,'app/scripts/goalBookModel.ts')).href)
const profileHelper=await import(pathToFileURL(resolve(root,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const {buildGoalDescriptionCanonicalContext}=await import(pathToFileURL(resolve(root,'app/scripts/validateGoalDescriptionReviewCampaign.ts')).href)
const {fingerprintGoalDescriptionReviewContext}=await import(pathToFileURL(resolve(root,'app/scripts/validateGoalDescriptionDualRoundResolution.ts')).href)
const sel=get('INPUTS.exact-original-materials-and-560-basis.json'),before=at(sel.before560.path),after=get('candidate/canonical560.current422.five-sealed-author-CAS.exact.json')
const B=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])),A=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]))
const sem=at(sel.beforeSemantic560.path),oldSem=structuredClone(sem),changes:any[]=[]
for(const d of sem.decisions){const fp=book.fingerprintSemanticKindSourceGoal(A.get(d.goalId));if(fp!==d.sourceFingerprint){changes.push({goalId:d.goalId,before:d.sourceFingerprint,after:fp});d.sourceFingerprint=fp}}
assert.equal(changes.length,4);assert.equal(sem.counts.curricularAtomic,422);assert.equal(sem.counts.total,560)
write('candidate/semantic560.same-decisions-four-source-bindings.json',sem)
write('checks/SEMANTIC.four-source-bindings-only.actual.json',{pass:true,changes,allDecisionsKindsAndOtherFieldsExact:true,newVotes:0,counts:sem.counts})
const mapping=get('checks/REBUILD.native560.map.pending-semantic.json')
for(const a of mapping.aliases)a.physicalRepositorySource=bind(a.physicalRepositorySource.path)
for(const m of mapping.stockPhysicalModules)assert.deepEqual(bind(m.path),m)
write('checks/REBUILD.current422-native560.physical-map.json',mapping)
const digests:Record<string,string>={};for(const a of mapping.selectedCurrentAssetRows)digests['/'+a.normalPublicDestination.replace(/^app\/public\//,'')]=a.physicalRepositorySource.sha256
const profiles=readFileSync(resolve(root,sel.rawProfiles20E0G0.path),'utf8').trim().split('\n').map(l=>JSON.parse(l))
const rows=profiles.map((r:any)=>({goalId:r.goalId,evidenceLevel:r.evidenceLevel,maximumClaimScope:r.maximumClaimScope,errors:profileHelper.validatePositiveGoalEvidenceRecordSemantics(r,A.get(r.goalId),digests,'curricularAtomic')}))
assert.ok(rows.every((r:any)=>r.errors.length===0&&r.evidenceLevel==='E0'&&r.maximumClaimScope==='G0'))
assert.deepEqual(profiles.map((r:any)=>r.goalId),sel.scopeGoalIds)
write('checks/PROFILE20.original-bytes-production-helper-on560.actual.json',{pass:true,originalProfiles:sel.rawProfiles20E0G0,originalAuthorSelector:sel.sealedAuthorSelector,results:rows,profileFieldsEdited:0,newVotes:0})
const cfg=get('config/whole422.normal-stock-base.config.json'),view=at(cfg.compositionViewPath),qa=at(sel.QA438.path)
const oldQA=at(at(sel.sealedAuthorSelector.path).QA1WholeCAS.path)
const beforeQa=structuredClone(qa);beforeQa.records=beforeQa.records.map((r:any)=>r.goalId===oldQA.wholeBeforeRow.goalId?oldQA.wholeBeforeRow:r)
const build=(land:any,ledger:any,q:any)=>book.buildGoalBookModel({landscape:land,compositionView:view,semanticKindLedger:ledger,goalVisualizationQa:q,goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config:{...cfg,evidenceReviewPaths:[]}})
const bm=build(before,oldSem,beforeQa),am=build(after,sem,qa)
assert.equal(bm.pages.length,422);assert.equal(am.pages.length,422)
const bp=new Map<string,any>(bm.pages.map((p:any)=>[p.goalId,p])),ap=new Map<string,any>(am.pages.map((p:any)=>[p.goalId,p]))
const wrap=(g:any,p:any)=>({goalId:g.id,goalFingerprint:p.goalFingerprint,pageFingerprint:p.pageFingerprint,currentTitleDe:g.title,currentTitleEn:g.titleEn,currentDescriptionDe:g.description,currentDescriptionEn:g.descriptionEn,canonicalContext:buildGoalDescriptionCanonicalContext(g),reviewContext:{page:p,evidenceProfile:null}})
const strict=at(sel.baseline321.path).subjects[0].strictCompleteGoalIds
assert.equal(strict.length,321)
const radius=strict.map((id:string)=>{const b=fingerprintGoalDescriptionReviewContext(wrap(B.get(id),bp.get(id))),a=fingerprintGoalDescriptionReviewContext(wrap(A.get(id),ap.get(id)));return {goalId:id,before:b,after:a,changed:a!==b}})
assert.ok(radius.every((r:any)=>!r.changed))
write('checks/BOOK321.isolated-before560-after560-identical-P-selection.actual.json',{pass:true,role:'Actual stock BookModel and native context fingerprint calculation; before560 vs after560 only, no global review/Central',beforeCanonical:sel.before560,afterCanonical:bind(rel+'/candidate/canonical560.current422.five-sealed-author-CAS.exact.json'),beforeSemantic:sel.beforeSemantic560,afterSemantic:bind(rel+'/candidate/semantic560.same-decisions-four-source-bindings.json'),samePSelectionBeforeAndAfter:[],PSelectionRationale:'Isolated context-radius comparison has no P sources on either side. Actual Native20 below loads exactly20 original unreviewed E0/G0 profiles. No historical P13 science selected or rebound; 48115 remains separate.',samePSelectionIsScientificApproval:false,beforePageCount:bm.pages.length,afterPageCount:am.pages.length,baseline321:sel.baseline321,changed321Ids:[],unchanged321:321,records:radius,newVotes:0})
console.log(JSON.stringify({whole560:true,ordinary422:true,fiveCAS:true,semanticSourceBindings:changes.length,originalE0G0Profiles:rows.length,unchanged321Contexts:radius.length,changed321Contexts:0,newVotes:0}))
