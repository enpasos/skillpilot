import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildApplicabilityCompilation } from '../../../../../../../app/scripts/applicabilityCompiler'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-active-integration-independent-b-v1/'
const path='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const raw=JSON.parse(readFileSync(path,'utf8')); const canonical=normalizeCanonicalLandscape(raw)
const graph=new Map(canonical.goals.map(g=>[g.id,g]))
const carrier='ac9e824f-003c-50ac-8751-2b8456004c63'
const report=buildApplicabilityCompilation().reports.find(r=>r.landscapeId===raw.landscapeId)!
const actual=report.goals.find(g=>g.goalId===carrier)!
const rows=[]
for (const jurisdiction of ['DE-MV','DE-SN','DE-ST','DE-TH']) {
  const visible=report.goals.filter(g=>g.goalType==='atomic'&&g.compiledApplicability.jurisdiction?.includes(jurisdiction)).map(g=>g.goalId)
  const nativeView=normalizeCompositionView({viewFormatVersion:'1.0',viewId:'independent-b-role-reproduction-'+jurisdiction.toLowerCase(),landscapeId:raw.landscapeId,language:'de-DE',title:'Read-only projection role reproduction',scope:{schoolForm:'Gymnasium',jurisdiction,stage:'CrossStage'},rootNodes:[{kind:'structure',id:'bounded-role-proof',label:'Biologie',children:visible.map(goalId=>({kind:'goalEntry',goalId,...(goalId===carrier?{projectionRole:'prerequisiteOnly'}:{})}))}]})
  const compiled=compileCompositionView(nativeView,canonical)
  const roles=collectCompositionProjectionRoleGoalIds(nativeView.rootNodes,graph)
  if(compiled.findings.some(f=>f.severity==='error')||roles.targetGoalIds.has(carrier)||!roles.prerequisiteOnlyGoalIds.has(carrier)||visible.some(id=>id!==carrier&&!roles.targetGoalIds.has(id)))throw new Error('Native explicit role reproduction failed '+jurisdiction)
  const evidence=actual.evidence.filter(e=>e.value===jurisdiction)
  if(evidence.some(e=>e.kind==='mapping'||e.kind==='provenance')||!evidence.some(e=>e.kind==='requires-closure'))throw new Error('Direct carrier source evidence unexpectedly added '+jurisdiction)
  rows.push({jurisdiction,actualRawAvailableAtomicCount:visible.length,actualCarrierEvidence:evidence,legitimateExplicitTargetCount:roles.targetGoalIds.size,allOtherRawTargetsRetained:true,carrierPrerequisiteOnly:true,nativeCompilationErrors:[],productionViewAuthoredByThisReviewer:false,proofIsNotAProductionOrSourceApproval:true})
}
const result={schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'Actual read-only carrier CQR-003/applicability-role diagnosis after bounded integration checks; no overall PASS',verdict:'REVISE',goalId:carrier,actualCompiledApplicability:actual.compiledApplicability,actualEvidence:actual.evidence,codeReason:'applicabilityCompiler ensureRequiredGoalVisible produces requires-closure availability; CQR falls back to raw available atoms when no jurisdiction composition-view target set exists. sourceContextBoundary has no authored projectionRole semantics.',existingLegitimateMechanism:'Complete explicit jurisdiction composition views preserving all other target IDs and placing the carrier in a goalEntry with projectionRole prerequisiteOnly. Direct goalEntry roles override inherited subtree roles. CQR/readCompositionViewAtomicGoalIds uses rendered targets; prerequisites remain available for mastery checks.',readOnlyNativeRoleReproductions:rows,sourceMappingsToCarrierStillOnlyBEBB:true,noExceptionOrInventedSourceEvidence:true,requiresEdgesMustRemain:true,nationalFullGUIViewsMustRemain174And443:true,wholeOriginalSourceHoldsRemain:true,separateCarrierImageFaultReportedByOwner:true,affectedCurrentVDPBindingsRequireNewImageAndFinalContextChecks:true,priorBoundedChecksAreTimestampedEvidenceOnly:true,activeWrites:false,humanApproval:false,sourceFiles:[path,'app/scripts/applicabilityCompiler.ts','app/scripts/generateCurriculumQualityStatus.ts','app/src/utils/authoring/compositionViewAuthoring.ts'].map(path=>({path,sha256:createHash('sha256').update(readFileSync(resolve(path))).digest('hex')}))}
writeFileSync(own+'carrier-projection-role-diagnosis.independent-b.actual.json',JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({verdict:'REVISE',actualCarrierAvailability:actual.compiledApplicability,explicitExistingRoleProofs:rows.map(r=>({jurisdiction:r.jurisdiction,raw:r.actualRawAvailableAtomicCount,targets:r.legitimateExplicitTargetCount,prerequisiteOnly:true})),activeWrites:false}))
