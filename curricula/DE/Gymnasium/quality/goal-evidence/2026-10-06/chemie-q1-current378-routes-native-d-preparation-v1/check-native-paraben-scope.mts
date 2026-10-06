import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { buildApplicabilityCompilation } from '../../../../../../../app/scripts/applicabilityCompiler.ts'

const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1'
const stage=process.argv[2]
if(!stage) throw new Error('Missing actual stage')
const id='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const targets=['0d59b62e-d3f9-5969-b961-0c5e26316c04','4cb74d76-99f1-5264-b1e3-448cda47b005','3d6699ae-ebbd-5a55-8798-b809a9d74f0a','18819a59-2442-530f-a7c3-26755398ec66','d3cd250f-5221-589d-aa1c-44a4692d1acb','171b47e2-2c53-50f2-a145-a26b896fd73f']
const read=(path:string)=>JSON.parse(readFileSync(resolve(process.cwd(),path),'utf8'))
const canonicalPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const raw=read(canonicalPath)
const ledger=read('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
const kind=new Map(ledger.decisions.map((d:any)=>[d.goalId,d.semanticKind]))
const compilation=buildApplicabilityCompilation()
const report=compilation.reports.find(r=>r.landscapeId===id)
if(!report) throw new Error('Missing native chemistry applicability report')
const rawBy=new Map(raw.goals.map((g:any)=>[g.id,g]))
const configured=read('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
const directBindings:any[]=[]
for(const path of configured.mappingPaths){
 const mapping=read(path)
 for(const d of mapping.decisions ?? []){
  const targetIds=[...(d.targetGoalIds ?? []),...(d.canonicalGoalIds ?? []),...(d.canonicalGoalId?[d.canonicalGoalId]:[])]
  if(targetIds.some((goalId:string)=>targets.includes(goalId))) directBindings.push({mappingPath:path,sourceExtractionPath:mapping.sourceExtractionPath,decision:d})
 }
 for(const m of mapping.mappings ?? []) if(targets.includes(m.canonicalGoalId)) directBindings.push({mappingPath:path,sourceExtractionPath:mapping.sourceExtractionPath,mapping:m})
}
const selected=report.goals.filter(g=>targets.includes(g.goalId)).map(g=>({
 ...g,semanticKind:kind.get(g.goalId),rawApplicability:(rawBy.get(g.goalId) as any)?.applicability,
 rawMappingInheritanceBoundary:(rawBy.get(g.goalId) as any)?.extendedData?.applicabilityMappingInheritance??null,
 directSourceEvidence:g.evidence.filter(e=>e.kind==='mapping'||e.kind==='provenance'),
 assessmentEvidence:g.evidence.filter(e=>e.kind==='assessment-requires'),
 sourceCoverageIsNotAssessmentRequires:true,
}))
const byTargets=report.goals.filter(g=>g.compiledApplicability.jurisdiction?.includes('DE-BY')).map(g=>({goalId:g.goalId,semanticKind:kind.get(g.goalId),evidence:g.evidence.filter(e=>e.value==='DE-BY')}))
const receipt={schemaVersion:1,stage,createdAtUTC:new Date().toISOString(),canonicalSHA256:createHash('sha256').update(readFileSync(canonicalPath)).digest('hex'),
 allCanonicalGoalIds:raw.goals.map((g:any)=>g.id),
 allCurricularAtomicGoalIds:ledger.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId),
 compiledRawBYCurricularAtomicGoalIds:byTargets.filter(g=>g.semanticKind==='curricularAtomic').map(g=>g.goalId),
 nativeSourceEvidenceByCanonicalGoal:report.goals.map(g=>({goalId:g.goalId,semanticKind:kind.get(g.goalId),compiledApplicability:g.compiledApplicability,sourceEvidence:g.evidence.filter(e=>e.kind==='mapping'||e.kind==='provenance')})),
 nativeChemistryApplicabilitySummary:report.summary,nativeChemistryProjections:report.projections,
 nativeChemistryWarningsAndErrors:report.findings.filter(f=>f.severity==='error'||f.severity==='warning'),
 selected,rawBYTargetGoalIds:byTargets.map(g=>g.goalId),rawBYTargets:byTargets,
 targetRelatedNativeFindings:report.findings.filter(f=>f.goalId&&targets.includes(f.goalId)),directSourceMappingBindings:directBindings,
 sourceAtlasOwnReceiptPath:configured.outputDirectory+'/source-projection.receipt.json',
 nativeCompilerModified:false,newSourceReview:false,scienceReviewDecision:null,activeWrites:false,humanApproval:false}
writeFileSync(resolve(own,stage+'.paraben-native-scope.actual.json'),JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({stage,selected:selected.map(g=>({goalId:g.goalId,compiledApplicability:g.compiledApplicability,sourceEvidence:g.directSourceEvidence,assessmentEvidence:g.assessmentEvidence})),rawBYTargets:byTargets.length,chemistryFindings:report.summary}))
