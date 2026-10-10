import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {buildApplicabilityCompilation} from './native-capsule/app/scripts/applicabilityCompiler'
import {normalizeCanonicalLandscape,buildCanonicalGraphIndex,validateCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const out=dirname(fileURLToPath(import.meta.url)),root=resolve(out,'../../../../../../..')
const read=(p:string)=>JSON.parse(readFileSync(resolve(out,p),'utf8'))
const write=(p:string,o:unknown)=>writeFileSync(resolve(out,p),JSON.stringify(o,null,2)+'\n')
const hash=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const land='605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
const canpath='canonical-candidate/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const ids=read('actual-deterministic-new-IDs-and-authoring-contracts.AUTHOR-INERT.json').ids
const local=ids['local-market-practice']
const oldids=['273809d9-bc31-5c1b-8a58-149dd61d2ba0','e3fd58d1-f16a-523c-ad64-7c0b3be5e366','a2fa1186-df35-5954-a9a9-e311a55e218f','df17fd21-e9b7-598f-970e-8f541d059694','67204661-44f9-54d4-b901-6271c9d5ff86','bac0f1d3-e671-5c2b-bd6d-2947f1fe6d9b']
const appOnlyDerivedIDs=['aa37a896-e8c0-59b9-840b-0711d2b497e2','c49497e8-a139-5bfb-8a47-39aa72d8cbf3']
const selected=[...Object.values(ids),...oldids,...appOnlyDerivedIDs] as string[]
const app=buildApplicabilityCompilation().reports.find(x=>x.landscapeId===land)!
write('actual-native-economics688-applicability-before-normalization.READONLY.json',app)
const c=read(canpath)
const appdeltas=[]
for(const g of c.goals){if(!selected.includes(g.id))continue;const native=app.goals.find(x=>x.goalId===g.id)!;if(JSON.stringify(g.applicability)!==JSON.stringify(native.compiledApplicability))appdeltas.push({goalId:g.id,before:g.applicability,after:native.compiledApplicability,evidence:native.evidence});g.applicability=native.compiledApplicability}
write(canpath,c);write('native-capsule/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json',c)
write('actual-bounded-app-only-native-deltas.READONLY.json',appdeltas)
const canonical=normalizeCanonicalLandscape(c), index=buildCanonicalGraphIndex(canonical)
const nativeCanonicalDiagnostics=validateCanonicalLandscape(canonical,index)
// Actual requires-DAG check on complete candidate. The unchanged native
// canonical authoring checker checks contains; do not mislabel that as requires.
const by=new Map(c.goals.map((g:any)=>[g.id,g])),visiting=new Set<string>(),done=new Set<string>(),cycles:string[][]=[],missing:string[]=[]
function visit(id:string,chain:string[]){if(visiting.has(id)){cycles.push([...chain,id]);return}if(done.has(id))return;const g=by.get(id) as any;if(!g){missing.push(id);return}visiting.add(id);for(const r of g.requires??[])if(!r.includes(':'))visit(r,[...chain,id]);visiting.delete(id);done.add(id)}
for(const g of c.goals)visit(g.id,[])
const dag={nativeContainsDiagnostics:nativeCanonicalDiagnostics,actualOwnRequiresCycles:cycles,actualOwnMissingLocalRequires:missing,actualGoalIDsUnique:by.size===c.goals.length}
write('actual-schema-structure-contains-and-requires-DAG.READONLY.json',dag)

const spec=read('positive-v2-four-goal-authoring-spec.AUTHOR-INERT.json'), criteria=hash(readFileSync(resolve(out,'candidate-criteria.md')))
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const schema=JSON.parse(readFileSync(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),'utf8'))
const validate=ajv.compile(schema),records=[],bindings=[]
for(const candidate of spec.goals){const goal=by.get(candidate.goalId) as any
 const record={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,
 reviewId:spec.reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteria,
 landscapeId:land,goalId:goal.id,goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),
 reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,{},'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(candidate.profile),
 status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:spec.reviewedAt,reviewer:spec.reviewer,reason:candidate.reason,
 evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:[],profile:candidate.profile}
 const schemaValid=validate(record),semanticErrors=validatePositiveGoalEvidenceRecordSemantics(record as any,goal,{},'curricularAtomic')
 bindings.push({goalId:goal.id,schemaValid,schemaErrors:schemaValid?[]:validate.errors,semanticErrors,goalFingerprint:record.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint})
 records.push(record)
}
writeFileSync(resolve(out,'four-native-fingerprinted-P-v2-E1G1-candidates.INERT.jsonl'),records.map(x=>JSON.stringify(x)).join('\n')+'\n')
write('actual-native-four-P-v2-schema-and-bindings-only.READONLY.json',{effectiveKindIsProposedContentClassificationNotAGateApproval:true,activeSemanticLedgerWrites:false,records:bindings,criteriaFingerprint:criteria})

function flatten(ns:any[]):string[]{return ns.flatMap(n=>[...(n.sourceGoalId?[n.sourceGoalId]:[]),...flatten(n.children??[])])}
// Exact native Memory relevance predicates copied from bound memoryCardReview.ts lines 211-229.
// This is a technical counting definition, not an A/M reviewer decision.
function ordinaryForNativeMemory(g:any):boolean {const tags=new Set<string>(g.tags??[]);return !(g.contains?.length)&&!tags.has('Practice')&&!tags.has('Assessment')&&!tags.has('Motivation')&&!tags.has('Orientation')&&g.nodeKind!=='memory'&&!tags.has('memorization')&&![...tags].some(t=>t.startsWith('srs-deck:'))&&!g.examData}
const currentWhole=JSON.parse(readFileSync(resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'),'utf8'))
const ordinaryIDs=new Set(c.goals.filter(ordinaryForNativeMemory).map((g:any)=>g.id))
const currentOrdinaryIDs=new Set(currentWhole.goals.filter(ordinaryForNativeMemory).map((g:any)=>g.id))
const targetCounts=[] as any[]
const views=[]
for(const name of readdirSync(resolve(out,'view-candidates')).filter(x=>x.endsWith('.view.json')).sort()){
 const v=normalizeCompositionView(read('view-candidates/'+name)),compiled=compileCompositionView(v,canonical),roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,index.goalById),visible=flatten(compiled.compiledRootNodes)
 targetCounts.push({name,scope:v.scope,wholeTargetCount:roles.targetGoalIds.size,ordinaryTargetCount:[...roles.targetGoalIds].filter(id=>ordinaryIDs.has(id)).length,ordinaryPrerequisiteOnlyCount:[...roles.prerequisiteOnlyGoalIds].filter(id=>ordinaryIDs.has(id)&&!roles.targetGoalIds.has(id)).length,wholeTargetIDs:[...roles.targetGoalIds].sort(),ordinaryTargetIDs:[...roles.targetGoalIds].filter(id=>ordinaryIDs.has(id)).sort()})
 views.push({name,scope:v.scope,targetCount:roles.targetGoalIds.size,visibleCount:visible.length,duplicateVisibleIds:visible.filter((x,i)=>visible.indexOf(x)!==i),findings:compiled.findings,
 actualNewAndReboundRoles:selected.map(id=>({id,role:roles.targetGoalIds.has(id)?'target':roles.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'absent'})),
 sourceCourseObligationProvenByCompilation:false})
}
write('actual-native35views-final-targeted-compilation.READONLY.json',views)
const appFinal=buildApplicabilityCompilation().reports.find(x=>x.landscapeId===land)!
write('actual-native-economics688-applicability-final.READONLY.json',appFinal)
write('actual-current336-candidate342-and-35-native-target-sets.READONLY.json',{definition:'Exact isLeaf/isMemoryGoal/isReviewRelevantGoal predicates from bound native memoryCardReview.ts; proposed new ordinary kinds are author classifications, not current A/M approvals.',currentActiveOrdinaryCount:currentOrdinaryIDs.size,candidateOrdinaryCount:ordinaryIDs.size,addedIDs:[...ordinaryIDs].filter(id=>!currentOrdinaryIDs.has(id)).sort(),lostIDs:[...currentOrdinaryIDs].filter(id=>!ordinaryIDs.has(id)).sort(),viewTargetSets:targetCounts,wholeSourceMappingCountsDoNotProveNormativeCoverage:true,M6M7Approval:false})
const checks={wholeCandidateGoals:c.goals.length,newOrdinaryPRecords:records.length,allFourPValid:bindings.every(x=>x.schemaValid&&!x.semanticErrors.length),containsErrors:nativeCanonicalDiagnostics.filter(x=>x.severity==='error').length,requiresCycles:cycles.length,missingRequires:missing.length,views:views.length,viewCompileErrors:views.filter(x=>x.findings.some(f=>f.severity==='error')).length,duplicateVisibleIDs:views.reduce((s,x)=>s+x.duplicateVisibleIds.length,0),currentActiveOrdinaryCount:currentOrdinaryIDs.size,candidateOrdinaryCount:ordinaryIDs.size,appErrors:appFinal.summary.errors,appWarningsFinal:appFinal.summary.warnings,appWarningsBeforeNormalization:app.summary.warnings,appOnlyDeltas:appdeltas.map(x=>x.goalId),localPracticeCovered:c.goals.find((g:any)=>g.id===local).examData.coveredGoalIds,wholeSourceM2M6M7Approval:false}
write('actual-bounded-native-check-summary.READONLY.json',checks)
console.log(JSON.stringify(checks))
if(!checks.allFourPValid||checks.containsErrors||checks.requiresCycles||checks.missingRequires||checks.viewCompileErrors||checks.duplicateVisibleIDs||checks.appErrors)process.exitCode=1
