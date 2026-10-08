import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import Ajv from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel.ts'
import {normalizeCanonicalLandscape,validateCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const repo=process.cwd()
const own=path.dirname(new URL(import.meta.url).pathname)
const author='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-b014-b477-four-ion-intentions-targeted-author-20261008-v4'
const read=async(p:string)=>JSON.parse(await fs.readFile(path.resolve(repo,p),'utf8'))
const assert=(x:unknown,s:string)=>{if(!x)throw Error(s)}
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b)
const digest=(b:Buffer|string)=>crypto.createHash('sha256').update(b).digest('hex')
const land=await read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const by=new Map<string,any>(land.goals.map((g:any)=>[g.id,g]))
const kind=await read('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
const kindBy=new Map<string,any>(kind.decisions.map((d:any)=>[d.goalId,d]))
const qa=await read('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
const qaBy=new Map<string,any>(qa.records.map((q:any)=>[q.goalId,q]))
const ajv=new Ajv({strict:true,allErrors:true});addFormats(ajv)
const validate=ajv.compile(await read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const retained=await read(author+'/retained-three-current-strict-P-records.exact.json')
const profiles=[]
for(const item of retained.records){
 const r=item.wholeRecord,g=by.get(r.goalId),k=kindBy.get(r.goalId),q=qaBy.get(r.goalId)
 assert(equal(g,item.wholeCurrentGoal),'Exact retained current goal '+r.goalId)
 assert(k.decisionStatus==='authoritative'&&k.sourceFingerprint===fingerprintSemanticKindSourceGoal(g),'Current semantic-kind fingerprint '+r.goalId)
 const canonicalDigest=digest(await fs.readFile(path.resolve(repo,q.canonicalAssetPath)))
 const publicDigest=digest(await fs.readFile(path.resolve(repo,q.publicAssetPath)))
 assert(canonicalDigest===publicDigest,'Image copy identity '+r.goalId)
 const closedSchema=validate(r)
 assert(closedSchema,'Closed native profile schema '+r.goalId+JSON.stringify(validate.errors))
 const errors=validatePositiveGoalEvidenceRecordSemantics(r,g,{[q.imageUrl]:'sha256:'+canonicalDigest},k.semanticKind)
 assert(errors.length===0,'Native profile semantic binding '+r.goalId+JSON.stringify(errors))
 const currentRows=(await fs.readFile(path.resolve(repo,item.reviewBinding.path),'utf8')).trim().split('\n').map(s=>JSON.parse(s))
 assert(currentRows.some((row:any)=>equal(row,r)),'Current exact profile record '+r.goalId)
 profiles.push({goalId:r.goalId,closedSchema,semanticErrors:errors,status:r.status,reviewAuthority:r.reviewAuthority,
  profileFingerprint:r.profileFingerprint,evidenceLevel:r.evidenceLevel,maximumClaimScope:r.maximumClaimScope,
  retainedAssetSha256:canonicalDigest,wholeGoalByteEquivalent:true,wholeRecordByteEquivalent:true,renewedHistoricalScienceVerdict:false})
}
const normalized=normalizeCanonicalLandscape(land)
const nativeFindings=validateCanonicalLandscape(normalized)
assert(!nativeFindings.some((f:any)=>f.severity==='error'),'Native canonical findings '+JSON.stringify(nativeFindings))
const graphs=[]
for(const field of ['contains','requires']){
 const entered=new Set<string>(),done=new Set<string>()
 const visit=(id:string)=>{assert(!entered.has(id),field+' cycle '+id);if(done.has(id))return;entered.add(id)
  for(const next of by.get(id)[field]??[]){assert(by.has(next),field+' missing '+next);visit(next)}entered.delete(id);done.add(id)}
 for(const id of by.keys())visit(id)
 graphs.push({field,nodeCount:done.size,cycles:0,missingReferences:0})
}
const union=['1c1420c2-a8e2-520f-8015-6df637a973bd','fd309753-4d48-5570-a4ec-09dfeb20ff9c','a44af1fa-5988-5b7d-b206-691c6bbf7dd4']
const inspected=[...union,'d2ccd1d5-56f7-583f-9724-e97441367f91','41396457-d97b-55f3-9804-2af1bb188e79','580b3616-f121-5d82-ac6b-fc24f145fbdc','9deeac6f-d380-52c5-8fc9-e532ab1f4d3f']
const scopes=[]
for(const name of ['de-bb-gk','de-bb-lk','de-be-gk','de-be-lk']){
 const viewPath='curricula/DE/Gymnasium/composition-views/chemie/'+name+'.view.json'
 const view=normalizeCompositionView(await read(viewPath))
 const compiled=compileCompositionView(view,normalized)
 assert(!compiled.findings.some((f:any)=>f.severity==='error'),'Current native view '+name+JSON.stringify(compiled.findings))
 const projection=collectCompositionProjectionRoleGoalIds(view.rootNodes,by)
 const goals=inspected.map(goalId=>({goalId,targetVisible:projection.targetGoalIds.has(goalId),prerequisiteOnly:projection.prerequisiteOnlyGoalIds.has(goalId),applicable:by.get(goalId).applicability.jurisdiction.includes(view.scope.jurisdiction),operativeSourceUnionMember:union.includes(goalId)}))
 assert(goals.filter(g=>g.operativeSourceUnionMember).every(g=>g.targetVisible&&g.applicable),'All current union members visible/applicable '+name)
 assert(!goals.find(g=>g.goalId.startsWith('9dee'))!.applicable,'9dee is not a BB/BE witness '+name)
 scopes.push({viewPath,scope:view.scope,nativeFindings:compiled.findings,goals,sourceUnionApplied:false})
}
const plan=await read(author+'/two-source-row-operative-current-scope-union-plan.pending-two-real-reviews.author-v4.json')
const original=await read(author+'/two-whole-BBBE-original-source-goals-decisions-and-edges.exact.json')
const mappings=[]
for(const r of plan.rows){
 const m=await read(r.mappingPath),orig=original.rows.find((s:any)=>s.sourceGoalId===r.sourceGoalId)
 assert(equal(r.candidateAfter,union),'Exact proposed union '+r.sourceGoalId)
 assert(equal(m.decisions[orig.decisionIndex],orig.wholeOriginalDecision),'Source mapping retained '+r.sourceGoalId)
 const extraction=await read(orig.sourceExtractionPath)
 assert(equal(extraction.sourceGoals.find((g:any)=>g.id===r.sourceGoalId),orig.wholeOriginalSourceGoal),'Whole source extraction retained '+r.sourceGoalId)
 mappings.push({sourceGoalId:r.sourceGoalId,wholeSourceIdentityUnchanged:true,wholeOriginalDecisionUnchanged:true,exactCandidateUnion:true,applied:false})
}
await fs.writeFile(path.join(own,'independent-b-native-current-P-scopes-DAG.actual.json'),JSON.stringify({reviewRole:'Independent B read-only native verification',actualExitCode:0,profiles,graphs,nativeFindings,scopes,mappings,newWholeGoalApprovals:0,newHistoricalScienceReviews:0,activeWrites:0,humanApproval:false},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({actualExitCode:0,retainedProfiles:profiles.length,actualScopes:scopes.length,graphs:graphs.length,mappingRows:mappings.length,activeWrites:0}))
