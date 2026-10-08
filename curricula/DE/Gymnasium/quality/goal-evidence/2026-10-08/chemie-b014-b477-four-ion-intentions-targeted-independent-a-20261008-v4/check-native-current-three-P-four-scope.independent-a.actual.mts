import fs from 'node:fs/promises'
import path from 'node:path'
import {createHash} from 'node:crypto'
import Ajv from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel.ts'
import {normalizeCanonicalLandscape,validateCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const repo=process.cwd(),own=path.relative(repo,path.dirname(new URL(import.meta.url).pathname)),author="curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-b014-b477-four-ion-intentions-targeted-author-20261008-v4"
const read=async(p:string)=>JSON.parse(await fs.readFile(path.join(repo,p),'utf8'))
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b)
const assert=(v:any,m:string)=>{if(!v)throw new Error(m)}
const retained=await read(author+'/retained-three-current-strict-P-records.exact.json')
const landscapePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const land=await read(landscapePath),by=new Map(land.goals.map((g:any)=>[g.id,g]))
const ledger=await read('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
const kindBy=new Map(ledger.decisions.map((d:any)=>[d.goalId,d]))
const qa=await read('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
const qaBy=new Map(qa.records.map((r:any)=>[r.goalId,r]))
const ajv=new Ajv({strict:true,allErrors:true});addFormats(ajv)
const validate=ajv.compile(await read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const pChecks=[]
for(const item of retained.records){
 const r=item.wholeRecord,g=by.get(r.goalId) as any,k=kindBy.get(r.goalId) as any,v=qaBy.get(r.goalId) as any
 assert(equal(g,item.wholeCurrentGoal),'Current whole goal changed '+r.goalId)
 assert(k.decisionStatus==='authoritative'&&k.sourceFingerprint===fingerprintSemanticKindSourceGoal(g),'Current classification '+r.goalId)
 const resourceDigest=sha(await fs.readFile(path.join(repo,v.canonicalAssetPath)))
 const publicDigest=sha(await fs.readFile(path.join(repo,v.publicAssetPath)))
 assert(resourceDigest===publicDigest,'Exact retained asset copies '+r.goalId)
 const schemaValid=validate(r),semanticErrors=validatePositiveGoalEvidenceRecordSemantics(r,g,{[v.imageUrl]:resourceDigest},k.semanticKind)
 assert(schemaValid,'Native closed P schema '+r.goalId+' '+JSON.stringify(validate.errors))
 assert(semanticErrors.length===0,'Native current P semantics '+r.goalId+' '+JSON.stringify(semanticErrors))
 const actualLedgerRows=(await fs.readFile(path.join(repo,item.reviewBinding.path),'utf8')).trim().split('\n').map(s=>JSON.parse(s))
 assert(actualLedgerRows.some((x:any)=>equal(x,r)),'Exact current whole P record '+r.goalId)
 pChecks.push({goalId:r.goalId,closedNativeSchemaValid:schemaValid,currentNativeSemanticErrors:semanticErrors,
  goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,
  canonicalAssetPath:v.canonicalAssetPath,publicAssetPath:v.publicAssetPath,exactRetainedAssetDigest:resourceDigest,
  status:r.status,reviewAuthority:r.reviewAuthority,evidenceLevel:r.evidenceLevel,maximumClaimScope:r.maximumClaimScope,
  freshScienceReview:false,newRecordOrProfile:false,newVisualReview:false})
}
const normalized=normalizeCanonicalLandscape(land),dag=validateCanonicalLandscape(normalized)
assert(dag.every((f:any)=>f.severity!=='error'),'Current native DAG '+JSON.stringify(dag))
const graphChecks=['contains','requires'].map(field=>{
 const visiting=new Set<string>(),done=new Set<string>()
 const visit=(id:string)=>{assert(!visiting.has(id),field+' cycle '+id);if(done.has(id))return;visiting.add(id)
  for(const next of (by.get(id) as any)[field]||[]){assert(by.has(next),field+' missing reference '+next);visit(next)}
  visiting.delete(id);done.add(id)}
 for(const id of by.keys())visit(id as string)
 return {field,nodes:done.size,cycles:0,missingReferences:0}
})
const witnessIds=['1c1420c2-a8e2-520f-8015-6df637a973bd','fd309753-4d48-5570-a4ec-09dfeb20ff9c','a44af1fa-5988-5b7d-b206-691c6bbf7dd4']
const sourcePlan=await read(author+'/two-source-row-operative-current-scope-union-plan.pending-two-real-reviews.author-v4.json')
assert(sourcePlan.rows.every((r:any)=>equal(r.candidateAfter,witnessIds)),'Concrete operative union matches current-scope check')
const scopeChecks=[]
for(const name of ['de-bb-gk.view.json','de-bb-lk.view.json','de-be-gk.view.json','de-be-lk.view.json']){
 const originalPath='curricula/DE/Gymnasium/composition-views/chemie/'+name
 const view=normalizeCompositionView(await read(originalPath)),compiled=compileCompositionView(view,normalized)
 assert(compiled.findings.every((f:any)=>f.severity!=='error'),'Actual current native view '+originalPath)
 const projection=collectCompositionProjectionRoleGoalIds(view.rootNodes,by as any)
 const witnesses=witnessIds.map(id=>({goalId:id,currentTargetVisible:projection.targetGoalIds.has(id),currentPrerequisiteOnly:projection.prerequisiteOnlyGoalIds.has(id),
  actualBBBEApplicability:(by.get(id) as any).applicability.jurisdiction.includes(view.scope.jurisdiction)}))
 const supplementaryRetainedGoals=['d2ccd1d5-56f7-583f-9724-e97441367f91','41396457-d97b-55f3-9804-2af1bb188e79'].map(id=>({goalId:id,
  currentTargetVisible:projection.targetGoalIds.has(id),currentPrerequisiteOnly:projection.prerequisiteOnlyGoalIds.has(id),
  actualBBBEApplicability:(by.get(id) as any).applicability.jurisdiction.includes(view.scope.jurisdiction),
  operativeSourceRole:false,retainedScienceOrPrerequisiteKnowledgeOnly:true}))
 assert(witnesses.every(w=>w.currentTargetVisible&&w.actualBBBEApplicability),'Current four-scope witness target '+name+' '+JSON.stringify(witnesses))
 scopeChecks.push({viewPath:originalPath,viewId:view.viewId,scope:view.scope,currentNativeFindings:compiled.findings,witnesses,supplementaryRetainedGoals,
  candidateSourceUnionApplied:false,visibilityChanged:false,newGoalTarget:false})
}
await fs.writeFile(path.join(repo,own,'independent-a-current-retained-P-three-and-four-BBBE-scopes.actual.json'),JSON.stringify({
 role:'Independent A actual native current retained P schema/semantics, existing DAG and four BB/BE composition views; original author verdict not reused as A',
 actualTerminalExitCode:0,pChecks,currentDagFindings:dag,graphChecks,scopeChecks,newWholeGoalApprovals:0,newSourceRoleApprovals:0,
 candidateSourceUnionNativePostintegrationChecksStillRequired:true,activeWrites:0,humanApproval:false
},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({actualExitCode:0,currentRetainedPClosedSchemaSemantic:3,currentNativeScopes:4,currentNativeDAG:true,
 unchangedWitnessTargetsPerScope:witnessIds.length,newWholeGoalOrSourceApprovals:0}))
